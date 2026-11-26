import { z } from "zod";

export const AssetEntrySchema = z.object({
  key: z.string(),
  file: z.string(),
});

export type AssetEntry = z.infer<typeof AssetEntrySchema>;

export const OverlayBoxStyleSchema = z.object({
  cornerRadius: z.number(),
  backgroundColor: z
    .number()
    .int()
    .min(0)
    .max(0xffffff)
    .meta({ input: "color" }),
  backgroundAlpha: z.number(),
  borderWidth: z.number(),
  borderColor: z.number().int().min(0).max(0xffffff).meta({ input: "color" }),
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
    gameOver: z.string(),
    options: z.string(),
  }),
  assetsPath: z.string(),
  images: z.array(AssetEntrySchema),
  startingMoney: z.number(),
  hintCost: z.number(),
  menuButton: z.object({
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
  randomEventCheckIntervalMs: z.number(),
  randomEventChance: z.number().min(0).max(1),
  randomEventMaxPerGame: z.number().int().min(0),
});

export type GameSceneConfig = z.infer<typeof GameSceneConfigSchema>;

export const gameSceneConfig: GameSceneConfig = {
  key: "GameScene",
  scenes: {
    menu: "MenuScene",
    gameOver: "GameOverScene",
    options: "OptionsScene",
  },
  assetsPath: "assets",
  images: [
    { key: "acacia_sprite", file: "bullhornacacia.png" },
    { key: "amf_sprite", file: "amf.png" },
    { key: "greenbutton", file: "greenbutton.png" },
    { key: "redbutton", file: "redbutton.png" },
    { key: "menubutton_sprite", file: "menubutton.png" },
    { key: "ants_sprite", file: "ants.png" },
    { key: "antfootbacteria_sprite", file: "antfootbacteria.png" },
    { key: "sapota_sprite", file: "sapota.png" },
    { key: "broken_acacia_sprite", file: "brokenacacia.png" },
    { key: "broken_sapota_sprite", file: "brokensapota.png" },
    { key: "diazotroph_sprite", file: "diazotroph.png" },
    { key: "mycorrhizahelper_sprite", file: "mycorrhizabacteria.png" },
    { key: "acaciapathogen_sprite", file: "acaciapathogen.png" },
    { key: "antpathogen_sprite", file: "antpathogen.png" },
    { key: "pos_particle", file: "pos_particle.png" },
    { key: "neg_particle", file: "neg_particle.png" },
    { key: "cursor", file: "cursor.png" },
    { key: "coin", file: "coin.png" },
  ],
  startingMoney: 1000,
  hintCost: 100,
  menuButton: { x: 40, y: 40 },
  hintButton: { x: 300, y: 40 },
  initialOrganismIndex: 0,
  secondOrganismIndex: 1,
  secondOrganismSpawnDelayMs: 3000,
  randomEventSpawnDelayMs: 3000,
  randomEventCheckIntervalMs: 30000,
  randomEventChance: 0.25,
  randomEventMaxPerGame: 4,
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
    color: z.string().meta({ input: "color" }),
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
    color: z.string().meta({ input: "color" }),
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
  widthRatio: 0.4,
  maxWidth: 550,
  heightRatio: 0.9,
  maxHeight: 800,
  leftMarginRatio: 0.05,
  topOffsetDivisor: 2.7,
  text: {
    content: [
      "Select whether you want to draw a positive (green arrow) or negative (red arrow) relationship by clicking on the corresponding arrow button and choosing the starting and ending organism.",
      "Click the cursor button and then an arrow or organism to check a relationship's or organism's description.",
      "Get a hint when stuck by clicking the Hint button, which will subtract 100 from your score. Two organisms with a missing relationship will be highlighted.",
      "Move organisms around by pressing the Shift button on your keyboard and clicking the organism.",
      "Zoom in or out and move the view of the screen up, down, left and right by pressing the arrow keys on your keyboard.",
      "The starting score is 1000. Correct relationships add 10 points and incorrect relationships subtract 20 points from your score.",
      "You may encounter random events during the game, which will either negatively or positively affect organisms and their relationships.",
    ].join("\n\n"),
    topOffsetRatio: 0.05,
    fontFamily: "monospace",
    fontSizeRatio: 0.015,
    maxFontSize: 17,
    fontStyle: "",
    color: "#ffffff",
    wordWrapWidthRatio: 0.88,
    align: "center",
    originX: 0.5,
    originY: 0,
  },
  closeButton: {
    bottomOffset: 40,
    event: "closeButtonClicked",
  },
};

export const SettingsSceneConfigSchema = OverlayBoxStyleSchema.extend({
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
    color: z.string().meta({ input: "color" }),
    wordWrapWidthRatio: z.number(),
    align: z.string(),
    originX: z.number(),
    originY: z.number(),
  }),
  closeButton: z.object({
    bottomOffset: z.number(),
    event: z.string(),
  }),
  pulseButtons: z.object({
    speeds: z.object({
      slow: z.number(),
      normal: z.number(),
      fast: z.number(),
    }),
    bottomOffset: z.number(),
    leftOffsets: z.object({
      slow: z.number(),
      normal: z.number(),
      fast: z.number(),
    }),
    event: z.string(),
  }),
});

export type SettingsSceneConfig = z.infer<typeof SettingsSceneConfigSchema>;

