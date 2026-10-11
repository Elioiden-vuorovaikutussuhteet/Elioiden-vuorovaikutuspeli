import Phaser from "phaser";
import Organism from "../entities/organism";
import InfoButton from "../entities/infobutton";
import CameraManager from "../managers/CameraManager";
import ArrowManager from "../managers/ArrowManager";
import OrganismManager from "../managers/OrganismManager";
import InteractionManager from "../managers/InteractionManager";
import ConnectionManager from "../managers/ConnectionManager";
import type { Connection } from "../types/Connection";

export default class GameScene extends Phaser.Scene {
  private cameraManager!: CameraManager;
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;

  private arrowManager!:  ArrowManager;
  private interactionManager!: InteractionManager;
  private organismManager!: OrganismManager;
  private connectionManager!: ConnectionManager;

  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("acacia_sprite", "bullhornacacia.png");
    this.load.image("amf_sprite", "amf.png");
    this.load.image("greenbutton", "greenbutton.png");
    this.load.image("redbutton", "redbutton.png");
    this.load.image("infobutton_sprite", "altinfo.png");
    this.load.image("ants_sprite", "ants.png");
    this.load.image("sapota_sprite", "sapota.png");
  }

  create() {
    this.cameraManager = new CameraManager(this);
    this.uiCamera = this.cameraManager.getUICamera();

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    const interactions: Connection[] = [];
    const rightConnections: Connection[] = [];
    const organismMap = new Map<string, Organism>();

    this.organismManager = new OrganismManager(
      this,
      this.uiCamera,
      organismMap,
      rightConnections,
      (organism) =>
      this.arrowManager.arrowChecker(organism),
    )
    this.interactionManager = new InteractionManager(
      organismMap,
      interactions,
    );

    this.connectionManager = new ConnectionManager(
      rightConnections,
      interactions,
    );

    this.arrowManager = new ArrowManager(
      this,
      this.uiCamera,
      this.interactionManager,
      this.connectionManager,
      this.organismManager,
      interactions,
    );

    this.arrowManager.createArrowButtons(centerY)
    this.organismManager.createOrganism(centerX, centerY - 200, "acacia",);

    //Eventlistener for: If players clicks on empty space, preview arrow disappears
    this.input.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        currentlyOver: Phaser.GameObjects.GameObject[],
      ) => {
        if (currentlyOver.length === 0) {
          this.arrowManager.clearPreview();
        }
      },
    );

    // Pause the game scene when menu is up
    this.scene.pause();
    this.scene.launch("MenuScene");
    this.scene.bringToTop('MenuScene');

    const infobutton = new InfoButton(this, 40, 40);

    // Make main camera ignore the button so it stays fixed
    this.cameras.main.ignore(infobutton);

    infobutton.on("infoButtonClicked", () => {
      this.scene.launch("TutorialScene");
    });

    this.events.once("menuClosed", () => {
      // Resume game scene
      this.scene.resume()
      this.time.delayedCall(3000, () => {
        this.organismManager.createOrganism(centerX, centerY + 200, "amf");
      });
    });
  }

  update() {

    this.cameraManager.update();
    this.arrowManager.update();
  }
}