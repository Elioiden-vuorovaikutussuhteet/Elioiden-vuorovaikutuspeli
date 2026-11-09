export interface AssetEntry {
  key: string;
  file: string;
}

export interface GameSceneConfig {
  key: string;
  scenes: {
    menu: string;
    tutorial: string;
    gameOver: string;
  };
  assetsPath: string;
  images: AssetEntry[];
  startingMoney: number;
  hintCost: number;
  infoButton: {
    x: number;
    y: number;
  };
  hintButton: {
    x: number;
    y: number;
  };
  initialOrganismIndex: number;
  secondOrganismIndex: number;
  secondOrganismSpawnDelayMs: number;
}

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
  ],
  startingMoney: 1000,
  hintCost: 100,
  infoButton: {
    x: 40,
    y: 40,
  },
  hintButton: {
    x: 240,
    y: 40,
  },
  initialOrganismIndex: 0,
  secondOrganismIndex: 1,
  secondOrganismSpawnDelayMs: 3000,
};

export interface MenuSceneConfig {
  key: string;
  targetSceneKey: string;
  closeEvent: string;
  width: number;
  height: number;
  cornerRadius: number;
  backgroundColor: number;
  backgroundAlpha: number;
  borderWidth: number;
  borderColor: number;
  borderAlpha: number;
  text: {
    label: string;
    fontFamily: string;
    fontSize: string;
    fontStyle: string;
    color: string;
    origin: number;
  };
}

export const menuSceneConfig: MenuSceneConfig = {
  key: "MenuScene",
  targetSceneKey: "GameScene",
  closeEvent: "menuClosed",
  width: 400,
  height: 200,
  cornerRadius: 30,
  backgroundColor: 0x000000,
  backgroundAlpha: 0.7,
  borderWidth: 8,
  borderColor: 0xffffff,
  borderAlpha: 1,
  text: {
    label: "Start Game",
    fontFamily: "monospace",
    fontSize: "30px",
    fontStyle: "bold",
    color: "#ffffff",
    origin: 0.5,
  },
};

export interface TutorialSceneConfig {
  key: string;
  assetsPath: string;
  images: AssetEntry[];
  widthRatio: number;
  maxWidth: number;
  heightRatio: number;
  maxHeight: number;
  leftMarginRatio: number;
  topOffsetDivisor: number;
  cornerRadius: number;
  backgroundColor: number;
  backgroundAlpha: number;
  borderWidth: number;
  borderColor: number;
  borderAlpha: number;
  text: {
    content: string;
    topOffsetRatio: number;
    fontFamily: string;
    fontSizeRatio: number;
    maxFontSize: number;
    fontStyle: string;
    color: string;
    wordWrapWidthRatio: number;
    align: string;
    originX: number;
    originY: number;
  };
  closeButton: {
    bottomOffset: number;
    event: string;
  };
}

export const tutorialSceneConfig: TutorialSceneConfig = {
  key: "TutorialScene",
  assetsPath: "assets",
  images: [{ key: "close_button_sprite", file: "closebutton.png" }],
  widthRatio: 0.3,
  maxWidth: 450,
  heightRatio: 0.7,
  maxHeight: 600,
  leftMarginRatio: 0.05,
  topOffsetDivisor: 4,
  cornerRadius: 30,
  backgroundColor: 0x000000,
  backgroundAlpha: 0.7,
  borderWidth: 8,
  borderColor: 0xffffff,
  borderAlpha: 1,
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

export interface GameOverSceneConfig {
  key: string;
  scenesToStop: string[];
  restartSceneKey: string;
  width: number;
  height: number;
  cornerRadius: number;
  backgroundColor: number;
  backgroundAlpha: number;
  borderWidth: number;
  borderColor: number;
  borderAlpha: number;
  titleText: {
    label: string;
    offsetY: number;
    fontFamily: string;
    fontSize: string;
    fontStyle: string;
    color: string;
    origin: number;
  };
  retryButton: {
    label: string;
    offsetY: number;
    fontFamily: string;
    fontSize: string;
    fontStyle: string;
    color: string;
    origin: number;
  };
}

export const gameOverSceneConfig: GameOverSceneConfig = {
  key: "GameOverScene",
  scenesToStop: ["PopupScene"],
  restartSceneKey: "GameScene",
  width: 400,
  height: 200,
  cornerRadius: 30,
  backgroundColor: 0x000000,
  backgroundAlpha: 0.7,
  borderWidth: 8,
  borderColor: 0xffffff,
  borderAlpha: 1,
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