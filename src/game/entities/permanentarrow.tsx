import Phaser from "phaser";
import type Organism from "./organism";
import { drawArrow } from "../services/DrawArrowService";
import { arrowUIConfig, permanentArrowUIConfig } from "../config/uiConfig";

export interface PermanentArrowConfig {
  targetOffset?: number;
  color?: number;
  thickness?: number;
  lateralOffset?: number;
}

interface PulseAnimation {
  circle: Phaser.GameObjects.Arc;
  progress: number;
  tween: Phaser.Tweens.Tween;
}

const textureAlphaCache = new Map<
  string,
  { width: number; height: number; data: Uint8ClampedArray }
>();

export default class PermanentArrow {
  public readonly key: string;
  public readonly fromId: string;
  public readonly toId: string;
  public readonly graphics: Phaser.GameObjects.Graphics;
  public dirty = true;

  private readonly ownsGraphics: boolean;
  private readonly scene: Phaser.Scene;
  private readonly uiCamera: Phaser.Cameras.Scene2D.Camera;
  private readonly arrowhitBox: Phaser.GameObjects.Zone;
  private readonly onClicked: () => void;

  private targetOffset: number;
  private color: number;
  private thickness: number;
  private lateralOffset: number;

  private pulses: PulseAnimation[] = [];

  private fromX = 0;
  private fromY = 0;
  private toX = 0;
  private toY = 0;
  private lastFromOrgX = NaN;
  private lastFromOrgY = NaN;
  private lastToOrgX = NaN;
  private lastToOrgY = NaN;
  private visible = false;

  private hitBounds = new Phaser.Geom.Rectangle();
  private hitAreaRect = new Phaser.Geom.Rectangle(0, 0, 1, 1);
  private hovered = false;

  constructor(
    scene: Phaser.Scene,
    uiCamera: Phaser.Cameras.Scene2D.Camera,
    fromId: string,
    toId: string,
    config: PermanentArrowConfig = {},
    onClicked: () => void = () => undefined,
    sharedGraphics?: Phaser.GameObjects.Graphics,
  ) {
    this.scene = scene;
    this.uiCamera = uiCamera;
    this.onClicked = onClicked;

    this.fromId = fromId;
    this.toId = toId;
    this.key = JSON.stringify([fromId, toId]);

    this.targetOffset =
      config.targetOffset ?? permanentArrowUIConfig.defaultTargetOffset;
    this.color = config.color ?? arrowUIConfig.positiveColor;
    this.thickness =
      config.thickness ?? permanentArrowUIConfig.defaultThickness;
    this.lateralOffset =
      config.lateralOffset ?? permanentArrowUIConfig.defaultLateralOffset;

    if (sharedGraphics) {
      this.graphics = sharedGraphics;
      this.ownsGraphics = false;
    } else {
      this.graphics = this.scene.add.graphics();
      this.graphics.setDepth(permanentArrowUIConfig.graphicsDepth);
      this.uiCamera.ignore(this.graphics);
      this.ownsGraphics = true;
    }

    this.arrowhitBox = this.scene.add.zone(0, 0, 1, 1);
    this.arrowhitBox.setOrigin(0);
    this.arrowhitBox.setDepth(permanentArrowUIConfig.hitZoneDepth);
    this.arrowhitBox.setInteractive(this.hitAreaRect, (_hitArea, x, y) =>
      this.isPointOnArrow(x + this.hitBounds.x, y + this.hitBounds.y),
    );
    this.arrowhitBox.on("pointerover", () => {
      this.hovered = true;
      this.dirty = true;
      if (this.ownsGraphics) this.redrawStandalone();
    });
    this.arrowhitBox.on("pointerout", () => {
      this.hovered = false;
      this.dirty = true;
      if (this.ownsGraphics) this.redrawStandalone();
    });
    this.arrowhitBox.on("pointerdown", () => this.onClicked());
    this.arrowhitBox.input!.enabled = false;
    this.uiCamera.ignore(this.arrowhitBox);
  }

