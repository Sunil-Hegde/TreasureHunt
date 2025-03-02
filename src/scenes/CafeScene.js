import Phaser from "phaser";

export class CafeScene extends Phaser.Scene {
  constructor() {
    super("scene-cafe");
    this.conversationStep = 0;
    this.speechBubble = null;
    this.playerSpeechBubble = null;
    this.wifiAttempted = false;
  }

  preload() {
    // Fix the path - try using the exact path that works in your project
    this.load.image("cafe-interior", "assets/CafePage/insideCafe.webp");
    this.load.image("cafelady", "assets/CafePage/cafeLady.png");
    this.load.image("guy", "assets/MapPage/character.png");
    // Add the phone image to preload
    this.load.image("phone", "assets/CafePage/phone.png");
  }

  create() {
    // Add the cafe interior background
    const background = this.add
      .image(0, 0, "cafe-interior")
      .setOrigin(0, 0)
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    // Add cafe lady
    const CafeLady = this.add.image(750, 255, "cafelady").setOrigin(0, 0);

    // Add the player directly in front of the lady
    // Position the guy directly in front of the lady across the table
    const guy = this.add.image(850, 550, "guy").setOrigin(0.5, 0.5);
    guy.setScale(0.1); // Make the player slightly smaller for better appearance

    // Add a speech bubble above the cafe lady with a welcome message
    this.speechBubble = this.createSpeechBubble(
      825,
      270,
      300,
      80,
      "Welcome to our Cafe! What can I get you today?"
    );

    // Add conversation continuation button
    const continueButton = this.add
      .rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height - 100,
        200,
        50,
        0x4a7a8c
      )
      .setOrigin(0.5);

