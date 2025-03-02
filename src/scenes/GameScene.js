import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.player = null;
    this.cursors = null;
    this.homeZone = null;
    this.cafeZone = null;
    this.bankZone = null;
    this.popup = null;
    this.messageBox = null;
    this.popupText = null;
    this.isPlayerInHouse = false;
    this.isPlayerInCafe = false;
    this.isPlayerInBank = false;
    this.timerText = null;
    this.timeRemaining = 600;
    this.score = 0;
    this.scoreText = null;
    this.homeCompleted = false;
    this.avoidedPublicWifi = true;
    this.cafeWiFiAttempted = false;
    this.cafePointsAwarded = false;

    this.lastPosition = {
      x: 0,
      y: 0,
    };

    this.returningFromScene = false;
  }

  init(data) {
    this.isPlayerInHouse = false;
    this.isPlayerInCafe = false;
    this.isPlayerInBank = false;

    if (data && data.fromCafe) {
      console.log(
        "Returned from cafe, wifi attempted:",
        data.cafeWiFiAttempted
      );

      if (data.cafeWiFiAttempted) {
        this.cafeWiFiAttempted = true;
        this.avoidedPublicWifi = false;

        this.time.delayedCall(300, () => {
          this.showPointsNotification(
            "Warning! Public WiFi risks your data security"
          );
        });
      }

      if (
        data.cafeCashPayment &&
        !data.cafeWiFiAttempted &&
        !this.cafePointsAwarded
      ) {
        this.cafePointsAwarded = true;
        this.updateScore(100);

        this.time.delayedCall(300, () => {
          this.showPointsNotification(
            "Smart choice! +100 points for avoiding public WiFi"
          );
        });
      }
    }
  }

  preload() {
    this.load.image("bg", "assets/MapPage/background.png");
    this.load.image("home", "assets/MapPage/home.png");
    this.load.image("character", "assets/MapPage/character.png");
    this.load.image("messagebox", "assets/MapPage/MessageBox.png");
    this.load.image("cafe", "assets/MapPage/cafe.png");
    this.load.image("bank", "assets/MapPage/bank.png");
    this.load.image("ArrowKeys", "assets/MapPage/arrowKeys.png");
    this.load.image("logo", "assets/MapPage/logo.png");

    this.load.bitmapFont(
      "pixelFont",
      "assets/fonts/pixel.png",
      "assets/fonts/pixel.xml"
    );
  }

  create() {
    this.createBackground();
    this.createHome();
    this.createCafe();
    this.createBank();
    this.createPlayer();
    this.createControls();
    this.createPopup();
    this.createArrowKeys();
    this.createTimer();
    this.createScoreboard(); // Add this line
    this.createLogo();

    this.setupCollisions();

    if (this.returningFromScene) {
      this.handleSceneReturn();
    }

    this.input.keyboard.on("keydown-ESC", this.handleEscKey, this);

    this.enterKey = this.input.keyboard.addKey("ENTER");
    this.enterKey.reset();
  }

  createBackground() {
    const bgWidth = this.cameras.main.width;
    const bgHeight = this.cameras.main.height;
    const bg = this.add.image(0, 0, "bg").setOrigin(0, 0);
    bg.setDisplaySize(bgWidth, bgHeight);
  }

  createHome() {
    const homeSize = 300;
    const homeX = 425;
    const homeY = 300;
    const home = this.add.image(homeX, homeY, "home").setOrigin(0, 0);
    home.setDisplaySize(homeSize, homeSize);

    this.homeZone = this.add
      .zone(homeX + 50, homeY + 100, homeSize - 100, homeSize - 100)
      .setOrigin(0, 0)
      .setRectangleDropZone(homeSize - 100, homeSize - 100);

    this.physics.world.enable(this.homeZone);
  }

  createCafe() {
    const cafeSize = 300;
    const cafeX = 850;
    const cafeY = 50;
    const cafe = this.add.image(cafeX, cafeY, "cafe").setOrigin(0, 0);
    cafe.setDisplaySize(cafeSize, cafeSize);

    this.cafeZone = this.add
      .zone(cafeX + 50, cafeY + 100, cafeSize - 100, cafeSize - 100)
      .setOrigin(0, 0)
      .setRectangleDropZone(cafeSize - 100, cafeSize - 100);

    this.physics.world.enable(this.cafeZone);
  }

  createBank() {
    const bankSize = 250;
    const bankX = 1150;
    const bankY = 800;
    const bank = this.add.image(bankX, bankY, "bank").setOrigin(0, 0);
    bank.setDisplaySize(bankSize, bankSize);

    this.bankZone = this.add
      .zone(bankX + 50, bankY + 100, bankSize - 100, bankSize - 100)
      .setOrigin(0, 0)
      .setRectangleDropZone(bankSize - 100, bankSize - 100);

    this.physics.world.enable(this.bankZone);
  }

  createPlayer() {
    this.player = this.physics.add.sprite(0, 750, "character");
    this.player.setDisplaySize(100, 100);
    this.player.setCollideWorldBounds(true);
  }

  createControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  createPopup() {
    this.popup = this.add.container(0, 0);

    this.messageBox = this.add.image(0, 0, "messagebox");
    this.messageBox.setOrigin(0.5, 0.5);
    this.messageBox.flipX = true;
    this.messageBox.flipY = false;
    this.messageBox.setScale(0.3);

    this.popupText = this.add.text(
      0,
      0,
      "You entered a building!\nPress ESC to exit.",
      {
        font: "24px Arial",
        fill: "#000000",
        align: "center",
        wordWrap: { width: this.messageBox.displayWidth - 60 },
      }
    );
    this.popupText.setOrigin(0.5, 0.5);

    this.popup.add([this.messageBox, this.popupText]);
    this.popup.setVisible(false);
  }

  positionPopup(x, y, flipX = true, flipY = false) {
    this.popup.setPosition(x, y);
    this.messageBox.flipX = flipX;
    this.messageBox.flipY = flipY;
  }

  setupCollisions() {
    this.physics.add.overlap(
      this.player,
      this.homeZone,
      this.enterHome,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.cafeZone,
      this.enterCafe,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.bankZone,
      this.enterBank,
      null,
      this
    );
  }

  handleSceneReturn() {
    if (this.returnSource === "cafe") {
      this.player.setPosition(
        this.cafeZone.x + this.cafeZone.width + 80,
        this.cafeZone.y + this.cafeZone.height
      );
    }

    this.player.setVisible(true);
    this.popup.setVisible(false);
  }

  enterCafe(player, zone) {
    if (!this.isPlayerInHouse && !this.isPlayerInCafe && !this.isPlayerInBank) {
      if (this.cafeWiFiAttempted) {
        this.positionPopup(750, 450, false, true);
        this.popupText.setText(
          "The cafe is now closed.\nThe staff asked you to leave after your unsafe WiFi usage."
        );
        this.popup.setVisible(true);

        this.time.delayedCall(3000, () => {
          this.popup.setVisible(false);
        });

        return;
      }

      this.lastPosition = { x: this.player.x, y: this.player.y };

      this.isPlayerInCafe = true;
      this.player.setVisible(false);

      this.positionPopup(750, 450, false, true);

      this.popupText.setText(
        "Welcome to the cafe!\nPress ENTER to go inside or ESC to leave."
      );
      this.popup.setVisible(true);

      if (this.enterKey) {
        this.enterKey.removeAllListeners();
      }

      this.enterKey.on("down", this.handleCafeEnter, this);
    }
  }

  handleCafeEnter() {
    if (this.isPlayerInCafe) {
      this.cleanupBeforeSceneChange();
      this.scene.start("scene-cafe");
    }
  }

  enterHome(player, zone) {
    if (!this.isPlayerInHouse && !this.isPlayerInCafe && !this.isPlayerInBank) {
      this.lastPosition = { x: this.player.x, y: this.player.y };

      this.isPlayerInHouse = true;
      player.setVisible(false);

      this.positionPopup(950, 250);

      this.popupText.setText(
        "Welcome to your house!\nPress ENTER to go inside or ESC to leave."
      );
      this.popup.setVisible(true);

      if (this.enterKey) {
        this.enterKey.removeAllListeners();
      }

      this.enterKey.on("down", this.handleHomeEnter, this);
    }
  }

  handleHomeEnter() {
    if (this.isPlayerInHouse) {
      window.location.href = "https://secure-code-x-home.vercel.app/";
    }
  }

  enterBank(player, zone) {
    if (!this.isPlayerInHouse && !this.isPlayerInCafe && !this.isPlayerInBank) {
      this.lastPosition.x = player.x;
      this.lastPosition.y = player.y;

      this.isPlayerInBank = true;
      player.setVisible(false);

      this.positionPopup(1650, 700);
      this.popupText.setText("You entered the bank!\nPress ESC to exit.");
      this.popup.setVisible(true);
    }
  }

  handleEscKey() {
    if (this.isPlayerInHouse || this.isPlayerInCafe || this.isPlayerInBank) {
      this.exitBuilding();
    }
  }

  exitBuilding() {
    let positionOffset = 80;

    if (this.isPlayerInHouse) {
      this.isPlayerInHouse = false;
      this.player.setPosition(
        this.homeZone.x + this.homeZone.width + positionOffset,
        this.homeZone.y + this.homeZone.height
      );

      if (!this.homeCompleted) {
        this.homeCompleted = true;
        this.updateScore(100);

        this.showPointsNotification("Home tasks completed! +100 points");
      }
    } else if (this.isPlayerInCafe) {
      this.isPlayerInCafe = false;
      this.player.setPosition(
        this.cafeZone.x + this.cafeZone.width + positionOffset,
        this.cafeZone.y + this.cafeZone.height
      );
    } else if (this.isPlayerInBank) {
      this.isPlayerInBank = false;
      this.player.setPosition(
        this.bankZone.x + this.bankZone.width + positionOffset,
        this.bankZone.y + this.bankZone.height
      );
    }

    this.player.setVisible(true);
    this.popup.setVisible(false);

    this.cleanupKeyListeners();
  }

  showPointsNotification(message) {
    const notification = this.add
      .text(this.cameras.main.width / 2, 200, message, {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#00ff00",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: notification,
      y: 150,
      alpha: 0,
      duration: 2000,
      ease: "Power2",
      onComplete: () => {
        notification.destroy();
      },
    });
  }

  cleanupBeforeSceneChange() {
    this.popup.setVisible(false);
    this.cleanupKeyListeners();
  }

  cleanupKeyListeners() {
    this.enterKey.reset();
  }

  createArrowKeys() {
    const ArrowKeysSize = 300;
    const ArrowKeysX = 50;
    const ArrowKeysY = 850;

    const ArrowKeys = this.add
      .image(ArrowKeysX, ArrowKeysY, "ArrowKeys")
      .setOrigin(0, 0);
    ArrowKeys.setDisplaySize(ArrowKeysSize, ArrowKeysSize);

    this.add
      .text(
        ArrowKeysX + ArrowKeysSize / 2,
        ArrowKeysY + 30,
        "Use arrow keys to move around",
        {
          font: "24px Arial",
          fill: "#000000",
          backgroundColor: "transparent",
          padding: { x: 10, y: 5 },
        }
      )
      .setOrigin(0.5);

    const barrierZone = this.add
      .zone(
        ArrowKeysX - 10,
        ArrowKeysY - 10,
        ArrowKeysSize + 100,
        ArrowKeysSize + 100
      )
      .setOrigin(0, 0);

    this.physics.world.enable(barrierZone, Phaser.Physics.Arcade.STATIC_BODY);
    this.physics.add.collider(this.player, barrierZone);
  }

  createTimer() {
    const timerBg = this.add
      .rectangle(this.cameras.main.width - 150, 50, 200, 70, 0x000000, 0.5)
      .setOrigin(0.5);

    this.add
      .text(this.cameras.main.width - 150, 25, "Time Left:", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const initialMinutes = Math.floor(this.timeRemaining / 60);
    const initialSeconds = this.timeRemaining % 60;
    const initialTimeDisplay = `${initialMinutes
      .toString()
      .padStart(2, "0")}:${initialSeconds.toString().padStart(2, "0")}`;

    if (this.textures.exists("pixelFont")) {
      this.timerText = this.add
        .bitmapText(
          this.cameras.main.width - 150,
          60,
          "pixelFont",
          initialTimeDisplay,
          32
        )
        .setOrigin(0.5);
    } else {
      this.timerText = this.add
        .text(this.cameras.main.width - 150, 60, initialTimeDisplay, {
          fontFamily: "monospace",
          fontSize: "32px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
    }

    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });
  }

  updateTimer() {
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.handleTimeUp();
    } else {
      this.timeRemaining -= 1;
    }

    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;

    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
    this.timerText.setText(formattedTime);

    if (this.timeRemaining <= 30) {
      if (this.textures.exists("pixelFont")) {
        this.timerText.setTint(0xff0000);
      } else {
        this.timerText.setColor("#ff0000");
      }
    }
  }

  handleTimeUp() {
    this.scene.pause();

    const gameOverBox = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      500,
      300,
      0x000000,
      0.8
    );

    const gameOverText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 80,
        "Time's Up!",
        {
          fontFamily: "Arial",
          fontSize: "48px",
          color: "#ffffff",
          fontStyle: "bold",
        }
      )
      .setOrigin(0.5);

    const scoreText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        `Final Score: ${this.score}`,
        {
          fontFamily: "Arial",
          fontSize: "32px",
          color: "#ffff00",
          fontStyle: "bold",
        }
      )
      .setOrigin(0.5);

    const restartText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 80,
        "Press R to restart",
        {
          fontFamily: "Arial",
          fontSize: "24px",
          color: "#ffffff",
        }
      )
      .setOrigin(0.5);

    this.input.keyboard.once("keydown-R", () => {
      this.scene.restart();
    });
  }

  createScoreboard() {
    const scoreboardBg = this.add
      .rectangle(this.cameras.main.width - 350, 50, 200, 70, 0x000000, 0.5)
      .setOrigin(0.5);

    this.add
      .text(this.cameras.main.width - 350, 25, "Score:", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.scoreText = this.add
      .text(this.cameras.main.width - 350, 50, this.score.toString(), {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }

  updateScore(points) {
    this.score += points;
    this.scoreText.setText(this.score.toString());
  }

  createLogo() {
    const logoSize = 150;
    const logoX = 50;
    const logoY = 20;

    const logo = this.add.image(logoX, logoY, "logo").setOrigin(0, 0);
    logo.setDisplaySize(logoSize + 100, logoSize);
  }

  update() {
    if (!this.isPlayerInHouse && !this.isPlayerInCafe && !this.isPlayerInBank) {
      this.handlePlayerMovement();
    }
  }

  handlePlayerMovement() {
    const speed = 300;

    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }
  }
}
