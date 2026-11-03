export interface ArrowUIConfig {
  positiveColor: number;
  negativeColor: number;
  permanentThickness: number;
  previewThickness: number;
  bidirectionalOffset: number;
}

export interface PermanentArrowUIConfig {
  defaultTargetOffset: number;
  defaultThickness: number;
  defaultLateralOffset: number;
  graphicsDepth: number;
  hitZoneDepth: number;
  hoverColor: number;
  hoverThicknessBonus: number;
  hitBoxPaddingOffset: number;
  hitDistanceToleranceOffset: number;
  pulsePositiveColor: number;
  pulseNegativeColor: number;
  pulseRadius: number;
  pulseDepth: number;
  pulseAlpha: number;
  pulseDuration: number;
}

export interface ButtonUIConfig {
  arrowButtonX: number;
  arrowButtonYOffset: number;
}

export interface UIConfig {
  arrows: ArrowUIConfig;
  permanentArrow: PermanentArrowUIConfig;
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
  permanentArrow: {
    defaultTargetOffset: 65,
    defaultThickness: 8,
    defaultLateralOffset: 0,
    graphicsDepth: 100,
    hitZoneDepth: 99,
    hoverColor: 0xffffff,
    hoverThicknessBonus: 4,
    hitBoxPaddingOffset: 6,
    hitDistanceToleranceOffset: 8,
    pulsePositiveColor: 0x04b504,
    pulseNegativeColor: 0xb83232,
    pulseRadius: 8,
    pulseDepth: 101,
    pulseAlpha: 0.8,
    pulseDuration: 1000,
  },
  buttons: {
    arrowButtonX: 60,
    arrowButtonYOffset: 50,
  },
};

export const arrowUIConfig = uiConfig.arrows;
export const permanentArrowUIConfig = uiConfig.permanentArrow;
export const buttonUIConfig = uiConfig.buttons;