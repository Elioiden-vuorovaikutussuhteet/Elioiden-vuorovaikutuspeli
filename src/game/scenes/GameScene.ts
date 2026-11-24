import Phaser from "phaser";
import GlowManager from "../managers/GlowManager";
import Organism from "../entities/organism";
import { organisms } from "../data/organisms";
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
import { glowConfig } from "../config/glowConfig";
import { gameSceneConfig, type GameSceneConfig } from "../config/sceneConfig";
import RandomEventManager from "../managers/RandomEventManager";

export default class GameScene extends Phaser.Scene {
  private cameraManager!: CameraManager;
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;

  private arrowManager!: ArrowManager;
  private glowManager!: GlowManager;
  private interactionManager!: InteractionManager;
  private organismManager!: OrganismManager;
  private connectionManager!: ConnectionManager;
  private scoreManager!: ScoreManager;
  private cursorManager!: CursorManager;
  private randomEventManager = new RandomEventManager();
  private config: GameSceneConfig;

  constructor(config?: GameSceneConfig) {
    const resolvedConfig =
      config && "images" in config ? config : gameSceneConfig;
    super(resolvedConfig.key);
    this.config = resolvedConfig;
  }

  preload() {
    this.load.setPath(this.config.assetsPath);
    for (const image of this.config.images) {
      this.load.image(image.key, image.file);
    }
  }
   
  create() {
    this.cameraManager = new CameraManager(this);
    this.uiCamera = this.cameraManager.getUICamera();
    this.scoreManager = new ScoreManager(this, this.config.startingMoney);
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    const interactions: Connection[] = [];
    const rightConnections: Connection[] = [];
    const organismMap = new Map<string, Organism>();

    this.glowManager = new GlowManager(this, glowConfig);

    this.organismManager = new OrganismManager(
      this,
      this.uiCamera,
      organismMap,
      rightConnections,
      (organism) => this.arrowManager.arrowChecker(organism),
      (organism, amount, initialHP) => this.glowManager.healthChanged(organism, amount, initialHP),
    );
    this.interactionManager = new InteractionManager(
      organismMap,
      interactions,
      (fromId, toId, hpChange) => {
        this.arrowManager.playArrowPulseAnimation(fromId, toId, hpChange);
      },
      {},
      () => this.glowManager.clearAll(),
    );
    this.connectionManager = new ConnectionManager(
      rightConnections,
      interactions,
    );
    //undefined is needed for forceConfig
    this.arrowManager = new ArrowManager(
      this,
      this.uiCamera,
      this.interactionManager,
      this.connectionManager,
      this.organismManager,
      this.scoreManager,
      interactions,
      { centerY: this.scale.height * 0.4 },
    );
    this.cursorManager = new CursorManager(this, this.arrowManager);
    // creates random event spawn command
    if (typeof window !== "undefined") {
      window.spawnRandomEvent = () => {
        this.randomEventManager.triggerRandomEvent(
          this.organismManager.getOrganisms(),
          this.arrowManager,
          (organism) => this.removeOrganismWithBrokenTexture(organism),
          (lightningEffects) => this.playLightningAnimation(lightningEffects),
        );
      };
    }

    if (typeof window !== "undefined") {
      window.deleteOne = (id: string) => {
        const organism = this.organismManager.getOrganismMap().get(id);
        if (!organism) {
          console.error("Organism not found", id);
          return;
        }

        this.deleteOrganism(organism);
      }
    }
    if (typeof window !== "undefined") {
      window.lightning = ()  => {
        this.playLightningAnimation();
      }
        }

    this.scoreManager.outOfMoney = () => {
      this.randomEventManager.stopRandomEvents();
      this.scene.pause();
      this.scene.launch(this.config.scenes.gameOver);
    };

    this.arrowManager.createArrowButtons(centerX, this.config.infoButton.y);
    this.cursorManager.createCursorButton(centerX, this.config.infoButton.y);

    const initialOrganism = organisms[this.config.initialOrganismIndex];

    this.organismManager.createOrganism(
      centerX + initialOrganism.offsetX,
      centerY + initialOrganism.offsetY,
      initialOrganism.id,
    );

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

    this.scene.pause();
    this.scene.launch(this.config.scenes.menu);
    this.scene.bringToTop(this.config.scenes.menu);

    const infobutton = new InfoButton(
      this,
      this.config.infoButton.x,
      this.config.infoButton.y,
    );
    this.cameras.main.ignore(infobutton);

    infobutton.on("infoButtonClicked", () => {
      this.scene.launch(this.config.scenes.tutorial);
    });

    const secondOrganism = organisms[this.config.secondOrganismIndex];

    const hintbutton = new HintButton(
      this,
      this.scale.width - this.config.hintButton.x,
      this.config.hintButton.y,
    );
    this.cameras.main.ignore(hintbutton);

    hintbutton.on("hintButtonClicked", () => {
      const missing = this.connectionManager.getMissingConnections();
      if (missing.length === 0) return;

      this.scoreManager.loseMoney(this.config.hintCost);

      const hint = missing[0];
      organismMap.get(hint.from)?.highlight();
      organismMap.get(hint.to)?.highlight();
    });

    this.events.once("menuClosed", () => {
      this.scene.resume();
      this.time.delayedCall(this.config.secondOrganismSpawnDelayMs, () => {
        console.log(secondOrganism);
        this.organismManager.createOrganism(
          centerX + secondOrganism.offsetX,
          centerY + secondOrganism.offsetY,
          secondOrganism.id,
        );
      });
      this.time.delayedCall(this.config.randomEventSpawnDelayMs, () => {
        this.randomEventManager.startRandomEvents(
          this,
          this.organismManager.getOrganisms(),
          this.arrowManager,
          this.config.randomEventCheckIntervalMs,
          this.config.randomEventChance,
          this.config.randomEventMaxPerGame,
          (organism) => this.removeOrganismWithBrokenTexture(organism),
          (lightningEffects) => this.playLightningAnimation(lightningEffects),
        );
      });
    });
  }

  public deleteOrganism(organism: Organism): void {
    if (organism.organismData.id === "acacia") {
      this.arrowManager.removeOrganismFromSpawnOrder("diazotroph");
      const diazotroph = this.organismManager
        .getOrganismMap()
        .get("diazotroph");
      if (diazotroph) {
        this.removeOrganism(diazotroph);
      }
    }

    this.removeOrganism(organism);
    this.arrowManager.checkProgress();
  }

  private removeOrganism(organism: Organism): void {
    this.arrowManager.clearPreview();
    this.arrowManager.deleteArrows(organism);
    this.organismManager.deleteOrganism(organism);
  }

  private removeOrganismWithBrokenTexture(organism: Organism): void {
    const brokenTexture =
      organism.organismData.id === "acacia"
        ? "broken_acacia_sprite"
        : "broken_sapota_sprite";
    const brokenOrganism = this.add.sprite(
      organism.x,
      organism.y,
      brokenTexture,
    );
    brokenOrganism.setScale(organism.scale);
    brokenOrganism.setDepth(organism.depth);
    this.uiCamera.ignore(brokenOrganism);

    this.deleteOrganism(organism);
  }

  private playLightningAnimation(
    lightningEffects?: () => void,
  ): void {
    if (this.scene.isActive?.("LightningScene")) return;

    this.scene.pause();
    this.scene.launch("LightningScene", { lightningEffects });
    this.scene.bringToTop("LightningScene");
  }

  update() {
    this.cameraManager.update();
    this.arrowManager.update();
  }
}