  public setStyle(config: Partial<PermanentArrowConfig>): void {
    let changed = false;
    if (
      config.targetOffset !== undefined &&
      config.targetOffset !== this.targetOffset
    ) {
      this.targetOffset = config.targetOffset;
      changed = true;
    }
    if (config.color !== undefined && config.color !== this.color) {
      this.color = config.color;
      changed = true;
    }
    if (config.thickness !== undefined && config.thickness !== this.thickness) {
      this.thickness = config.thickness;
      changed = true;
    }
    if (
      config.lateralOffset !== undefined &&
      config.lateralOffset !== this.lateralOffset
    ) {
      this.lateralOffset = config.lateralOffset;
      changed = true;
    }
    if (changed) {
      this.lastFromOrgX = NaN;
      this.dirty = true;
    }
  }

  public playPulse(healthChange: number): void {
    const color =
      healthChange >= 0
        ? permanentArrowUIConfig.pulsePositiveColor
        : permanentArrowUIConfig.pulseNegativeColor;

    const circle = this.scene.add.circle(
      this.fromX,
      this.fromY,
      permanentArrowUIConfig.pulseRadius,
      color,
    );

    circle.setStrokeStyle(
      permanentArrowUIConfig.pulseColorGlowRadius,
      color,
      permanentArrowUIConfig.pulseStrokeAlpha,
    );
    circle.setBlendMode(Phaser.BlendModes.ADD);
    circle.setDepth(permanentArrowUIConfig.pulseDepth);
    circle.setAlpha(permanentArrowUIConfig.pulseAlpha);
    this.uiCamera.ignore(circle);

    const pulse: PulseAnimation = {
      circle,
      progress: 0,
      tween: undefined as unknown as Phaser.Tweens.Tween,
    };

    pulse.tween = this.scene.tweens.add({
      targets: pulse,
      progress: 1,
      duration: permanentArrowUIConfig.pulseDuration,
      ease: "Linear",
      onComplete: () => {
        circle.destroy();
        this.pulses = this.pulses.filter((p) => p !== pulse);
      },
    });

    this.pulses.push(pulse);
  }

  private updatePulsePosition(): void {
    for (const pulse of this.pulses) {
      const t = pulse.progress;
      pulse.circle.setPosition(
        this.fromX + (this.toX - this.fromX) * t,
        this.fromY + (this.toY - this.fromY) * t,
      );
    }
  }

  private getOrganismPixelAlpha(
    organism: Organism,
    worldX: number,
    worldY: number,
  ): number {
    const scaleX = organism.scaleX || 1;
    const scaleY = organism.scaleY || 1;
    const textureWidth = organism.width ?? 0;
    const textureHeight = organism.height ?? 0;
    if (textureWidth <= 0 || textureHeight <= 0) return 255;

    const textureX = Math.round(
      (worldX - organism.x) / scaleX + textureWidth / 2,
    );
    const textureY = Math.round(
      (worldY - organism.y) / scaleY + textureHeight / 2,
    );

    if (
      textureX < 0 ||
      textureX >= textureWidth ||
      textureY < 0 ||
      textureY >= textureHeight
    ) {
      return 0;
    }

    const textureKey = organism.texture?.key ?? organism.organismData?.texture;
    if (!textureKey) return 255;

    let cached = textureAlphaCache.get(textureKey);
    if (!cached && this.scene.textures?.exists(textureKey)) {
      const tex = this.scene.textures.get(textureKey);
      const sourceImage = tex.getSourceImage() as
        | HTMLImageElement
        | HTMLCanvasElement;
      if (sourceImage && typeof document !== "undefined") {
        const canvas = document.createElement("canvas");
        canvas.width = textureWidth;
        canvas.height = textureHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(sourceImage, 0, 0);
          cached = {
            width: textureWidth,
            height: textureHeight,
            data: ctx.getImageData(0, 0, textureWidth, textureHeight).data,
          };
          textureAlphaCache.set(textureKey, cached);
        }
      }
    }

    if (cached) {
      return cached.data[(textureY * cached.width + textureX) * 4 + 3] ?? 0;
    }

