import Phaser from "phaser";
import ParticleManager from "../managers/ParticleManager";
import Organism from "../entities/organism";
import { organisms } from "../data/organisms"; // adjust path
import InfoButton from "../entities/infobutton";
import HintButton from "../entities/hintbutton";
import CameraManager from "../managers/CameraManager";
import ArrowManager from "../managers/ArrowManager";
import OrganismManager from "../managers/OrganismManager";
import InteractionManager from "../managers/InteractionManager";
import ConnectionManager from "../managers/ConnectionManager";
import { ScoreManager } from "../managers/ScoreManager";
import type { Connection } from "../types/Connection";
import CursorManager from "../managers/CursorManager";

export default class GameScene extends Phaser.Scene {
  private cameraManager!: CameraManager;
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;

  private arrowManager!: ArrowManager;
  private particleManager!: ParticleManager;
  private interactionManager!: InteractionManager;
  private organismManager!: OrganismManager;
  private connectionManager!: ConnectionManager;
  private scoreManager!: ScoreManager;
  private cursorManager!: CursorManager;

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
    this.load.image("cursor", "cursor.png");
  }

  create() {
    this.cameraManager = new CameraManager(this);
    this.uiCamera = this.cameraManager.getUICamera();
    this.scoreManager = new ScoreManager(this, 1000);

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

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
      (fromId, toId, hpChange) => {
        this.arrowManager.playArrowPulseAnimation(fromId, toId, hpChange);
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
    );
    this.cursorManager = new CursorManager(this, this.arrowManager);

    this.arrowManager.createArrowButtons(centerY);
    this.cursorManager.createCursorButton(centerY);
    //First organism is the first in organisms.ts
    const initialOrganism = organisms[0];

    this.organismManager.createOrganism(
      centerX + initialOrganism.offsetX, centerY + initialOrganism.offsetY, initialOrganism.id
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

    //Second organism is the second in organisms.ts
    const secondOrganism = organisms[1];
    
    const hintbutton = new HintButton(this, 240, 40);
    this.cameras.main.ignore(hintbutton);

    hintbutton.on("hintButtonClicked", () => {
      const missing = this.connectionManager.getMissingConnections();
      if (missing.length === 0) return;

      this.scoreManager.loseMoney(100);

      const hint = missing[0];
      organismMap.get(hint.from)?.highlight();
      organismMap.get(hint.to)?.highlight();
    });

    this.events.once("menuClosed", () => {
      // Resume game scene
      this.scene.resume();
      this.time.delayedCall(3000, () => {
        console.log(secondOrganism)
        this.organismManager.createOrganism(
          centerX + secondOrganism.offsetX, centerY + secondOrganism.offsetY, secondOrganism.id
        );
      });
    });
  }

  update() {
    this.cameraManager.update();
    this.arrowManager.update();
  }
}
