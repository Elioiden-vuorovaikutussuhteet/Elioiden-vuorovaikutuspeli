export interface ScoreConfig {
  textX: number;
  textY: number;
  fontSize: string;
  fontColor: string;
  fontStyle: string;
  gainAmount: number;
  defaultLoseAmount: number;

  minMoney: number;

  coin: {
    texture: string;
    yOffset: number;
    originX: number;
    originY: number;
    scale: number;
    gap: number;
    fallbackTextWidth: number;
  };

  change: {
    gainThreshold: number;
    positivePrefix: string;
    xOffset: number;
    startYOffset: number;
    fontSize: string;
    gainColor: string;
    lossColor: string;
    fontStyle: string;
    gainEndYOffset: number;
    lossEndYOffset: number;
    endAlpha: number;
    duration: number;
    ease: string;
  };
}

export const scoreConfig: ScoreConfig = {
  textX: 140,
  textY: 25,
  fontSize: "30px",
  fontColor: "#000000",
  fontStyle: "bold",
  gainAmount: 10,
  defaultLoseAmount: 20,
  minMoney: 0,

  coin: {
    texture: "coin",
    yOffset: 15,
    originX: 0,
    originY: 0.5,
    scale: 0.65,
    gap: 8,
    fallbackTextWidth: 75,
  },

  change: {
    gainThreshold: 0,
    positivePrefix: "+",
    xOffset: 10,
    startYOffset: 35,
    fontSize: "24px",
    gainColor: "#067d1d",
    lossColor: "#d91616",
    fontStyle: "bold",
    gainEndYOffset: 20,
    lossEndYOffset: 55,
    endAlpha: 0,
    duration: 900,
    ease: "Cubic.easeOut",
  },
};