    const getPixelAlpha = this.scene.textures?.getPixelAlpha;
    return typeof getPixelAlpha === "function"
      ? (getPixelAlpha.call(
          this.scene.textures,
          textureX,
          textureY,
          textureKey,
        ) ?? 0)
      : 255;
  }

  private getOrganismBorderPoint(
    organism: Organism,
    ux: number,
    uy: number,
    lateralShiftX: number,
    lateralShiftY: number,
  ): { x: number; y: number } {
    const halfDisplayWidth = (organism.displayWidth ?? 0) / 2;
    const halfDisplayHeight = (organism.displayHeight ?? 0) / 2;

    if (halfDisplayWidth <= 0 || halfDisplayHeight <= 0) {
      return {
        x: organism.x + lateralShiftX + ux * this.targetOffset,
        y: organism.y + lateralShiftY + uy * this.targetOffset,
      };
    }

    const {
      borderPadding,
      raycastStep,
      alphaThreshold,
      fallbackNameTextHeight,
      fallbackNameTextOffset,
      nameTextTopPadding,
    } = permanentArrowUIConfig;

    const maxSpriteDistance = Math.hypot(halfDisplayWidth, halfDisplayHeight);
    let spriteBorderDistance = 0;

    for (
      let distanceFromCenter = maxSpriteDistance;
      distanceFromCenter >= 0;
      distanceFromCenter -= raycastStep
    ) {
      const worldX = organism.x + lateralShiftX + ux * distanceFromCenter;
      const worldY = organism.y + lateralShiftX + uy * distanceFromCenter;
      if (
        this.getOrganismPixelAlpha(organism, worldX, worldY) > alphaThreshold
      ) {
        spriteBorderDistance = distanceFromCenter + borderPadding;
        break;
      }
    }

    const halfNameTextWidth =
      (organism.nameText?.width ?? 0) / 2 + borderPadding;
    const nameTextBottomOffset =
      organism.nameText?.y !== undefined
        ? organism.nameText.y -
          organism.y +
          (organism.nameText.height ?? fallbackNameTextHeight) / 2
        : halfDisplayHeight + fallbackNameTextOffset;
    const nameTextTopY = halfDisplayHeight - nameTextTopPadding;
    const nameTextBottomY =
      Math.max(halfDisplayHeight, nameTextBottomOffset) + borderPadding;

    const minDistanceX =
      ux > 1e-6
        ? (-halfNameTextWidth - lateralShiftX) / ux
        : ux < -1e-6
          ? (halfNameTextWidth - lateralShiftX) / ux
          : -Infinity;
    const maxDistanceX =
      ux > 1e-6
        ? (halfNameTextWidth - lateralShiftX) / ux
        : ux < -1e-6
          ? (-halfNameTextWidth - lateralShiftX) / ux
          : Infinity;

    const minDistanceY =
      uy > 1e-6
        ? (nameTextTopY - lateralShiftY) / uy
        : uy < -1e-6
          ? (nameTextBottomY - lateralShiftY) / uy
          : -Infinity;
    const maxDistanceY =
      uy > 1e-6
        ? (nameTextBottomY - lateralShiftY) / uy
        : uy < -1e-6
          ? (nameTextTopY - lateralShiftY) / uy
          : Infinity;

    const boxEntryDistance = Math.max(minDistanceX, minDistanceY);
    const boxExitDistance = Math.min(maxDistanceX, maxDistanceY);
    const nameTextBorderDistance =
      boxExitDistance >= Math.max(0, boxEntryDistance) ? boxExitDistance : 0;

    const borderDistance = Math.max(
      spriteBorderDistance,
      nameTextBorderDistance,
    );

    return {
      x: organism.x + lateralShiftX + ux * borderDistance,
      y: organism.y + lateralShiftY + uy * borderDistance,
    };
  }

  public update(from: Organism, to: Organism): void {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) {
      if (this.visible) {
        this.visible = false;
        this.dirty = true;
        if (this.ownsGraphics) this.graphics.clear();
      }
      return;
    }

    this.visible = true;

    const eps = permanentArrowUIConfig.movementEpsilon;
    const moved =
      !Number.isFinite(this.lastFromOrgX) ||
      !Number.isFinite(this.lastFromOrgY) ||
      !Number.isFinite(this.lastToOrgX) ||
      !Number.isFinite(this.lastToOrgY) ||
      Math.abs(from.x - this.lastFromOrgX) > eps ||
      Math.abs(from.y - this.lastFromOrgY) > eps ||
      Math.abs(to.x - this.lastToOrgX) > eps ||
      Math.abs(to.y - this.lastToOrgY) > eps;

    if (moved) {
      this.lastFromOrgX = from.x;
      this.lastFromOrgY = from.y;
      this.lastToOrgX = to.x;
      this.lastToOrgY = to.y;

      const ux = dx / distance;
      const uy = dy / distance;
      const lateralShiftX = -uy * this.lateralOffset;
      const lateralShiftY = ux * this.lateralOffset;

      const fromBorderPoint = this.getOrganismBorderPoint(
        from,
        ux,
        uy,
        lateralShiftX,
        lateralShiftY,
      );
      const toBorderPoint = this.getOrganismBorderPoint(
        to,
        -ux,
        -uy,
        lateralShiftX,
        lateralShiftY,
      );

      this.fromX = fromBorderPoint.x;
      this.fromY = fromBorderPoint.y;
      this.toX = toBorderPoint.x;
      this.toY = toBorderPoint.y;

      this.updateHitZone();
      this.dirty = true;

      if (this.ownsGraphics) {
        this.redrawStandalone();
      }
    }

    if (this.pulses.length > 0) {
      this.updatePulsePosition();
    }
  }

  /**
   * Appends this arrow's geometry onto a Graphics instance without clearing it.
   */
  public draw(
    targetGraphics: Phaser.GameObjects.Graphics = this.graphics,
  ): void {
    if (!this.visible) return;

    drawArrow(targetGraphics, {
      x1: this.fromX,
      y1: this.fromY,
      x2: this.toX,
      y2: this.toY,
      color: this.hovered ? permanentArrowUIConfig.hoverColor : this.color,
      thickness: this.hovered
        ? this.thickness + permanentArrowUIConfig.hoverThicknessBonus
        : this.thickness,
    });
  }

  private redrawStandalone(): void {
    this.graphics.clear();
    this.draw(this.graphics);
    this.dirty = false;
  }

  public setCursorMode(enabled: boolean): void {
    this.arrowhitBox.input!.enabled = enabled;
    if (!enabled && this.hovered) {
      this.hovered = false;
      this.dirty = true;
      if (this.ownsGraphics) this.redrawStandalone();
    }
  }

  private updateHitZone(): void {
    const padding = this.thickness + permanentArrowUIConfig.hitBoxPaddingOffset;
    const minX = Math.min(this.fromX, this.toX) - padding;
    const minY = Math.min(this.fromY, this.toY) - padding;
    const width = Math.max(1, Math.abs(this.toX - this.fromX) + padding * 2);
    const height = Math.max(1, Math.abs(this.toY - this.fromY) + padding * 2);

    this.hitBounds.setTo(minX, minY, width, height);
    this.arrowhitBox.setPosition(minX, minY);
    this.arrowhitBox.setSize(width, height);
    this.hitAreaRect.setTo(0, 0, width, height);
  }

  private isPointOnArrow(x: number, y: number): boolean {
    const dx = this.toX - this.fromX;
    const dy = this.toY - this.fromY;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) return false;

    const projection = Math.max(
      0,
      Math.min(
        1,
        ((x - this.fromX) * dx + (y - this.fromY) * dy) / lengthSquared,
      ),
    );
    const closestX = this.fromX + projection * dx;
    const closestY = this.fromY + projection * dy;

    return (
      Math.hypot(x - closestX, y - closestY) <=
      this.thickness + permanentArrowUIConfig.hitDistanceToleranceOffset
    );
  }

  public destroy(): void {
    for (const pulse of this.pulses) {
      pulse.tween.remove();
      pulse.circle.destroy();
    }
    this.pulses = [];
    if (this.ownsGraphics) {
      this.graphics.destroy();
    }
    this.arrowhitBox.destroy();
  }
}
