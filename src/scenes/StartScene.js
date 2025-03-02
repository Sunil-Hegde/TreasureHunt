import Phaser from "phaser";

export class StartScene extends Phaser.Scene {
  constructor() {
    super("scene-start");
  }

  preload() {
    // Optional: Load a background image for the start screen
    this.load.image("start-bg", "assets/first-bg.jpg");
  }

  create() {
    // Add background
    const bg = this.add
      .image(0, 0, "start-bg")
      .setOrigin(0, 0)
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
      .setAlpha(0.7); // Slightly transparent

    // Create a dark overlay
    this.add
      .rectangle(
        0,
        0,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.6
      )
      .setOrigin(0, 0);

    // Game title
    this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 3 - 100,
        "TREASURE HUNT",
        {
          fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
          fontSize: "80px",
          color: "#FFD700", // Gold color
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 6,
          shadow: {
            offsetX: 3,
            offsetY: 3,
            color: "#000",
            blur: 5,
            stroke: true,
            fill: true,
          },
        }
      )
      .setOrigin(0.5);

    // Game description
    const gameDescription = [
      "Explore the city and find hidden treasures!",
      "Visit the House, Cafe, and Bank to uncover clues.",
      "",
      "You only have 10 minutes to solve the mystery!",
      "Use arrow keys to move around the map.",
      "Press ESC to exit buildings.",
    ];

    this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        gameDescription,
        {
          fontFamily: "Arial",
          fontSize: "26px",
          color: "#FFFFFF",
          align: "center",
          lineSpacing: 15,
        }
      )
      .setOrigin(0.5);

    // Press enter to start text with blinking effect
    const startText = this.add
      .text(
        this.cameras.main.width / 2,
        (this.cameras.main.height * 3) / 4 + 50,
        "Press ENTER to Start",
        {
          fontFamily: "Arial",
          fontSize: "32px",
          color: "#FFFFFF",
          fontStyle: "bold",
        }
      )
      .setOrigin(0.5);

    // Add blinking effect
    this.tweens.add({
      targets: startText,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Set up input to start game
    this.input.keyboard.once("keydown-ENTER", () => {
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start("scene-game");
      });
    });
  }
}
