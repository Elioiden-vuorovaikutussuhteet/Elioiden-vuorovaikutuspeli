import Phaser from "phaser";
import CloseButton from "../entities/closebutton";
import { getOrganismData, type OrganismData } from "../data/organisms";
import {
  organismInfoSceneConfig,
  type OrganismInfoSceneConfig,
} from "../config/sceneConfig";

interface OrganismInfoData {
  organismId: string;
}

interface InfoSection {
  content: string;
  style: { fontStyle: string; color?: string };
  url?: string;
}

function linkLabel(url: string): string {
  let hostname = "";
  try {
    hostname = new URL(url).hostname;
  } catch {}

  const isWikipedia = /(^|\.)wikipedia\.org$/.test(hostname);

  const lastSegment = url.split("/").filter(Boolean).pop() ?? url;
  let slug = lastSegment;
  try {
    slug = decodeURIComponent(lastSegment);
  } catch {}
  slug = slug.replace(/_/g, " ");

  if (isWikipedia) return `Wikipedia: ${slug}`;
  return hostname ? `${hostname}: ${slug}` : slug;
}

export default class OrganismInfoScene extends Phaser.Scene {
  private organism!: OrganismData;
  private config: OrganismInfoSceneConfig;

  constructor(config?: OrganismInfoSceneConfig) {
    const resolvedConfig =
      config && "rightMarginRatio" in config ? config : organismInfoSceneConfig;
    super(resolvedConfig.key);
    this.config = resolvedConfig;
  }

  init(data: OrganismInfoData) {
    const organism = getOrganismData(data.organismId);
    if (organism) {
      this.organism = organism;
    }
  }

  preload() {
    this.load.setPath(this.config.assetsPath);
    for (const image of this.config.images) {
      this.load.image(image.key, image.file);
    }
  }

  create() {
    if (!this.organism) {
      console.error("Organism not found");
      this.scene.stop();
      return;
    }

    const { width, height } = this.cameras.main;

    const menuHeight = Math.min(
      height * this.config.heightRatio,
      this.config.maxHeight,
    );
    const centerX = width / 2;

    const background = this.add.graphics();
    const border = this.add.graphics();

    const { text } = this.config;
    const fontSize = Math.min(width * text.fontSizeRatio, text.maxFontSize);

    const sections: InfoSection[] = [
      { content: this.organism.name, style: text.title },
      { content: this.organism.description, style: text.description },
      ...(this.organism.wikilinks ?? []).map((url) => ({
        content: linkLabel(url),
        style: text.links,
        url,
      })),
    ];

    const topPadding = 16;
    const sectionGap = 6;
    const bottomReserved = this.config.closeButton.bottomOffset + 24;
    const maxTextHeight = menuHeight - topPadding - bottomReserved;

    let wrapWidth =
      Math.min(width * this.config.widthRatio, this.config.maxWidth) *
      text.wordWrapWidthRatio;
    const maxAllowedWrapWidth = width * 0.9;

    const textObjects = sections.map((section) => {
      const textObject = this.add
        .text(centerX, 0, section.content, {
          fontFamily: text.fontFamily,
          fontSize: `${fontSize}px`,
          fontStyle: section.style.fontStyle,
          color: section.style.color ?? text.color,
          wordWrap: {
            width: wrapWidth,
          },
          align: text.align,
        })
        .setOrigin(text.originX, text.originY);

      if (section.url) {
        const url = section.url;
        textObject
          .setInteractive({ useHandCursor: true })
          .on("pointerdown", () => {
            window.open(url, "_blank", "noopener,noreferrer");
          });
      }

      return textObject;
    });

    const getTotalTextHeight = () =>
      textObjects.reduce((sum, obj) => sum + obj.height, 0) +
      sectionGap * (textObjects.length - 1);

    while (
      getTotalTextHeight() > maxTextHeight &&
      wrapWidth < maxAllowedWrapWidth
    ) {
      wrapWidth = Math.min(wrapWidth + 60, maxAllowedWrapWidth);
      for (const textObject of textObjects) {
        textObject.setWordWrapWidth(wrapWidth);
      }
    }

    const maxContentWidth = Math.max(
      ...textObjects.map((obj) => obj.width),
      160,
    );
    const horizontalPadding = 48;
    const menuWidth = maxContentWidth + horizontalPadding;

    
    const desiredX = (width - menuWidth) / 2 + width * this.config.horizontalOffsetRatio;

    const menuX = Phaser.Math.Clamp(desiredX, 0, Math.max(0, width - menuWidth));
    const menuY = (height - menuHeight) / this.config.topOffsetDivisor;
    const boxCenterX = menuX + menuWidth / 2;

    let currentOffsetY = topPadding;
    for (const textObject of textObjects) {
    textObject.setPosition(boxCenterX, menuY + currentOffsetY);
    currentOffsetY += textObject.height + sectionGap;
    }

    background.fillStyle(
      this.config.backgroundColor,
      this.config.backgroundAlpha,
    );
    background.fillRoundedRect(
      menuX,
      menuY,
      menuWidth,
      menuHeight,
      this.config.cornerRadius,
    );

    border.lineStyle(
      this.config.borderWidth,
      this.config.borderColor,
      this.config.borderAlpha,
    );
    border.strokeRoundedRect(
      menuX,
      menuY,
      menuWidth,
      menuHeight,
      this.config.cornerRadius,
    );

    const closeButton = new CloseButton(
      this,
      boxCenterX,
      menuY + menuHeight - this.config.closeButton.bottomOffset,
    );

    closeButton.on(this.config.closeButton.event, () => {
      this.scene.stop();
    });
  }
}