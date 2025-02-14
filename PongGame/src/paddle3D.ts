import * as BABYLON from 'babylonjs';

export class Paddle3D {
	mesh: BABYLON.Mesh;
	width: number;
	height: number;
	depth: number;
	dy: number;
	movingUp: boolean;
	movingDown: boolean;
	initialY: number; // On stocke la position initiale en Y
	/**
	 * @param scene La scène BabylonJS.
	 * @param width La largeur du paddle (en unités).
	 * @param height La hauteur du paddle (en unités).
	 * @param depth La profondeur du paddle (en unités).
	 * @param x Position X initiale.
	 * @param y Position Y initiale.
	 */
	constructor(
	scene: BABYLON.Scene,
	width: number,
	height: number,
	depth: number,
	x: number,
	y: number
	) {
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.dy = 0.3; // Vitesse de déplacement (en unités par frame ou par update)
		this.movingUp = false;
		this.movingDown = false;
		this.initialY = y; // On sauvegarde la position initiale

		// Crée le paddle comme une boîte
		this.mesh = BABYLON.MeshBuilder.CreateBox("paddle", { width: this.width, height: this.height, depth: this.depth }, scene);
		// Positionne le paddle sur le plan XY
		this.mesh.position = new BABYLON.Vector3(x, y, 0);
	}

	update(sceneHeight: number): void {
		const halfSceneHeight = sceneHeight / 2;
		// Calculer les limites en fonction de la hauteur du paddle
		const upperLimit = halfSceneHeight - (this.height / 2);
		const lowerLimit = -halfSceneHeight + (this.height / 2);
		
		// Si le paddle doit se déplacer vers le haut et qu'il ne dépasse pas le bord supérieur
		if (this.movingUp && (this.mesh.position.y + this.height / 2 < halfSceneHeight + 1.5)) {
			this.mesh.position.y += this.dy;
		}
		// Si le paddle doit se déplacer vers le bas et qu'il ne dépasse pas le bord inférieur
		if (this.movingDown && (this.mesh.position.y - this.height / 2 > -halfSceneHeight - 1.5)) {
			this.mesh.position.y -= this.dy;
		}
	}
	// update(sceneHeight: number): void {
	// 	const halfSceneHeight = sceneHeight / 2;
	// 	// Calculer les limites en fonction de la hauteur du paddle
	// 	const upperLimit = halfSceneHeight - (this.height / 2);
	// 	const lowerLimit = -halfSceneHeight + (this.height / 2);
		
	// 	// Si le paddle doit monter et que son centre est en dessous de la limite supérieure
	// 	if (this.movingUp && this.mesh.position.y < upperLimit) {
	// 		this.mesh.position.y += this.dy;
	// 		if (this.mesh.position.y > upperLimit) {
	// 		this.mesh.position.y = upperLimit;
	// 		}
	// 	}
	// 	// Si le paddle doit descendre et que son centre est au-dessus de la limite inférieure
	// 	if (this.movingDown && this.mesh.position.y > lowerLimit) {
	// 		this.mesh.position.y -= this.dy;
	// 		if (this.mesh.position.y < lowerLimit) {
	// 		this.mesh.position.y = lowerLimit;
	// 		}
	// 	}
	// }
	

	/**
	* Réinitialise le paddle à une position verticale donnée (par exemple, le centre de la zone de jeu).
	* @param y La position verticale de réinitialisation.
	*/
	reset(): void {
		this.mesh.position.y = this.initialY;
	}
}

// export class Paddle3D {
// 	mesh: BABYLON.Mesh;
// 	width: number;
// 	height: number;
// 	dy: number;
// 	movingUp: boolean;
// 	movingDown: boolean;

// 	/**
// 	 * @param scene - La scène BabylonJS dans laquelle créer le paddle.
// 	 * @param x - La position horizontale initiale.
// 	 * @param y - La position verticale initiale (on passera la position centrée).
// 	 */
// 	constructor(scene: BABYLON.Scene, x: number, y: number) {
// 		// On garde les mêmes valeurs pour width et height que ta version 2D
// 		this.width = 10 / 30; 
// 		this.height = 100 / 30;
// 		this.dy = 4 / 30; // Vitesse de déplacement
// 		this.movingUp = false;
// 		this.movingDown = false;

// 		// Crée un mesh de type boîte pour représenter le paddle.
// 		// On fixe une profondeur arbitraire (ici 10) pour donner du volume en 3D.
// 		this.mesh = BABYLON.MeshBuilder.CreateBox("paddle", { width: this.width, height: this.height, depth: 5 }, scene);

// 		// Position initiale : en 2D, tu faisais "this.y = y - 50" pour centrer verticalement.
// 		// Ici, on positionne le mesh de sorte que son centre soit à (x, y - height/2, 0)
// 		// Cela permet de garder le même positionnement "visuel" que ta version 2D.
// 		this.mesh.position = new BABYLON.Vector3(x, y, 0);
// 	}

// 	/**
// 	 * Met à jour la position verticale du paddle en fonction des flags movingUp et movingDown.
// 	 * @param canvasHeight - La hauteur de la zone de jeu (pour limiter le déplacement).
// 	 */
// 	update(canvasHeight: number): void {
// 		// On vérifie que le paddle ne dépasse pas le haut ou le bas de la zone de jeu.
// 		if (this.movingUp && this.mesh.position.y + this.height / 2 < canvasHeight) {
// 		this.mesh.position.y += this.dy;
// 		}
// 		if (this.movingDown && this.mesh.position.y - this.height / 2 > 0) {
// 		this.mesh.position.y -= this.dy;
// 		}
// 	}

// 	/**
// 	 * Réinitialise la position verticale du paddle.
// 	 * @param canvasHeight - La hauteur de la zone de jeu.
// 	 */
// 	reset(canvasHeight: number): void {
// 		// Remet le paddle au centre verticalement
// 		this.mesh.position.y = canvasHeight / 2;
// 	}
// }
