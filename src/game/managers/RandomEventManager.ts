import type Organism from "../entities/organism";
import { randomEvents } from "../data/RandomEvents";
import type { RandomEventData } from "../data/RandomEvents";
import type Phaser from "phaser";
import type ArrowManager from "./ArrowManager";

export default class RandomEventManager {
  private randomEventTimer?: ReturnType<typeof setInterval>;
  private occurrenceCounts = new Map<string, number>();
  private totalOccurrences = 0;
  private maxOccurrencesPerGame = 4;

  public startRandomEvents(
    _scene: Phaser.Scene,
    organisms: Organism[],
    arrowManager: ArrowManager,
    checkIntervalMs: number,
    chance: number,
    maxOccurrencesPerGame = 4,
    removeOrganism?: (organism: Organism) => void,
    playLightningAnimation?: (lightningEffects: () => void) => void,
  ): void {
    if (this.randomEventTimer) return;
    this.maxOccurrencesPerGame = maxOccurrencesPerGame;

    this.randomEventTimer = setInterval(() => {
      if (this.totalOccurrences >= this.maxOccurrencesPerGame) {
        this.stopRandomEvents();
        return;
      }
      if (Math.random() < chance) {
        this.triggerRandomEvent(
          organisms,
          arrowManager,
          removeOrganism,
          playLightningAnimation,
        );
      }
    }, checkIntervalMs);
  }

  public stopRandomEvents(): void {
    if (this.randomEventTimer !== undefined) {
      clearInterval(this.randomEventTimer);
      this.randomEventTimer = undefined;
    }
}

  public triggerRandomEvent(
    organisms: Organism[],
    arrowManager: ArrowManager,
    removeOrganism?: (organism: Organism) => void,
    playLightningAnimation?: (lightningEffects: () => void) => void,
  ): void {
    if (this.totalOccurrences >= this.maxOccurrencesPerGame) {
      this.stopRandomEvents();
      return;
    }

    const event = this.selectEvent();

    if (!event) {
      return;
    }

    const targetPool = organisms.filter((organism) =>
      event.affectedOrganisms.includes(organism.organismData.id),
    );

    if (targetPool.length === 0) {
      return;
    }

    const occurrenceCount = this.occurrenceCounts.get(event.id) ?? 0;
    if (
      event.maxOccurrencesPerGame !== undefined &&
      occurrenceCount >= event.maxOccurrencesPerGame
    ) {
      return;
    }

    this.occurrenceCounts.set(event.id, occurrenceCount + 1);
    this.totalOccurrences++;
    if (this.totalOccurrences >= this.maxOccurrencesPerGame) {
      this.stopRandomEvents();
    }

    // Healing events use the whole target pool; all other events affect one randomly selected organism.
    const targets =
      event.effect.type === "healAll"
        ? targetPool
        : [targetPool[Math.floor(Math.random() * targetPool.length)]];

    if (event.effect.type === "remove") {
      const target = targets[0];
      if (!target) return;

      const applyEffect = () => {
        removeOrganism?.(target);
        console.log(
          "RANDOM EVENT HAPPENED",
          `${event.name} happened`,
        );
      };

      if (playLightningAnimation) {
        playLightningAnimation(applyEffect);
      } else {
        applyEffect();
      }
      return;
    }

    // healthchange parameter is damaging if type is "damage", otherwise heal
    const healthChange =
    event.effect.type === "damage"
    ? -event.effect.amount
    : event.effect.amount;


    arrowManager.playRandomEventPulses(
    targets.map((organism) => organism.organismData.id),
    healthChange,
  );


    console.log(
      "RANDOM EVENT HAPPENED",
      `${event.name} happened`,
    );
  }

// Weighted random selection is used to select random event
private selectEvent(): RandomEventData {
  const availableEvents = randomEvents.filter((event) => {
    const occurrenceCount = this.occurrenceCounts.get(event.id) ?? 0;
    return (
      event.maxOccurrencesPerGame === undefined ||
      occurrenceCount < event.maxOccurrencesPerGame
    );
  });

  if (availableEvents.length === 0) {
    throw new Error("No random events are available");
  }

  const totalChance = availableEvents.reduce(
    (sum, event) => sum + event.chance,
    0,
  );

  let random = Math.random() * totalChance;

  for (const event of availableEvents) {
    random -= event.chance;

    if (random < 0) {
      return event;
    }
  }

  return availableEvents[availableEvents.length - 1];
}
}