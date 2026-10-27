import Phaser from "phaser";
import { organisms } from "../data/organisms";
import type { OrganismData } from "../data/organisms";

export function getOrganismData(type: string) {
  const data = organisms.find((item) => item.id === type);
  // Get the specific organisms data from organisms.ts based on the type used in constructor

  if (!data) {
    throw new Error(`Organism type "${type}" not found`);
  }

  return data;
}

export default class Organism extends Phaser.GameObjects.Sprite {
  public readonly organismData: OrganismData;

  public readonly nameText: Phaser.GameObjects.Text;

  private uiCamera?: Phaser.Cameras.Scene2D.Camera;

  public hp = 100;
  public previousHP = this.hp;
  private baseScale = 1;
  private breakpoint = 10;

  private duplicates: Phaser.GameObjects.Sprite[] = [];
  public duplicateContainer: Phaser.GameObjects.Container;
  private hintGlow!: Phaser.Filters.Glow;

  private onHealthChanged?: (x: number, y: number, amount: number) => void;

  private debugHealth: boolean;
  private debugHealthText?: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    id: string,
    x: number,
    y: number,
    uiCamera?: Phaser.Cameras.Scene2D.Camera,
    onHealthChanged?: (x: number, y: number, amount: number) => void,
  ) {

    super(scene, x, y, getOrganismData(id).texture);

    const organismData = getOrganismData(id);

    this.onHealthChanged = onHealthChanged;

    // true to see previousHP, changeHealth() call and current hp
    this.debugHealth = false;
    this.uiCamera = uiCamera;

    this.duplicateContainer = scene.add.container(x, y);
    if (uiCamera) {
      uiCamera.ignore(this.duplicateContainer);
    }

    this.organismData = organismData;

    this.baseScale = organismData.default_scale;

    this.setScale(organismData.default_scale);

    this.setInteractive();

    this.enableFilters();

    this.on("pointerdown", () => {
      this.emit("organismSelected", this);
    });

    const glow = this.filters!.internal.addGlow(
      0xffffff,
      5,
      0,
      1,
      false,
      10,
      10,
    );

    glow.active = false;

    this.hintGlow = this.filters!.internal.addGlow(
      0xffff00,
      5,
      0,
      1,
      false,
      10,
      10,
    );

    this.hintGlow.active = false;

    this.hintGlow = this.filters!.internal.addGlow(
      0xffff00,
      5,
      0,
      1,
      false,
      10,
      10
    );

    this.hintGlow.active = false;

    this.on("pointerover", () => {
      glow.active = true;
    });

    this.on("pointerout", () => {
      glow.active = false;
    });

    scene.add.existing(this);

    this.nameText = scene.add
      .text(x, y + this.displayHeight / 2 + 20, organismData.name, {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#000000",
        align: "center",
      })
      .setOrigin(0.5);

    if (uiCamera) {
      uiCamera.ignore(this.nameText);
    }
  }

  public changeScale() {
    const sensitivity = 0.5;

    const healthRatio = 1 + ((this.hp - 100) / 100) * sensitivity;

    const newScale = this.baseScale * Math.max(0.1, healthRatio);

    this.scene.tweens.add({
      targets: [this, this.duplicateContainer],
      scale: newScale,
      duration: 500,
      ease: "Sine.easeInOut",
      onUpdate: () => {
        this.nameText.setPosition(this.x, this.y + this.displayHeight / 2 + 20);
      },
    });
  }


  private updateDuplicates() {
    if (this.hp > 100 + this.breakpoint) {
      const duplicate = this.scene.add.sprite(0, 0, this.organismData.texture);

      duplicate.setScale(this.baseScale * 0.5);

      this.duplicateContainer.add(duplicate);
      this.duplicates.push(duplicate);

      this.positionDuplicates();

      this.breakpoint *= 2;
    }

    while (this.duplicates.length > 0 && this.hp <= 100 + this.breakpoint / 2) {
      const duplicate = this.duplicates.pop();

      if (duplicate) {
        duplicate.destroy();
      }

      this.breakpoint /= 2;
      this.positionDuplicates();
    }
  }

  private positionDuplicates() {
    const count = this.duplicates.length;

    const radius = this.displayWidth * 0.8;

    this.duplicates.forEach((duplicate, index) => {
      const angle = (index / count) * Math.PI * 2;

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

    this.previousHP = this.hp
    this.hp += totalChange;

    if (this.debugHealth) {
    const debugMessage =
      `Previous HP: ${this.previousHP}\n` +
      `changeHealth(${totalChange})\n` +
      `New HP: ${this.hp}`;

    if (this.debugHealthText) {
      this.debugHealthText.setText(debugMessage);
      this.debugHealthText.setPosition(this.x, this.y - this.displayHeight / 2 - 20);
    } else {
      this.debugHealthText = this.scene.add
        .text(
          this.x,
          this.y - this.displayHeight / 2 - 20,
          debugMessage,
          {
            fontFamily: "monospace",
            fontSize: "14px",
            color: "#1605fa",
            backgroundColor: "#ffffff",
            padding: { x: 6, y: 4 },
            align: "left",
          }
        )
        .setOrigin(0.5, 1)
        .setDepth(1000);

        if (this.uiCamera) {
          this.uiCamera.ignore(this.debugHealthText);
        }
    }
  }
    
    const particleY =
    totalChange > 0
      ? this.y + this.displayHeight / 2
      : this.y - this.displayHeight / 2;

    this.onHealthChanged?.(this.x, particleY, totalChange);

    if (this.organismData.growth_types.includes("multiply")) {
      this.updateDuplicates();
    }
    if (this.organismData.growth_types.includes("grow")) {
      this.changeScale();
    }
  }

  // Move organism
  public override setPosition(
    x: number,
    y?: number,
    z?: number,
    w?: number,
  ): this {
    super.setPosition(x, y, z, w);

    const currentX = this.x;
    const currentY = this.y;

    // Move the duplicate container to the organism's new position
    if (this.duplicateContainer) {
      this.duplicateContainer.setPosition(currentX, currentY);
    }

    // Keep name text aligned below the organism
    if (this.nameText) {
      const textOffsetY = this.displayHeight / 2 + 20;
      this.nameText.setPosition(currentX, currentY + textOffsetY);
    }

    return this;
  }

  // Cleanup if organism is detroyed
  public override destroy(fromScene?: boolean): void {
    if (this.duplicateContainer) {
      this.duplicateContainer.destroy(fromScene);
    }
    if (this.nameText) {
      this.nameText.destroy(fromScene);
    }
    super.destroy(fromScene);
  }

  public highlight(duration = 2000) {
    this.hintGlow.active = true;
    this.scene.time.delayedCall(duration, () => {
      this.hintGlow.active = false;
    });
  }

  update() {}
}
