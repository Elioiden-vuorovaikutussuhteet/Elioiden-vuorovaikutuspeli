export type RandomEventEffect =
  | {
      type: "damage";
      amount: number;
    }
  | {
      type: "heal";
      amount: number;
    }
  | {
      type: "healAll";
      amount: number;
    };

export interface RandomEventData {
  id: string;
  name: string;
  affectedOrganisms: string[];
  chance: number;
  effect: RandomEventEffect;
}

export const randomEvents: RandomEventData[] = [
  {
    id: "lightningStrike",
    name: "Lightning Strike",
    affectedOrganisms: ["sapota", "acacia"],
    chance: 50,
    effect: {
      type: "damage",
      amount: 100,
    },
  },
  {
  id: "rain",
  name: "Rain",
  affectedOrganisms: ["sapota", "acacia","amf","diazotroph","mycorrhizahelper"],
  chance: 30,
  effect: {
    type: "healAll",
    amount: 40,
  },
},
];