import Phaser from "phaser";
import { organisms } from "../data/organisms";
import type { OrganismData } from "../data/organisms";
import { organismUIConfig, type OrganismUIConfig } from "../config";

export function getOrganismData(type: string) {
  const data = organisms.find((item) => item.id === type);

  if (!data) {
    throw new Error(`Organism type "${type}" not found`);
  }

  return data;
}

export default class Organism extends Phaser.GameObjects.Sprite {
  public readonly organismData: OrganismData;
  public readonly nameText: Phaser.GameObjects.Text;

  private uiCamera?: Phaser.Cameras.Scene2D.Camera;
  private config: OrganismUIConfig = organismUIConfig;

  public hp = organismUIConfig.initialHp;
  public previousHP = this.hp;
  private baseScale = organismUIConfig.defaultBaseScale;
  private breakpoint = organismUIConfig.initialBreakpoint;

  private duplicates: Phaser.GameObjects.Sprite[] = [];
  public duplicateContainer: Phaser.GameObjects.Container;
  private hintGlow!: Phaser.Filters.Glow;

  private onHealthChanged?: (organism: Organism, amount: number) => void;

  private debugHealth = organismUIConfig.debugHealth;
  private debugHealthText?: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    id: string,
    x: number,
    y: number,
    uiCamera?: Phaser.Cameras.Scene2D.Camera,
    onHealthChanged?: (organism: Organism, amount: number) => void,
    config: OrganismUIConfig = organismUIConfig,
  ) {
    const organismData = getOrganismData(id);
    super(scene, x, y, organismData.texture);

    this.config = config;
    this.hp = config.initialHp;
    this.previousHP = this.hp;
    this.baseScale = organismData.default_scale ?? config.defaultBaseScale;
    this.breakpoint = config.initialBreakpoint;
    this.debugHealth = config.debugHealth;

    this.onHealthChanged = onHealthChanged;
    this.uiCamera = uiCamera;

    this.duplicateContainer = scene.add.container(x, y);
    if (uiCamera) {
      uiCamera.ignore(this.duplicateContainer);
    }

    this.organismData = organismData;

    this.setScale(this.baseScale);
    this.setInteractive();
    this.enableFilters();

    this.on("pointerdown", () => {
      this.emit(this.config.selectEvent, this);
    });

    const { hoverGlow, hintGlow } = this.config;

    const glow = this.filters!.internal.addGlow(
      hoverGlow.color,
      hoverGlow.outerStrength,
      hoverGlow.innerStrength,
      hoverGlow.scale,
      hoverGlow.knockout,
      hoverGlow.quality,
      hoverGlow.distance,
    );
    glow.active = false;

    this.hintGlow = this.filters!.internal.addGlow(
      hintGlow.color,
      hintGlow.outerStrength,
      hintGlow.innerStrength,
      hintGlow.scale,
      hintGlow.knockout,
      hintGlow.quality,
      hintGlow.distance,
    );
    this.hintGlow.active = false;

    this.on("pointerover", () => {
      glow.active = true;
    });

    this.on("pointerout", () => {
      glow.active = false;
    });

    scene.add.existing(this);

    const { nameText } = this.config;
    this.nameText = scene.add
      .text(
        x,
        y + this.displayHeight / 2 + nameText.offsetY,
        organismData.name,
        {
          fontFamily: nameText.fontFamily,
          fontSize: nameText.fontSize,
          color: nameText.color,
          align: nameText.align,
        },
      )
      .setOrigin(nameText.origin);

    if (uiCamera) {
      uiCamera.ignore(this.nameText);
    }
  }

  public changeScale() {
    const { scaleTween, initialHp, nameText } = this.config;

    const healthRatio =
      1 + ((this.hp - initialHp) / initialHp) * scaleTween.sensitivity;

    const newScale =
      this.baseScale * Math.max(scaleTween.minHealthRatio, healthRatio);

    this.scene.tweens.add({
      targets: [this, this.duplicateContainer],
      scale: newScale,
      duration: scaleTween.duration,
      ease: scaleTween.ease,
      onUpdate: () => {
        this.nameText.setPosition(
          this.x,
          this.y + this.displayHeight / 2 + nameText.offsetY,
        );
      },
    });
  }

  private updateDuplicates() {
    const { initialHp, duplicates } = this.config;

    if (this.hp > initialHp + this.breakpoint) {
      const duplicate = this.scene.add.sprite(0, 0, this.organismData.texture);

      duplicate.setScale(this.baseScale * duplicates.scaleMultiplier);

      this.duplicateContainer.add(duplicate);
      this.duplicates.push(duplicate);

      this.positionDuplicates();

      this.breakpoint *= duplicates.breakpointFactor;
    }

    while (
      this.duplicates.length > 0 &&
      this.hp <= initialHp + this.breakpoint / duplicates.breakpointFactor
    ) {
      const duplicate = this.duplicates.pop();

      if (duplicate) {
        duplicate.destroy();
      }

      this.breakpoint /= duplicates.breakpointFactor;
      this.positionDuplicates();
    }
  }

  private positionDuplicates() {
    const count = this.duplicates.length;
    const { duplicates } = this.config;

    const radius = Math.min(
      this.displayWidth * duplicates.radiusRatio,
      duplicates.maxRadius,
    );

    const startAngle = (duplicates.startAngleDeg * Math.PI) / 180;
    const arcSpan = (duplicates.arcSpanDeg * Math.PI) / 180;

    this.duplicates.forEach((duplicate, index) => {
      const progress = count === 1 ? 0.5 : index / (count - 1);
      const angle = startAngle + progress * arcSpan;

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      duplicate.setPosition(x, y);
    });
  }

  public getDuplicateContainer() {
    return this.duplicateContainer;
  }

  public changeHealth(totalChange: number) {
    if (totalChange === 0) return;

    this.previousHP = this.hp;
    this.hp += totalChange;

    if (this.debugHealth) {
      const { debugText } = this.config;
      const debugMessage =
        `Previous HP: ${this.previousHP}\n` +
        `changeHealth(${totalChange})\n` +
        `New HP: ${this.hp}`;

      if (this.debugHealthText) {
        this.debugHealthText.setText(debugMessage);
        this.debugHealthText.setPosition(
          this.x,
          this.y - this.displayHeight / 2 - debugText.offsetY,
        );
      } else {
        this.debugHealthText = this.scene.add
          .text(
            this.x,
            this.y - this.displayHeight / 2 - debugText.offsetY,
            debugMessage,
            {
              fontFamily: debugText.fontFamily,
              fontSize: debugText.fontSize,
              color: debugText.color,
              backgroundColor: debugText.backgroundColor,
              padding: debugText.padding,
              align: debugText.align,
            },
          )
          .setOrigin(debugText.originX, debugText.originY)
          .setDepth(debugText.depth);

        if (this.uiCamera) {
          this.uiCamera.ignore(this.debugHealthText);
        }
      }
    }

    this.onHealthChanged?.(this, totalChange);

    if (this.organismData.growth_types.includes("multiply")) {
      this.updateDuplicates();
    }
    if (this.organismData.growth_types.includes("grow")) {
      this.changeScale();
    }
  }

  public override setPosition(
    x: number,
    y?: number,
    z?: number,
    w?: number,
  ): this {
    super.setPosition(x, y, z, w);

    const currentX = this.x;
    const currentY = this.y;

    if (this.duplicateContainer) {
      this.duplicateContainer.setPosition(currentX, currentY);
    }

    if (this.nameText) {
      const offsetY =
        this.config?.nameText.offsetY ?? organismUIConfig.nameText.offsetY;
      const textOffsetY = this.displayHeight / 2 + offsetY;
      this.nameText.setPosition(currentX, currentY + textOffsetY);
    }

    return this;
  }

  public override destroy(fromScene?: boolean): void {
    if (this.duplicateContainer) {
      this.duplicateContainer.destroy(fromScene);
    }
    if (this.nameText) {
      this.nameText.destroy(fromScene);
    }
    super.destroy(fromScene);
  }

  public highlight(duration = this.config.hintGlow.defaultDuration) {
    this.hintGlow.active = true;
    this.scene.time.delayedCall(duration, () => {
      this.hintGlow.active = false;
    });
  }

  update() {}
}