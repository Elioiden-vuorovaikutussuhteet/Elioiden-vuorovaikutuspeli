export interface ArrowUIConfig {
  positiveColor: number;
  negativeColor: number;
  permanentThickness: number;
  previewThickness: number;
  bidirectionalOffset: number;
}

export interface ButtonUIConfig {
  arrowButtonX: number;
  arrowButtonYOffset: number;
}

export interface UIConfig {
  arrows: ArrowUIConfig;
  buttons: ButtonUIConfig;
}

export const uiConfig: UIConfig = {
  arrows: {
    positiveColor: 0x064f15,
    negativeColor: 0xed0924,
    permanentThickness: 8,
    previewThickness: 2,
    bidirectionalOffset: 25,
  },
  buttons: {
    arrowButtonX: 60,
    arrowButtonYOffset: 50,
  },
};

export const arrowUIConfig = uiConfig.arrows;
export const buttonUIConfig = uiConfig.buttons;