import * as GUI from 'babylonjs-gui';

export class Player3D {
	name: string;
	score: number;
	scoreText: GUI.TextBlock;

	constructor(name: string) {
		this.name = name;
		this.score = 0;
		// Crée le TextBlock pour afficher le score
		this.scoreText = new GUI.TextBlock(name + "scoreMessage");
		this.scoreText.text = this.score.toString();
		this.scoreText.color = "#f9d3d9";
		this.scoreText.fontSize = 30;
		this.scoreText.fontFamily = "Mochiy Pop P One"; // Police kawaii
		this.scoreText.outlineWidth = 4; // Contour pour contraste
        this.scoreText.outlineColor = "#333"; // Contour sombre
	}

	// Méthode pour placer le score sur l'interface GUI
 	// x et y en pixels (par exemple, pour positionner le score sur le canvas)
	drawScore(x: number, y: number, advancedTexture: GUI.AdvancedDynamicTexture): void {
		this.scoreText.left = x + "%";
		this.scoreText.top = y + "%";
		
		// On vérifie si le contrôle a déjà été ajouté à l'advancedTexture
		if (!advancedTexture.getControlByName(this.name + "scoreMessage")) {
			advancedTexture.addControl(this.scoreText);
		}
	}
}