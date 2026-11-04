export interface ScoreConfig {
  textX: number;
  textY: number;
  fontSize: string;
  fontColor: string;
  fontStyle: string;
  gainAmount: number;
  defaultLoseAmount: number;
}

export const scoreConfig: ScoreConfig = {
  textX: 100,
  textY: 25,
  fontSize: "30px",
  fontColor: "#000000",
  fontStyle: "bold",
  gainAmount: 10,
  defaultLoseAmount: 20,
};