    const continueText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height - 100,
        "Continue",
        {
          fontFamily: "Arial, sans-serif",
          fontSize: "20px",
          color: "#FFFFFF",
        }
      )
      .setOrigin(0.5);

    continueButton
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => (continueButton.fillColor = 0x5b8ca0))
      .on("pointerout", () => (continueButton.fillColor = 0x4a7a8c))
      .on("pointerdown", () => this.advanceConversation());

    // Add hint text for Enter key
    this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height - 60,
        "Press ENTER to continue",
        {
          fontFamily: "Arial, sans-serif",
          fontSize: "16px",
          color: "#FFFFFF",
          backgroundColor: "#000000",
          padding: { x: 8, y: 4 },
        }
      )
      .setOrigin(0.5);

    // Setup Enter key for advancing conversation - FIXED VERSION
    this.enterKey = this.input.keyboard.addKey("ENTER");
    this.enterKey.on("down", this.handleEnterKey, this);

    // ESC key to exit - FIXED VERSION
    this.escKey = this.input.keyboard.addKey("ESC");
    this.escKey.on("down", this.handleEscKey, this);

    // Simple exit button
    const exitButton = this.add
      .rectangle(100, 50, 150, 50, 0x000000, 0.7)
      .setOrigin(0.5);

    const exitText = this.add
      .text(100, 50, "Exit Cafe", {
        fontFamily: "Arial, sans-serif",
        fontSize: "20px",
        color: "#FFFFFF",
      })
      .setOrigin(0.5);

    exitButton
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => (exitButton.fillColor = 0x333333))
      .on("pointerout", () => (exitButton.fillColor = 0x000000))
      .on("pointerdown", () => this.exitCafe(false));
  }

  // Helper method to create a speech bubble
  createSpeechBubble(x, y, width, height, quote) {
    // Clear any existing speech bubbles at this position
    if (
      this.speechBubble &&
      this.speechBubble.x === x - width / 2 &&
      this.speechBubble.y === y - height - 20
    ) {
      this.speechBubble.clear();
      if (this.speechText) this.speechText.destroy();
    }

    const bubbleWidth = width;
    const bubbleHeight = height;
    const bubblePadding = 10;
    const arrowHeight = 20;

    // Create speech bubble shape
    const bubble = this.add.graphics({
      x: x - bubbleWidth / 2,
      y: y - bubbleHeight - arrowHeight,
    });

    // Draw bubble background
    bubble.fillStyle(0xffffff, 0.9);
    bubble.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);

    // Draw the arrow/pointer
    bubble.fillStyle(0xffffff, 0.9);
    bubble.beginPath();
    bubble.moveTo(bubbleWidth / 2 - 10, bubbleHeight);
    bubble.lineTo(bubbleWidth / 2, bubbleHeight + arrowHeight);
    bubble.lineTo(bubbleWidth / 2 + 10, bubbleHeight);
    bubble.closePath();
    bubble.fillPath();

    // Add speech text
    const content = this.add.text(0, 0, quote, {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#000000",
      align: "center",
      wordWrap: { width: bubbleWidth - bubblePadding * 2 },
    });

    // Center the text in the bubble
    const bounds = content.getBounds();
    content.setPosition(
      bubble.x + bubbleWidth / 2 - bounds.width / 2,
      bubble.y + bubbleHeight / 2 - bounds.height / 2
    );

    this.speechText = content;
    return bubble;
  }

  // Create player speech bubble
  createPlayerSpeechBubble(quote) {
    if (this.playerSpeechBubble) {
      this.playerSpeechBubble.clear();
      if (this.playerSpeechText) this.playerSpeechText.destroy();
    }

    const x = 850;
    const y = 430;
    const width = 300;
    const height = 80;

    this.playerSpeechBubble = this.createSpeechBubble(
      x,
      y,
      width,
      height,
      quote
    );
    return this.playerSpeechBubble;
  }

  // Advance the conversation when continue button is clicked
  advanceConversation() {
    // If phone is showing, handle it differently
    if (this.phoneContainer && this.phoneContainer.visible) {
      this.handlePhoneInteraction();
      return;
    }

    this.conversationStep++;

    switch (this.conversationStep) {
      case 1:
        // Player's first response
        if (this.speechBubble) this.speechBubble.clear();
        if (this.speechText) this.speechText.destroy();
        this.createPlayerSpeechBubble("I would like to have some coffee.");
        break;

      case 2:
        // Barista's response
        if (this.playerSpeechBubble) this.playerSpeechBubble.clear();
        if (this.playerSpeechText) this.playerSpeechText.destroy();
        this.speechBubble = this.createSpeechBubble(
          825,
          270,
          300,
          80,
          "Sure! One coffee coming right up!"
        );
        break;

      case 3:
        // Player asks about price
        if (this.speechBubble) this.speechBubble.clear();
        if (this.speechText) this.speechText.destroy();
        this.createPlayerSpeechBubble("How much do I need to pay?");
        break;

      case 4:
        // Barista tells the price
        if (this.playerSpeechBubble) this.playerSpeechBubble.clear();
        if (this.playerSpeechText) this.playerSpeechText.destroy();
        this.speechBubble = this.createSpeechBubble(
          825,
          270,
          300,
          80,
          "That will be 50 Rs, please."
        );
        break;

      case 5:
        // Show the phone popup
        if (this.speechBubble) this.speechBubble.clear();
        if (this.speechText) this.speechText.destroy();
        this.showPhonePopup();
        break;

      case 6:
        // End conversation after phone interaction
        if (this.phoneContainer) this.phoneContainer.destroy();
        this.speechBubble = this.createSpeechBubble(
          825,
          270,
          300,
          80,
          "Thank you for visiting our cafe! Come again!"
        );
        break;

      case 7:
        // Exit after complete conversation
        this.exitCafe(false);
        break;
    }
  }

  // Add a new method to show the phone popup
  showPhonePopup() {
    // Create a container for the phone popup and all its elements
    this.phoneContainer = this.add.container(0, 0);
    this.phoneState = "payment-failed";

    // Add a dark overlay behind the phone
    const overlay = this.add
      .rectangle(
        0,
        0,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.7
      )
      .setOrigin(0);
    this.phoneContainer.add(overlay);

    // Add the phone image at the center of the screen
    const phone = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "phone"
    );

    // Scale the phone to appropriate size
    const scale = 0.3;
    phone.setScale(scale);
    this.phoneContainer.add(phone);

    // Create the message container for dynamic content
    this.phoneMessageContainer = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    );
    this.phoneContainer.add(this.phoneMessageContainer);

    // Show the initial payment failed message
    this.showPaymentFailedMessage();

    // Setup new Enter key handler specifically for the phone
    this.phoneEnterKey = this.input.keyboard.addKey("ENTER");
    this.phoneEnterKey.on("down", () => {
      this.handlePhoneInteraction();
    });
  }

  // Method to show payment failed message
  showPaymentFailedMessage() {
    // Clear any previous messages
    this.phoneMessageContainer.removeAll(true);

    // Create a white background for the error message
    const msgBackground = this.add
      .rectangle(0, 0, 300, 150, 0xffffff)
      .setOrigin(0.5);
    this.phoneMessageContainer.add(msgBackground);

    // Add an error icon (red circle with X)
    const errorIcon = this.add.graphics();
    errorIcon.fillStyle(0xff0000, 1);
    errorIcon.fillCircle(0, -40, 25);
    errorIcon.fillStyle(0xffffff, 1);
    errorIcon.fillRect(-15, -45, 30, 10);
    errorIcon.fillRect(-15, -40, 30, 10);
    this.phoneMessageContainer.add(errorIcon);

    // Add the payment failed text
    const failedText = this.add
      .text(0, 0, "Payment Failed\nNo Internet Connection", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#000000",
        align: "center",
      })
      .setOrigin(0.5);
    this.phoneMessageContainer.add(failedText);

    // Add the connect button
    const connectButton = this.add
      .rectangle(0, 60, 200, 40, 0x4287f5)
      .setOrigin(0.5);

    const connectText = this.add
      .text(0, 60, "Connect to Cafe WiFi", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#FFFFFF",
      })
      .setOrigin(0.5);

    connectButton
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => (connectButton.fillColor = 0x5a9af8))
      .on("pointerout", () => (connectButton.fillColor = 0x4287f5))
      .on("pointerdown", () => this.showWifiWarning());

    this.phoneMessageContainer.add(connectButton);
    this.phoneMessageContainer.add(connectText);

    // Add hint text at the bottom
    const hintText = this.add
      .text(0, 110, "Press ENTER to connect or ESC to exit cafe", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#666666",
      })
      .setOrigin(0.5);
    this.phoneMessageContainer.add(hintText);
  }

  // Method to show WiFi warning
  showWifiWarning() {
    this.phoneState = "wifi-warning";

    // Clear the previous messages
    this.phoneMessageContainer.removeAll(true);

    // Create background for the warning
    const warnBackground = this.add
      .rectangle(0, 0, 320, 200, 0xffffff)
      .setOrigin(0.5);
    this.phoneMessageContainer.add(warnBackground);

    // Add warning icon (triangle with !)
    const warnIcon = this.add.graphics();
    warnIcon.fillStyle(0xffbb00, 1);
    warnIcon.fillTriangle(-25, -20, 25, -20, 0, -60);
    warnIcon.fillStyle(0x000000, 1);
    warnIcon.fillRect(-4, -50, 8, 20);
    warnIcon.fillRect(-4, -25, 8, 8);
    this.phoneMessageContainer.add(warnIcon);

    // Add warning text with stronger wording
    const warnText = this.add
      .text(
        0,
        20,
        "WARNING: This is an unsecured public WiFi.\nYour data may be at risk!\nDo you want to connect anyway?",
        {
          fontFamily: "Arial",
          fontSize: "16px",
          color: "#000000",
          align: "center",
        }
      )
      .setOrigin(0.5);
    this.phoneMessageContainer.add(warnText);

    // Add connect anyway button
    const connectButton = this.add
      .rectangle(-80, 90, 120, 40, 0x4287f5)
      .setOrigin(0.5);

    const connectText = this.add
      .text(-80, 90, "Connect", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#FFFFFF",
      })
      .setOrigin(0.5);

    connectButton
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => (connectButton.fillColor = 0x5a9af8))
      .on("pointerout", () => (connectButton.fillColor = 0x4287f5))
      .on("pointerdown", () => {
        this.wifiAttempted = true;
        this.showWifiRisks();
      });

    // Add cash button
    const cashButton = this.add
      .rectangle(80, 90, 120, 40, 0x32cd32) // Green color for cash option
      .setOrigin(0.5);

    const cashText = this.add
      .text(80, 90, "Pay Cash", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#FFFFFF",
      })
      .setOrigin(0.5);

    cashButton
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => (cashButton.fillColor = 0x50e050))
      .on("pointerout", () => (cashButton.fillColor = 0x32cd32))
      .on("pointerdown", () => this.showCashPayment());

    this.phoneMessageContainer.add(connectButton);
    this.phoneMessageContainer.add(connectText);
    this.phoneMessageContainer.add(cashButton);
    this.phoneMessageContainer.add(cashText);

    // Add keyboard hint
    const keyboardHint = this.add
      .text(0, 130, "Press ENTER to connect, ESC to pay with cash", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#666666",
      })
      .setOrigin(0.5);
    this.phoneMessageContainer.add(keyboardHint);
  }

  // Handle phone interactions based on current state
  handlePhoneInteraction() {
    if (this.phoneState === "payment-failed") {
      this.showWifiWarning();
    } else if (this.phoneState === "wifi-warning") {
      this.wifiAttempted = true;
      this.showWifiRisks();
    } else if (this.phoneState === "cash-payment") {
      this.completePhoneInteraction();
    } else if (this.phoneState === "wifi-risks") {
      this.exitCafe(true); // Exit with WiFi attempted flag
    }
  }

  // Complete phone interaction and continue the conversation
  completePhoneInteraction() {
    // Advance to the next conversation step
    if (this.phoneContainer) this.phoneContainer.destroy();

    // Continue the conversation
    this.conversationStep++; // Move to step 6
    this.speechBubble = this.createSpeechBubble(
      825,
      270,
      300,
      80,
      "Thank you for visiting our cafe! Come again!"
    );

    // Clean up phone-specific key handlers
    if (this.phoneEnterKey) {
      this.phoneEnterKey.removeAllListeners();
    }
  }

  // New method to show WiFi risks when attempting to connect
  showWifiRisks() {
    this.phoneState = "wifi-risks";

    // Clear the previous messages
    this.phoneMessageContainer.removeAll(true);

    // Create background for the warning
    const riskBackground = this.add
      .rectangle(0, 0, 340, 220, 0xffffff)
      .setOrigin(0.5);
    this.phoneMessageContainer.add(riskBackground);

    // Add warning icon
    const riskIcon = this.add.graphics();
    riskIcon.fillStyle(0xff0000, 1);
    riskIcon.fillCircle(0, -60, 30);
    riskIcon.fillStyle(0xffffff, 1);
    riskIcon.fillRect(-20, -60, 40, 8);
    this.phoneMessageContainer.add(riskIcon);

    // Add risk text
    const riskText = this.add
      .text(
        0,
        0,
        "SECURITY RISK ALERT!\n\nPublic WiFi networks can expose you to:\n• Identity theft\n• Banking information theft\n• Data interception\n• Malware infection",
        {
          fontFamily: "Arial",
          fontSize: "16px",
          color: "#000000",
          align: "center",
          lineSpacing: 5,
        }
      )
      .setOrigin(0.5);
    this.phoneMessageContainer.add(riskText);

    // Add exit button
    const exitButton = this.add
      .rectangle(0, 90, 180, 40, 0xff0000)
      .setOrigin(0.5);

    const exitText = this.add
      .text(0, 90, "Exit Café", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#FFFFFF",
      })
      .setOrigin(0.5);

    exitButton
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => (exitButton.fillColor = 0xff3333))
      .on("pointerout", () => (exitButton.fillColor = 0xff0000))
      .on("pointerdown", () => {
        // Just exit the cafe with WiFi attempted flag set to true
        this.exitCafe(true);
      });

    this.phoneMessageContainer.add(exitButton);
    this.phoneMessageContainer.add(exitText);

    // Add keyboard hint
    const keyboardHint = this.add
      .text(0, 130, "Press ENTER to exit cafe", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#666666",
      })
      .setOrigin(0.5);
    this.phoneMessageContainer.add(keyboardHint);
  }

  // Add method to show game over screen when connecting to unsecure WiFi
  showGameOver() {
    // Remove all phone UI
    this.phoneMessageContainer.removeAll(true);

    // Expand phone container to fill screen for game over
    if (this.phoneContainer) {
      this.phoneContainer.removeAll(true);
    }

    // Add red background for the hack alert
    const hackBackground = this.add
      .rectangle(
        0,
        0,
        this.cameras.main.width,
        this.cameras.main.height,
        0xaa0000
      )
      .setOrigin(0);
    this.add.existing(hackBackground);

    // Add flashing skull or warning symbol
    const hackIcon = this.add.graphics();
    hackIcon.x = this.cameras.main.width / 2;
    hackIcon.y = this.cameras.main.height / 3 - 50;

    // Draw skull or hacker symbol
    hackIcon.fillStyle(0xffffff, 1);
    // Simple skull shape
    hackIcon.fillCircle(0, 0, 60);
    hackIcon.fillStyle(0xaa0000, 1);
    hackIcon.fillCircle(-20, -15, 15); // Left eye
    hackIcon.fillCircle(20, -15, 15); // Right eye
    hackIcon.fillRect(-30, 20, 60, 10); // Mouth

    // Make it flash
    this.tweens.add({
      targets: hackIcon,
      alpha: 0.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Add scary text
    const hackText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        "YOUR DEVICE HAS BEEN COMPROMISED!\n\nNever connect to unsecured public WiFi networks\nfor sensitive transactions.",
        {
          fontFamily: "Arial",
          fontSize: "32px",
          color: "#FFFFFF",
          align: "center",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
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

    // Add restart button
    const restartButton = this.add
      .rectangle(
        this.cameras.main.width / 2,
        (this.cameras.main.height * 3) / 4,
        250,
        60,
        0x000000,
        0.8
      )
      .setOrigin(0.5);

    const restartText = this.add
      .text(
        this.cameras.main.width / 2,
        (this.cameras.main.height * 3) / 4,
        "Restart Game",
        {
          fontFamily: "Arial",
          fontSize: "24px",
          color: "#FFFFFF",
        }
      )
      .setOrigin(0.5);

    // Make button interactive
    restartButton
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => (restartButton.fillColor = 0x333333))
      .on("pointerout", () => (restartButton.fillColor = 0x000000))
      .on("pointerdown", () => this.restartGame());

    // Add press enter to restart hint
    const restartHint = this.add
      .text(
        this.cameras.main.width / 2,
        (this.cameras.main.height * 3) / 4 + 50,
        "Press ENTER to restart",
        {
          fontFamily: "Arial",
          fontSize: "18px",
          color: "#FFFFFF",
        }
      )
      .setOrigin(0.5);

    // Set up enter key for restart
    const enterKey = this.input.keyboard.addKey("ENTER");
    enterKey.on("down", () => {
      this.restartGame();
    });
  }

  // Add method for cash payment
  showCashPayment() {
    this.phoneState = "cash-payment";

    // Clear the previous messages
    this.phoneMessageContainer.removeAll(true);

    // Create background for the success message
    const successBg = this.add
      .rectangle(0, 0, 320, 180, 0xffffff)
      .setOrigin(0.5);
    this.phoneMessageContainer.add(successBg);

    // Add cash payment icon
    const cashIcon = this.add.graphics();
    cashIcon.fillStyle(0x008800, 1); // Green
    cashIcon.fillCircle(0, -40, 30);
    cashIcon.fillStyle(0xffffff, 1);
    cashIcon.fillRect(-15, -40, 30, 7);
    cashIcon.fillRect(-4, -55, 8, 30);
    this.phoneMessageContainer.add(cashIcon);

    // Add success message
    const successText = this.add
      .text(
        0,
        20,
        "Smart choice! You paid with cash.\nYour personal information is safe.\n+100 SECURITY POINTS",
        {
          fontFamily: "Arial",
          fontSize: "16px",
          color: "#000000",
          align: "center",
        }
      )
      .setOrigin(0.5);
    this.phoneMessageContainer.add(successText);

    // Add continue button
    const continueButton = this.add
      .rectangle(0, 90, 180, 40, 0x008800)
      .setOrigin(0.5);

    const continueText = this.add
      .text(0, 90, "Continue", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#FFFFFF",
      })
      .setOrigin(0.5);

    continueButton
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => (continueButton.fillColor = 0x00aa00))
      .on("pointerout", () => (continueButton.fillColor = 0x008800))
      .on("pointerdown", () => this.completePhoneInteraction());

    this.phoneMessageContainer.add(continueButton);
    this.phoneMessageContainer.add(continueText);

    // Add keyboard hint
    const keyboardHint = this.add
      .text(0, 130, "Press ENTER to continue", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#666666",
      })
      .setOrigin(0.5);
    this.phoneMessageContainer.add(keyboardHint);
  }

  // Add method to restart game
  restartGame() {
    // Return to the starting scene to restart the game
    this.scene.start("scene-start");
  }

  // New methods to handle keyboard input
  handleEnterKey() {
    console.log("ENTER key pressed");
    if (this.phoneContainer && this.phoneContainer.visible) {
      this.handlePhoneInteraction();
    } else {
      this.advanceConversation();
    }
  }

  handleEscKey() {
    console.log("ESC key pressed");
    if (this.phoneContainer && this.phoneContainer.visible) {
      if (this.phoneState === "wifi-warning") {
        this.showCashPayment();
      } else {
        this.exitCafe(this.wifiAttempted);
      }
    } else {
      this.exitCafe(false);
    }
  }

  // Add proper cleanup method
  cleanupKeyListeners() {
    if (this.enterKey) {
      this.enterKey.removeAllListeners();
    }
    if (this.escKey) {
      this.escKey.removeAllListeners();
    }
    if (this.phoneEnterKey) {
      this.phoneEnterKey.removeAllListeners();
    }
  }

  exitCafe(wifiAttempted) {
    console.log("Exiting cafe, wifi attempted:", wifiAttempted);

    // Clean up all keyboard listeners
    this.cleanupKeyListeners();

    // If they paid cash (i.e., avoided wifi), set the points flag
    const cashPaymentMade = this.phoneState === "cash-payment";

    // Return to the game scene with data indicating we came from cafe
    this.scene.start("scene-game", {
      fromCafe: true,
      cafeWiFiAttempted: wifiAttempted || this.wifiAttempted,
      cafeCashPayment: cashPaymentMade,
    });
  }
}
