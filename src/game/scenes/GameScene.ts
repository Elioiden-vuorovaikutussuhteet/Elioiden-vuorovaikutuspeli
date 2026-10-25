import Phaser from "phaser";
import ParticleManager from "../managers/ParticleManager";
import Organism from "../entities/organism";
import InfoButton from "../entities/infobutton";
import CameraManager from "../managers/CameraManager";
import ArrowManager, { type OrganismSpawn } from "../managers/ArrowManager";
import OrganismManager from "../managers/OrganismManager";
import InteractionManager from "../managers/InteractionManager";
import ConnectionManager from "../managers/ConnectionManager";
import { ScoreManager } from "../managers/ScoreManager";
import type { Connection } from "../types/Connection";

export default class GameScene extends Phaser.Scene {
  private cameraManager!: CameraManager;
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;

  private arrowManager!: ArrowManager;
  private particleManager!: ParticleManager;
  private interactionManager!: InteractionManager;
  private organismManager!: OrganismManager;
  private connectionManager!: ConnectionManager;
  private scoreManager!: ScoreManager;

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
    this.load.image("antfootbacteria_sprite", "antfootbacteria.png");
    this.load.image("sapota_sprite", "sapota.png");
    this.load.image("diazotroph_sprite", "diazotroph.png");
    this.load.image("mycorrhizahelper_sprite", "mycorrhizabacteria.png");
    this.load.image("pos_particle", "pos_particle.png");
    this.load.image("neg_particle", "neg_particle.png");
  }

  create() {
    this.cameraManager = new CameraManager(this);
    this.uiCamera = this.cameraManager.getUICamera();
    this.scoreManager = new ScoreManager(this, 1000);

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    const organismPositions: Record<string, OrganismSpawn> = {
      acacia: { type: "acacia", x: centerX, y: centerY - 260 },
      diazotroph: { type: "diazotroph", x: centerX - 520, y: centerY - 185 },
      ants: { type: "ants", x: centerX - 260, y: centerY },
      sapota: { type: "sapota", x: centerX + 260, y: centerY },
      antfootbacteria: {
        type: "antfootbacteria",
        x: centerX - 520,
        y: centerY + 185,
      },
      mycorrhizahelper: {
        type: "mycorrhizahelper",
        x: centerX + 520,
        y: centerY + 185,
      },
      amf: { type: "amf", x: centerX, y: centerY + 260 },
    };

    const organismSpawnOrder = [
      organismPositions.ants,
      organismPositions.sapota,
      organismPositions.antfootbacteria,
      organismPositions.diazotroph,
      organismPositions.mycorrhizahelper,
    ];

    const interactions: Connection[] = [];
    const rightConnections: Connection[] = [];
    const organismMap = new Map<string, Organism>();

    this.particleManager = new ParticleManager(this, this.uiCamera);

    this.organismManager = new OrganismManager(
      this,
      this.uiCamera,
      organismMap,
      rightConnections,
      (organism) => this.arrowManager.arrowChecker(organism),
      (x, y, amount) => this.particleManager.healthChanged(x, y, amount),
    );
    this.interactionManager = new InteractionManager(
      organismMap,
      interactions,
      (fromId, toId) => {
        this.arrowManager.playArrowPulseAnimation(fromId, toId);
      },
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
      this.scoreManager,
      interactions,
      organismSpawnOrder,
    );

    this.arrowManager.createArrowButtons(centerY);
    this.organismManager.createOrganism(
      organismPositions.acacia.x,
      organismPositions.acacia.y,
      organismPositions.acacia.type,
    );

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
    this.scene.bringToTop("MenuScene");

    const infobutton = new InfoButton(this, 40, 40);

    // Make main camera ignore the button so it stays fixed
    this.cameras.main.ignore(infobutton);

    infobutton.on("infoButtonClicked", () => {
      this.scene.launch("TutorialScene");
    });

    this.events.once("menuClosed", () => {
      // Resume game scene
      this.scene.resume();
      this.time.delayedCall(3000, () => {
        this.organismManager.createOrganism(
          organismPositions.amf.x,
          organismPositions.amf.y,
          organismPositions.amf.type,
        );
      });
    });
  }

  update() {
    this.cameraManager.update();
    this.arrowManager.update();
  }
}
