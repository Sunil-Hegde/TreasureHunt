import "./style.css";
import Phaser from "phaser";
import { StartScene } from "./scenes/StartScene";
import { GameScene } from "./scenes/GameScene.js";
import { CafeScene } from "./scenes/CafeScene.js";
import { HomeScene } from "./scenes/HomeScene.js";

const config = {
  type: Phaser.CANVAS,
  width: 1920,
  height: 1080,
  canvas: document.getElementById("gameContainer"),
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [StartScene, GameScene, CafeScene, HomeScene],
};

const game = new Phaser.Game(config);
