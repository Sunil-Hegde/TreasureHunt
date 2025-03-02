import Phaser from "phaser";

export class HomeScene extends Phaser.Scene {
  constructor() {
    super("scene-home");
    this.player = null;
    this.cursor = null;
    this.playerSpeed = 350;
    this.computer = null;
    this.idCard = null;
    this.phone = null;
    this.note = null;
    this.notePrompted = false;
    this.phoneUnlocked = false;
    this.phonePrompted = false;
    this.idPrompted = false;
    this.passwordPrompted = false;
    this.timer = 0;
    this.timerText = null;
    this.timeLimit = 600;
    this.charSize = {
      width: 100,
      height: 100,
    };
  }

  preload() {
    this.load.image("bg", "assets/HomePage/bg.jpg");
    this.load.image("player", "assets/HomePage/character.png");
    this.load.image("computer", "assets/HomePage/computer.png");
    this.load.image("phone", "assets/HomePage/phone.png");
    this.load.image("dustbin", "assets/HomePage/Dustbin.png");
    this.load.image("note", "assets/HomePage/Note.png");
    this.load.image("ID", "assets/HomePage/IDCard.png");
    this.load.image("messageBox", "assets/HomePage/MessageBox.png");
  }

  create() {
    this.add.image(0, 0, "bg").setOrigin(0, 0);
    this.setupObjects();
    this.setupPlayer();
    this.setupTimer();
    this.cursor = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.start("scene-game");
    });
    this.load.on("loaderror", function (file) {
      console.error("Error loading asset:", file.src);
    });
  }

  setupObjects() {
    this.computer = this.add
      .image(50, 268, "computer")
      .setOrigin(0, 0)
      .setDisplaySize(this.charSize.width + 160, this.charSize.height + 70)
      .setInteractive();

    this.phone = this.add
      .image(450, 165, "phone")
      .setOrigin(0, 0)
      .setDisplaySize(this.charSize.width, this.charSize.height)
      .setInteractive();

    this.note = this.add
      .image(548.3, 520, "note")
      .setOrigin(0, 0)
      .setDisplaySize(this.charSize.width, this.charSize.height)
      .setInteractive();

    this.idCard = this.add
      .image(575, 350, "ID")
      .setOrigin(0, 0)
      .setDisplaySize(this.charSize.width - 30, this.charSize.height - 30)
      .setInteractive();
  }

  setupPlayer() {
    this.player = this.physics.add
      .sprite(255, this.game.config.height - 100, "player")
      .setOrigin(0, 0);

    this.player.setDisplaySize(this.charSize.width, this.charSize.height);
    this.player.setCollideWorldBounds(true);
    this.player.setImmovable(true);
    this.player.body.allowGravity = false;
  }

  setupTimer() {
    this.timerText = this.add
      .text(this.game.config.width - 20, 20, "10:00", {
        font: "24px Arial",
        fill: "#00ff00",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
        borderRadius: 5,
      })
      .setOrigin(1, 0);

    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });
  }

  updateTimer() {
    this.timer++;
    const timeLeft = this.timeLimit - this.timer;
    if (timeLeft <= 0) {
      this.showGameOver();
      return;
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    this.timerText.setText(
      `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`
    );
  }

  update() {
    if (!this.player) return;

    // Handle player movement
    if (this.cursor.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursor.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursor.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursor.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    } else {
      this.player.setVelocityY(0);
    }
  }

  showGameOver() {
    this.scene.pause();
    // Implement game over logic here
  }

  showFlashMessage(message, color = "#ffffff") {
    // Remove existing flash message if any
    if (this.flashMessage) {
      this.flashMessage.destroy();
    }

    // Create flash message at top center of screen
    this.flashMessage = this.add
      .text(this.game.config.width / 2, 50, message, {
        font: "24px Arial",
        fill: color,
        backgroundColor: "#000000",
        padding: { x: 20, y: 10 },
        borderRadius: 8,
        stroke: "#ffffff",
        strokeThickness: 2,
        align: "center",
      })
      .setOrigin(0.5);

    // Add fade in/out animation with null check
    this.tweens.add({
      targets: this.flashMessage,
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: "Power2",
      yoyo: true,
      hold: 1000,
      onComplete: () => {
        if (this.flashMessage) {
          this.flashMessage.destroy();
          this.flashMessage = null;
        }
      },
    });
  }

  showSuccessScreen() {
    // Create a semi-transparent background
    const bg = this.add
      .rectangle(
        0,
        0,
        this.game.config.width,
        this.game.config.height,
        0x000000,
        0.8
      )
      .setOrigin(0)
      .setDepth(1);

    // Add congratulations message
    this.successMessage = this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 3,
        "🎉 Congratulations!\nYou are now a cyber criminal!\n\n" +
          "⚠️ Cybersecurity Awareness:\n" +
          "• Never use personal information as passwords\n" +
          "• Avoid using birthdays or common dates\n" +
          "• Use a mix of letters, numbers, and symbols\n" +
          "• Keep your passwords private and unique\n" +
          "• Enable two-factor authentication when possible\n\n" +
          "[Press SPACE to continue]",
        {
          font: "20px Arial",
          fill: "#ffffff",
          align: "center",
          wordWrap: { width: 600 },
          lineSpacing: 10,
        }
      )
      .setOrigin(0.5)
      .setDepth(2);

    // Add space key handler to dismiss
    const spaceKey = this.input.keyboard.addKey("SPACE");
    spaceKey.once("down", () => {
      bg.destroy();
      this.successMessage.destroy();
      this.successMessage = null;
      this.restartGame(); // Add restart call
    });
  }

  showGameOver() {
    // Create a semi-transparent background
    const bg = this.add
      .rectangle(
        0,
        0,
        this.game.config.width,
        this.game.config.height,
        0x000000,
        0.8
      )
      .setOrigin(0)
      .setDepth(1);

    // Add game over message
    this.gameOverMessage = this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 3,
        "❌ Game Over!\nTime's up!\n\n" +
          "You failed to break into the system in time.\n" +
          "Try to be faster next time!\n\n" +
          "[Press SPACE to restart]",
        {
          font: "24px Arial",
          fill: "#ff0000",
          align: "center",
          wordWrap: { width: 600 },
          lineSpacing: 10,
        }
      )
      .setOrigin(0.5)
      .setDepth(2);

    // Add space key handler to restart
    const spaceKey = this.input.keyboard.addKey("SPACE");
    spaceKey.once("down", () => {
      bg.destroy();
      this.gameOverMessage.destroy();
      this.restartGame();
    });
  }

  update() {
    const { left, right, up, down } = this.cursor;

    // Handle player movement
    if (left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    } else if (up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    } else {
      this.player.setVelocity(0);
    }

    // Calculate distances to interactive objects
    const distanceToComputer = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.computer.x,
      this.computer.y
    );

    const distanceToPhone = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.phone.x,
      this.phone.y
    );

    const distanceToNote = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.note.x,
      this.note.y
    );

    const distanceToId = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.idCard.x,
      this.idCard.y
    );

    // ID interaction
    if (distanceToId < 50) {
      if (!this.idPrompted) {
        this.idPrompted = true;
        this.showFlashMessage("ID Number: DSI2024001", "#00ff00");
      }
    } else {
      this.idPrompted = false;
    }

    // Computer interaction
    if (distanceToComputer < 150) {
      if (!this.passwordPrompted) {
        this.passwordPrompted = true;
        const option = prompt(
          "Choose option:\n1. Enter Password\n2. Enter OTP"
        );

        if (option === "1") {
          const password = prompt("Enter password for testmail@dsi.xyz:");
          if (password === "20/06/2004") {
            this.showFlashMessage(
              "Access Granted! Login successful",
              "#00ff00"
            );
            this.showSuccessScreen();
          } else {
            this.showFlashMessage(
              "Access Denied! Incorrect password",
              "#ff0000"
            );
          }
        } else if (option === "2") {
          const otp = prompt("Enter OTP:");
          if (otp === "4528") {
            this.showFlashMessage(
              "Access Granted! Login successful",
              "#00ff00"
            );
            this.showSuccessScreen();
          } else {
            this.showFlashMessage("Access Denied! Incorrect OTP", "#ff0000");
          }
        } else {
          this.showFlashMessage("Invalid option selected", "#ff0000");
        }
      }
    } else {
      this.passwordPrompted = false;
    }

    // Phone interaction
    if (distanceToPhone < 50) {
      if (!this.phonePrompted) {
        this.phonePrompted = true;
        const idInput = prompt("Enter Pin number to unlock phone:");
        if (idInput === "DSI2024001") {
          this.phoneUnlocked = true;
          this.showFlashMessage("Phone unlocked! OTP: 4528", "#00ff00");
        } else {
          this.showFlashMessage("Incorrect ID number!", "#ff0000");
        }
      }
    } else {
      this.phonePrompted = false;
    }

    // Note interaction
    if (distanceToNote < 50) {
      if (!this.notePrompted) {
        this.notePrompted = true;
        this.showFlashMessage(
          "Personal Information:\nFather: Keshav Karthik CN\nMother: Hemavathi\nDOB: 20/06/2004",
          "#ffffff"
        );
      }
    } else {
      this.notePrompted = false;
    }
  }

  restartGame() {
    // Reset all game state
    this.timer = 0;
    this.phoneUnlocked = false;
    this.phonePrompted = false;
    this.idPrompted = false;
    this.passwordPrompted = false;
    this.notePrompted = false;

    // Reset player position
    this.player.setPosition(255, this.game.config.height - 100);
    this.player.body.moves = true;

    // Reset timer color
    this.timerText.setFill("#00ff00");

    if (this.flashMessage) {
      this.flashMessage.destroy();
      this.flashMessage = null;
    }
  }
}
