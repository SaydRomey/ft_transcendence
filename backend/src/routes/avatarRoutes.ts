// File: backend/src/routes/avatarRoutes.ts

import { FastifyInstance } from 'fastify';
import { fileTypeFromBuffer } from 'file-type';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { sendError } from "../utils/error.js";

// Resolve __dirname and paths correctly in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function avatarRoutes(fastify: FastifyInstance) {

  // Directory for default avatars
  const DEFAULT_AVATAR_DIR = path.join(__dirname, "../../img/avatars");

  // Directory for storing avatars
  const AVATAR_UPLOAD_DIR = path.join(__dirname, "../../uploads/avatars");

  // Default avatar URL
  const DEFAULT_AVATAR_URL = "/avatars/default/default_cat.webp";

  // Ensure the uploads directory exists
  if (!fs.existsSync(AVATAR_UPLOAD_DIR)) {
    fs.mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });
  }

  // Serve default avatars (from 'backend/img/avatars') under '/avatars/default/'
  await fastify.register(fastifyStatic, {
    root: DEFAULT_AVATAR_DIR,
    prefix: "/avatars/default/",
    decorateReply: false,
  });

  // Serve uploaded avatars (from 'backend/uploads/avatars') under '/avatars/uploads/'
  await fastify.register(fastifyStatic, {
    root: AVATAR_UPLOAD_DIR,
    prefix: "/avatars/uploads/",
    decorateReply: false,
  });

  /**
   * Upload an avatar
   * (This uses multipart/form-data; do not manually set Content-Type header on the client)
   */
  fastify.post(
    "/avatars",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const data = await request.file();
        if (!data) {
          return reply.status(400).send({
            error: "No file uploaded"
          });
        }

        // 
        const buffer = await data.toBuffer();

        const type = await fileTypeFromBuffer(buffer);

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!type || !allowedTypes.includes(type.mime)) {
          return reply.status(400).send({
            error: "Invalid file type. Allowed types: JPEG, PNG, WEBP"
          });
        }

        // Generate a unique filename
        const baseName = path.parse(data.filename).name;
        const fileName = `${Date.now()}-${baseName}.${type.ext}`;
        const filePath = path.join(AVATAR_UPLOAD_DIR, fileName);

        fastify.log.info(`Avatar saved to: ${filePath}`); // debug

        // Resize image to a maximum of 256x256 pixels
        const resizedBuffer = await sharp(buffer)
          .resize({ width: 256, height: 256, fit: "inside" })
          .toBuffer();

        await fs.promises.writeFile(filePath, resizedBuffer);

        const avatarUrl = `/avatars/uploads/${fileName}`;

        reply.send({ message: "Avatar uploaded successfully", avatarUrl });

      } catch (error) {
        return sendError(reply, 500, "Internal Server Error during avatar upload", error);
      }
    }
  );

  /**
   * Update the user's avatar reference in the database
   */
  fastify.put<{ Body: { userId: number; avatarUrl: string } }>(
    "/avatars",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const { userId, avatarUrl } = request.body;
        if (!userId || !avatarUrl) {
          return reply.status(400).send({
            error: "Missing userId or avatarUrl"
          });
        }

        // Fetch the current avatar from the database
        const currentStmt = await fastify.db.prepare(`
          SELECT avatar
          FROM users
          WHERE id = ?
        `);
        const currentUser = await currentStmt.get(userId);

        // If the current avatar exists and is not the default, delete the file
        if (currentUser && currentUser.avatar && currentUser.avatar !== DEFAULT_AVATAR_URL) {
          const oldFilePath = path.join(AVATAR_UPLOAD_DIR, path.basename(currentUser.avatar));
          try {
            await fs.promises.unlink(oldFilePath);
            fastify.log.info(`Old avatar file deleted: ${oldFilePath}`);
          } catch (unlinkError) {
            fastify.log.error("Error deleting old avatar file", unlinkError);
          }
        }

        // Update the user record to use the new avatar URL
        const updateStmt = await fastify.db.prepare(`
          UPDATE users
          SET avatar = ?
          WHERE id = ?
        `);
        await updateStmt.run(avatarUrl, userId);
        reply.send({
          message: "Avatar updated successfully",
          avatarUrl
        });
      } catch (error) {
        return sendError(reply, 500, "Internal Server Error during avatar update", error);
      }
    }
  );

  /**
   * Remove avatar (reset to default)
   */
  fastify.delete<{ Body: { userId: number } }>(
    "/avatars",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const { userId } = request.body;
        if (!userId) return reply.status(400).send({
          error: "Missing userId"
        });

        // Get current avatar from database
        const stmt = await fastify.db.prepare(`
          SELECT avatar
          FROM users
          WHERE id = ?
        `);
        const user = await stmt.get(userId);
        if (!user) return reply.status(404).send({
          error: "User not found"
        });

        // If an avatar exists and it's not the default, attempt to delete the file
        if (user.avatar && user.avatar !== DEFAULT_AVATAR_URL) {
          const filePath = path.join(AVATAR_UPLOAD_DIR, path.basename(user.avatar));
          try {
            await fs.promises.unlink(filePath);
            fastify.log.info(`Deleted avatar file: ${filePath}`);
          } catch (unlinkError) {
            fastify.log.error("Error deleting avatar file", unlinkError);
          }
        }

        // Update the user record to revert to the default avatar
        const updateStmt = await fastify.db.prepare(`
          UPDATE users
          SET avatar = ?
          WHERE id = ?
        `);
        await updateStmt.run(DEFAULT_AVATAR_URL, userId);
        reply.send({
          message: "Avatar removed; reverted to default",
          avatarUrl: DEFAULT_AVATAR_URL
        });
      } catch (error) {
        return sendError(reply, 500, "Internal Server Error during avatar removal", error);
      }
    }
  );
}
