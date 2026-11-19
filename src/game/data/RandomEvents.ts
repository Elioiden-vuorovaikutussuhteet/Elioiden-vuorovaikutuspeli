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
  maxOccurrencesPerGame?: number;
  effect: RandomEventEffect;
}

export const randomEvents: RandomEventData[] = [
  {
    id: "lightningStrike",
    name: "Lightning Strike",
    affectedOrganisms: ["sapota", "acacia"],
    chance: 50,
    maxOccurrencesPerGame: 1,
    effect: {
      type: "damage",
      amount: 100,
    },
  },
  {
  id: "carcass",
  name: "Carcass",
  affectedOrganisms: ["amf"],
  chance: 50,
  effect: {
    type: "heal",
    amount: 40,
  },
},
];