import { z } from "zod";

export const ScoreConfigSchema = z.object({
  textX: z.number(),
  textY: z.number(),
  fontSize: z.string(),
  fontColor: z.string().meta({ input: "color" }),
  fontStyle: z.string(),
  gainAmount: z.number(),
  defaultLoseAmount: z.number(),

  minMoney: z.number(),

  coin: z.object({
    texture: z.string(),
    yOffset: z.number(),
    originX: z.number(),
    originY: z.number(),
    scale: z.number(),
    gap: z.number(),
    fallbackTextWidth: z.number(),
  }),

  change: z.object({
    gainThreshold: z.number(),
    positivePrefix: z.string(),
    xOffset: z.number(),
    startYOffset: z.number(),
    fontSize: z.string(),
    gainColor: z.string().meta({ input: "color" }),
    lossColor: z.string().meta({ input: "color" }),
    fontStyle: z.string(),
    gainEndYOffset: z.number(),
    lossEndYOffset: z.number(),
    endAlpha: z.number(),
    duration: z.number(),
    ease: z.string(),
  }),
});

export type ScoreConfig = z.infer<typeof ScoreConfigSchema>;

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