import {
  ArrowUIConfigSchema,
  PermanentArrowUIConfigSchema,
  arrowUIConfig,
  permanentArrowUIConfig,
} from "./arrowConfig";
import {
  ButtonLayoutUIConfigSchema,
  ArrowButtonUIConfigSchema,
  CursorButtonUIConfigSchema,
  InfoButtonUIConfigSchema,
  CloseButtonUIConfigSchema,
  HintButtonUIConfigSchema,
  buttonUIConfig,
  arrowButtonUIConfig,
  cursorButtonUIConfig,
  infoButtonUIConfig,
  closeButtonUIConfig,
  hintButtonUIConfig,
} from "./buttonConfig";
import { CameraConfigSchema, cameraConfig } from "./cameraConfig";
import { ForceLayoutConfigSchema, DEFAULT_FORCE_CONFIG } from "./forceConfig";
import { GlowConfigSchema, glowConfig } from "./glowConfig";
import {
  InteractionConfigSchema,
  interactionConfig,
} from "./interactionConfig";
import { OrganismUIConfigSchema, organismUIConfig } from "./organismConfig";
import {
  GameSceneConfigSchema,
  MenuSceneConfigSchema,
  TutorialSceneConfigSchema,
  GameOverSceneConfigSchema,
  PopupSceneConfigSchema,
  gameSceneConfig,
  menuSceneConfig,
  tutorialSceneConfig,
  gameOverSceneConfig,
  popupSceneConfig,
} from "./sceneConfig";
import { ScoreConfigSchema, scoreConfig } from "./scoreConfig";
import { UIConfigSchema, uiConfig } from "./uiConfig";

export const configRegistry = [
  {
    id: "camera",
    label: "Camera",
    sections: [
      {
        id: "camera",
        label: "Camera Settings",
        schema: CameraConfigSchema,
        defaults: cameraConfig,
      },
    ],
  },
  {
    id: "force",
    label: "Force",
    sections: [
      {
        id: "force",
        label: "Force Layout",
        schema: ForceLayoutConfigSchema,
        defaults: DEFAULT_FORCE_CONFIG,
      },
    ],
  },
  {
    id: "glow",
    label: "Glow",
    sections: [
      {
        id: "glow",
        label: "Glow Settings",
        schema: GlowConfigSchema,
        defaults: glowConfig,
      },
    ],
  },
  {
    id: "interaction",
    label: "Interaction",
    sections: [
      {
        id: "interaction",
        label: "Interaction Settings",
        schema: InteractionConfigSchema,
        defaults: interactionConfig,
      },
    ],
  },
  {
    id: "organism",
    label: "Organism",
    sections: [
      {
        id: "organism",
        label: "Organism Settings",
        schema: OrganismUIConfigSchema,
        defaults: organismUIConfig,
      },
    ],
  },
  {
    id: "scene",
    label: "Scene",
    sections: [
      {
        id: "game",
        label: "Game Scene",
        schema: GameSceneConfigSchema,
        defaults: gameSceneConfig,
      },
      {
        id: "menu",
        label: "Menu Scene",
        schema: MenuSceneConfigSchema,
        defaults: menuSceneConfig,
      },
      {
        id: "tutorial",
        label: "Tutorial Scene",
        schema: TutorialSceneConfigSchema,
        defaults: tutorialSceneConfig,
      },
      {
        id: "gameOver",
        label: "Game Over Scene",
        schema: GameOverSceneConfigSchema,
        defaults: gameOverSceneConfig,
      },
      {
        id: "popup",
        label: "Popup Scene",
        schema: PopupSceneConfigSchema,
        defaults: popupSceneConfig,
      },
    ],
  },
  {
    id: "score",
    label: "Score",
    sections: [
      {
        id: "score",
        label: "Score Settings",
        schema: ScoreConfigSchema,
        defaults: scoreConfig,
      },
    ],
  },
  {
    id: "ui",
    label: "UI",
    sections: [
      {
        id: "ui",
        label: "UI Settings",
        schema: UIConfigSchema,
        defaults: uiConfig,
      },
      {
        id: "arrows",
        label: "Arrows",
        schema: ArrowUIConfigSchema,
        defaults: arrowUIConfig,
      },
      {
        id: "permanentArrow",
        label: "Permanent Arrow",
        schema: PermanentArrowUIConfigSchema,
        defaults: permanentArrowUIConfig,
      },
      {
        id: "buttonLayout",
        label: "Button Layout",
        schema: ButtonLayoutUIConfigSchema,
        defaults: buttonUIConfig,
      },
      {
        id: "arrowButton",
        label: "Arrow Button",
        schema: ArrowButtonUIConfigSchema,
        defaults: arrowButtonUIConfig,
      },
      {
        id: "cursorButton",
        label: "Cursor Button",
        schema: CursorButtonUIConfigSchema,
        defaults: cursorButtonUIConfig,
      },
      {
        id: "infoButton",
        label: "Info Button",
        schema: InfoButtonUIConfigSchema,
        defaults: infoButtonUIConfig,
      },
      {
        id: "closeButton",
        label: "Close Button",
        schema: CloseButtonUIConfigSchema,
        defaults: closeButtonUIConfig,
      },
      {
        id: "hintButton",
        label: "Hint Button",
        schema: HintButtonUIConfigSchema,
        defaults: hintButtonUIConfig,
      },
    ],
  },
] as const;