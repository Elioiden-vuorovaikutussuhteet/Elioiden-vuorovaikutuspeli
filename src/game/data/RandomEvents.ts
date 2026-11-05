export interface RandomEventData {
  id: string;
  name: string;
  affectedOrganisms: string[];
  chance: number;
}

export const randomEvents: RandomEventData[] = [
  {
  id: "lightningStrike",
  name: "Lightning Strike",
  affectedOrganisms: ["sapota", "acacia"],
  chance: 1,
  },
]