export const settingsSceneConfig: SettingsSceneConfig = {
  ...defaultOverlayBoxStyle,
  key: "SettingsScene",
  assetsPath: "assets",
  images: [
    { key: "close_button_sprite", file: "closebutton.png" },
    { key: "pulsebutton_sprite", file: "pulsebutton.png" },
  ],
  widthRatio: 0.3,
  maxWidth: 450,
  heightRatio: 0.7,
  maxHeight: 600,
  leftMarginRatio: 0.05,
  topOffsetDivisor: 2.7,
  text: {
    content: ["Select the desired pulse speed:"].join("\n"),
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
  pulseButtons: {
    speeds: {
      slow: 2000,
      normal: 1000,
      fast: 500,
    },
    bottomOffset: 200,
    leftOffsets: {
      slow: 75,
      normal: 225,
      fast: 375,
    },
    event: "pulseButtonClicked",
  },
};

export const OptionsSceneConfigSchema = OverlayBoxStyleSchema.extend({
  key: z.string(),
  scenes: z.object({
    tutorial: z.string(),
    settings: z.string(),
  }),
  assetsPath: z.string(),
  images: z.array(AssetEntrySchema),
  widthRatio: z.number(),
  maxWidth: z.number(),
  heightRatio: z.number(),
  maxHeight: z.number(),
  leftMarginRatio: z.number(),
  topOffsetDivisor: z.number(),
  infoButton: z.object({
    leftOffset: z.number(),
    bottomOffset: z.number(),
    event: z.string(),
  }),
  settingsButton: z.object({
    leftOffset: z.number(),
    bottomOffset: z.number(),
    event: z.string(),
  }),
});

export type OptionsSceneConfig = z.infer<typeof OptionsSceneConfigSchema>;

export const optionsSceneConfig: OptionsSceneConfig = {
  ...defaultOverlayBoxStyle,
  key: "OptionsScene",
  scenes: {
    tutorial: "TutorialScene",
    settings: "SettingsScene",
  },
  assetsPath: "assets",
  images: [
    { key: "infobutton_sprite", file: "altinfo.png" },
    { key: "settingsbutton_sprite", file: "settingsbutton.png" },
  ],
  widthRatio: 0.5,
  maxWidth: 250,
  heightRatio: 0.15,
  maxHeight: 100,
  leftMarginRatio: 0.1,
  topOffsetDivisor: 50,
  infoButton: {
    leftOffset: 70,
    bottomOffset: 50,
    event: "infoButtonClicked",
  },
  settingsButton: {
    leftOffset: 170,
    bottomOffset: 50,
    event: "settingsButtonClicked",
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
    color: z.string().meta({ input: "color" }),
    origin: z.number(),
  }),
  retryButton: z.object({
    label: z.string(),
    offsetY: z.number(),
    fontFamily: z.string(),
    fontSize: z.string(),
    fontStyle: z.string(),
    color: z.string().meta({ input: "color" }),
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
    color: z.string().meta({ input: "color" }),
    wordWrapWidthRatio: z.number(),
    align: z.string(),
    originX: z.number(),
    originY: z.number(),
    title: z.object({
      topOffsetRatio: z.number(),
      fontStyle: z.string(),
      color: z.string().meta({ input: "color" }),
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
  widthRatio: 0.8,
  maxWidth: 1000,
  heightRatio: 0.28,
  maxHeight: 200,
  rightMarginRatio: 0.03,
  topOffsetDivisor: 4,
  text: {
    fontFamily: "monospace",
    fontSizeRatio: 0.011,
    maxFontSize: 18,
    color: "#ffffff",
    wordWrapWidthRatio: 0.88,
    align: "center",
    originX: 0.5,
    originY: 0,
    title: {
      topOffsetRatio: 0.07,
      fontStyle: "bold",
      color: "#ffd900",
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

export const OrganismInfoSceneConfigSchema = OverlayBoxStyleSchema.extend({
  key: z.string(),
  assetsPath: z.string(),
  images: z.array(AssetEntrySchema),
  widthRatio: z.number(),
  maxWidth: z.number(),
  heightRatio: z.number(),
  maxHeight: z.number(),
  rightMarginRatio: z.number(),
  horizontalOffsetRatio: z.number().min(-0.5).max(0.5),
  topOffsetDivisor: z.number(),
  text: z.object({
    fontFamily: z.string(),
    fontSizeRatio: z.number(),
    maxFontSize: z.number(),
    color: z.string().meta({ input: "color" }),
    wordWrapWidthRatio: z.number(),
    align: z.string(),
    originX: z.number(),
    originY: z.number(),
    title: z.object({
      topOffsetRatio: z.number(),
      fontStyle: z.string(),
    }),
    description: z.object({
      topOffsetRatio: z.number(),
      fontStyle: z.string(),
    }),
    links: z.object({
      topOffsetRatio: z.number(),
      fontStyle: z.string(),
      color: z.string().meta({ input: "color" }),
    }),
  }),
  closeButton: z.object({
    bottomOffset: z.number(),
    event: z.string(),
  }),
});

export type OrganismInfoSceneConfig = z.infer<
  typeof OrganismInfoSceneConfigSchema
>;

export const organismInfoSceneConfig: OrganismInfoSceneConfig = {
  ...defaultOverlayBoxStyle,
  key: "OrganismInfoScene",
  assetsPath: "assets",
  images: [{ key: "close_button_sprite", file: "closebutton.png" }],
  widthRatio: 0.4,
  maxWidth: 700,
  heightRatio: 0.28,
  maxHeight: 200,
  rightMarginRatio: 0.03,
  horizontalOffsetRatio: 0,
  topOffsetDivisor: 9,
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
    description: {
      topOffsetRatio: 0.2,
      fontStyle: "",
    },
    links: {
      topOffsetRatio: 0.34,
      fontStyle: "italic",
      color: "#7ec8ff",
    },
  },
  closeButton: {
    bottomOffset: 30,
    event: "closeButtonClicked",
  },
};
