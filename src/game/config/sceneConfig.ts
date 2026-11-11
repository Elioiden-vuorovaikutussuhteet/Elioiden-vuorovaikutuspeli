
import { z } from "zod";

export const AssetEntrySchema = z.object({
  key: z.string(),
  file: z.string(),
});

export type AssetEntry = z.infer<typeof AssetEntrySchema>;

export const OverlayBoxStyleSchema = z.object({
  cornerRadius: z.number(),
  backgroundColor: z.number().int().min(0).max(0xffffff),
  backgroundAlpha: z.number(),
  borderWidth: z.number(),
  borderColor: z.number().int().min(0).max(0xffffff),
  borderAlpha: z.number(),
});

export type OverlayBoxStyle = z.infer<typeof OverlayBoxStyleSchema>;

export const defaultOverlayBoxStyle: OverlayBoxStyle = {
  cornerRadius: 30,
  backgroundColor: 0x000000,
  backgroundAlpha: 0.7,
  borderWidth: 8,
  borderColor: 0xffffff,
  borderAlpha: 1,
};

export const GameSceneConfigSchema = z.object({
  key: z.string(),
  scenes: z.object({
    menu: z.string(),
    tutorial: z.string(),
    gameOver: z.string(),
  }),
  assetsPath: z.string(),
  images: z.array(AssetEntrySchema),
  startingMoney: z.number(),
  hintCost: z.number(),
  infoButton: z.object({
    x: z.number(),
    y: z.number(),
  }),
  hintButton: z.object({
    x: z.number(),
    y: z.number(),
  }),
  initialOrganismIndex: z.number(),
  secondOrganismIndex: z.number(),
  secondOrganismSpawnDelayMs: z.number(),
  randomEventSpawnDelayMs: z.number(),
});

export type GameSceneConfig = z.infer<typeof GameSceneConfigSchema>;

export const gameSceneConfig: GameSceneConfig = {
  key: "GameScene",
  scenes: {
    menu: "MenuScene",
    tutorial: "TutorialScene",
    gameOver: "GameOverScene",
  },
  assetsPath: "assets",
  images: [
    { key: "acacia_sprite", file: "bullhornacacia.png" },
    { key: "amf_sprite", file: "amf.png" },
    { key: "greenbutton", file: "greenbutton.png" },
    { key: "redbutton", file: "redbutton.png" },
    { key: "infobutton_sprite", file: "altinfo.png" },
    { key: "ants_sprite", file: "ants.png" },
    { key: "antfootbacteria_sprite", file: "antfootbacteria.png" },
    { key: "sapota_sprite", file: "sapota.png" },
    { key: "diazotroph_sprite", file: "diazotroph.png" },
    { key: "mycorrhizahelper_sprite", file: "mycorrhizabacteria.png" },
    { key: "pos_particle", file: "pos_particle.png" },
    { key: "neg_particle", file: "neg_particle.png" },
    { key: "cursor", file: "cursor.png" },
    { key: "coin", file: "coin.png" },
  ],
  startingMoney: 1000,
  hintCost: 100,
  infoButton: { x: 40, y: 40 },
  hintButton: { x: 300, y: 40 },
  initialOrganismIndex: 0,
  secondOrganismIndex: 1,
  secondOrganismSpawnDelayMs: 3000,
  randomEventSpawnDelayMs: 100,
};

export const MenuSceneConfigSchema = OverlayBoxStyleSchema.extend({
  key: z.string(),
  targetSceneKey: z.string(),
  closeEvent: z.string(),
  width: z.number(),
  height: z.number(),
  text: z.object({
    label: z.string(),
    fontFamily: z.string(),
    fontSize: z.string(),
    fontStyle: z.string(),
    color: z.string(),
    origin: z.number(),
  }),
});

export type MenuSceneConfig = z.infer<typeof MenuSceneConfigSchema>;

export const menuSceneConfig: MenuSceneConfig = {
  ...defaultOverlayBoxStyle,
  key: "MenuScene",
  targetSceneKey: "GameScene",
  closeEvent: "menuClosed",
  width: 400,
  height: 200,
  text: {
    label: "Start Game",
    fontFamily: "monospace",
    fontSize: "30px",
    fontStyle: "bold",
    color: "#ffffff",
    origin: 0.5,
  },
};

export const TutorialSceneConfigSchema = OverlayBoxStyleSchema.extend({
  key: z.string(),
  assetsPath: z.string(),
  images: z.array(AssetEntrySchema),
  widthRatio: z.number(),
  maxWidth: z.number(),
  heightRatio: z.number(),
  maxHeight: z.number(),
  leftMarginRatio: z.number(),
  topOffsetDivisor: z.number(),
  text: z.object({
    content: z.string(),
    topOffsetRatio: z.number(),
    fontFamily: z.string(),
    fontSizeRatio: z.number(),
    maxFontSize: z.number(),
    fontStyle: z.string(),
    color: z.string(),
    wordWrapWidthRatio: z.number(),
    align: z.string(),
    originX: z.number(),
    originY: z.number(),
  }),
  closeButton: z.object({
    bottomOffset: z.number(),
    event: z.string(),
  }),
});

