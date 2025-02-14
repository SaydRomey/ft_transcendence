export class Paddle {
	x: number;
	y: number;
	width: number;
	height: number;
	dy: number; 
	movingUp: boolean;
	movingDown: boolean;

	constructor(x: number, y: number) {
		this.x = x; // Position horizontale (à droite)
		this.y = y - 50; // Position verticale (au centre) (changé le -50 si on change height)
		this.width = 10; // Largeur de la raquette
		this.height = 100; // Hauteur de la raquette
		this.dy = 4; // Vitesse de déplacement vertical
		this.movingUp = false;
		this.movingDown = false;
	}

	// Fonction pour dessiner les raquettes
	draw(ctx: CanvasRenderingContext2D) : void {
		ctx.fillStyle = "white";  // Couleur des raquettes
		ctx.fillRect(this.x, this.y, this.width, this.height);  // Dessine un rectangle
	}

	update(canvasHeight: number): void {
		if (this.movingUp && this.y > 0) {
			this.y -= this.dy;
		}
		if (this.movingDown && this.y + this.height < canvasHeight) {
			this.y += this.dy;
		}
	}

	reset(canvasHeight: number) : void {
		this.y = canvasHeight;
	}
}