export type TutorialSceneConfig = z.infer<typeof TutorialSceneConfigSchema>;

export const tutorialSceneConfig: TutorialSceneConfig = {
  ...defaultOverlayBoxStyle,
  key: "TutorialScene",
  assetsPath: "assets",
  images: [{ key: "close_button_sprite", file: "closebutton.png" }],
  widthRatio: 0.3,
  maxWidth: 450,
  heightRatio: 0.7,
  maxHeight: 600,
  leftMarginRatio: 0.05,
  topOffsetDivisor: 4,
  text: {
    content: [
      "Select whether you want",
      "to draw a positive",
      "or a negative relation",
      "by clicking on",
      "the corresponding icon",
      "and then choosing your",
      "starting and end organism.",
    ].join("\n"),
    topOffsetRatio: 0.15,
    fontFamily: "monospace",
    fontSizeRatio: 0.015,
    maxFontSize: 25,
    fontStyle: "bold",
    color: "#ffffff",
    wordWrapWidthRatio: 0.8,
    align: "center",
    originX: 0.5,
    originY: 0,
  },
  closeButton: {
    bottomOffset: 50,
    event: "closeButtonClicked",
  },
};

export const GameOverSceneConfigSchema = OverlayBoxStyleSchema.extend({
  key: z.string(),
  scenesToStop: z.array(z.string()),
  restartSceneKey: z.string(),
  width: z.number(),
  height: z.number(),
  titleText: z.object({
    label: z.string(),
    offsetY: z.number(),
    fontFamily: z.string(),
    fontSize: z.string(),
    fontStyle: z.string(),
    color: z.string(),
    origin: z.number(),
  }),
  retryButton: z.object({
    label: z.string(),
    offsetY: z.number(),
    fontFamily: z.string(),
    fontSize: z.string(),
    fontStyle: z.string(),
    color: z.string(),
    origin: z.number(),
  }),
});

export type GameOverSceneConfig = z.infer<typeof GameOverSceneConfigSchema>;

export const gameOverSceneConfig: GameOverSceneConfig = {
  ...defaultOverlayBoxStyle,
  key: "GameOverScene",
  scenesToStop: ["PopupScene"],
  restartSceneKey: "GameScene",
  width: 400,
  height: 200,
  titleText: {
    label: "GAME OVER",
    offsetY: -30,
    fontFamily: "monospace",
    fontSize: "30px",
    fontStyle: "bold",
    color: "#ffffff",
    origin: 0.5,
  },
  retryButton: {
    label: "Try again",
    offsetY: 30,
    fontFamily: "monospace",
    fontSize: "20px",
    fontStyle: "bold",
    color: "#fffff0",
    origin: 0.5,
  },
};

export const PopupSceneConfigSchema = OverlayBoxStyleSchema.extend({
  key: z.string(),
  assetsPath: z.string(),
  images: z.array(AssetEntrySchema),
  widthRatio: z.number(),
  maxWidth: z.number(),
  heightRatio: z.number(),
  maxHeight: z.number(),
  rightMarginRatio: z.number(),
  topOffsetDivisor: z.number(),
  text: z.object({
    fontFamily: z.string(),
    fontSizeRatio: z.number(),
    maxFontSize: z.number(),
    color: z.string(),
    wordWrapWidthRatio: z.number(),
    align: z.string(),
    originX: z.number(),
    originY: z.number(),
    title: z.object({
      topOffsetRatio: z.number(),
      fontStyle: z.string(),
    }),
    relation: z.object({
      topOffsetRatio: z.number(),
      fontStyle: z.string(),
    }),
    description: z.object({
      topOffsetRatio: z.number(),
      fontStyle: z.string(),
    }),
  }),
  closeButton: z.object({
    bottomOffset: z.number(),
    event: z.string(),
  }),
});

export type PopupSceneConfig = z.infer<typeof PopupSceneConfigSchema>;

export const popupSceneConfig: PopupSceneConfig = {
  ...defaultOverlayBoxStyle,
  key: "PopupScene",
  assetsPath: "assets",
  images: [{ key: "close_button_sprite", file: "closebutton.png" }],
  widthRatio: 0.4,
  maxWidth: 700,
  heightRatio: 0.28,
  maxHeight: 200,
  rightMarginRatio: 0.03,
  topOffsetDivisor: 4,
  text: {
    fontFamily: "monospace",
    fontSizeRatio: 0.011,
    maxFontSize: 15,
    color: "#ffffff",
    wordWrapWidthRatio: 0.88,
    align: "center",
    originX: 0.5,
    originY: 0,
    title: {
      topOffsetRatio: 0.07,
      fontStyle: "bold",
    },
    relation: {
      topOffsetRatio: 0.2,
      fontStyle: "bold",
    },
    description: {
      topOffsetRatio: 0.34,
      fontStyle: "",
    },
  },
  closeButton: {
    bottomOffset: 30,
    event: "closeButtonClicked",
  },
};
