import Organism from "../entities/organism";
import { getRelation } from "../services/RelationsService";
import type { Connection } from "../types/Connection";

// interactionPulse is here
export default class InteractionManager {
  private organismMap: Map<string, Organism>;
  private interactions: Connection[];

  constructor(
    organismMap: Map<string, Organism>,
    interactions: Connection[],
  ) {
    this.organismMap = organismMap;
    this.interactions = interactions;
  }

  public async interactionPulse(
    startingOrganism: Organism,
    initialRelation: number,
  ) {
    const visited = new Set<string>();
    const queue: { id: string; pulse: number }[] = [];
    const pulses = new Map<string, number>();

    const startingId = startingOrganism.organismData.id;

    visited.add(startingId);
    pulses.set(startingId, initialRelation);

    queue.push({
      id: startingId,
      pulse: initialRelation,
    });

    // BFS to find all connected organisms
    while (queue.length > 0) {
      const current = queue.shift();

      if (!current) continue;

      const outgoingArrows = this.interactions.filter(
        (arrow) => arrow.from === current.id,
      );

      for (const arrow of outgoingArrows) {
        if (visited.has(arrow.to)) continue;

        const relationData = getRelation(arrow.from, arrow.to);
        const newPulse = current.pulse * relationData.value;

        visited.add(arrow.to);
        pulses.set(arrow.to, newPulse);

        queue.push({
          id: arrow.to,
          pulse: newPulse,
        });
      }
    }

    // Get each incoming arrow for the connected organisms and store all changes in health for the organism
    const healthChanges = new Map<string, number>();

    for (const [targetId] of pulses) {
      const incomingArrows = this.interactions.filter(
        (arrow) => arrow.to === targetId,
      );

      let totalChange = 0;

      for (const arrow of incomingArrows) {
        const sourceOrganism = this.organismMap.get(arrow.from);
        const sourcePulse = pulses.get(arrow.from);

        if (!sourceOrganism || sourcePulse === undefined) continue;

        const relationData = getRelation(arrow.from, arrow.to);

        totalChange +=
          sourcePulse *
          relationData.value *
          relationData.mult *
          (sourceOrganism.HP / 100);
      }

      healthChanges.set(targetId, totalChange);
    }

    // Call changehealth once to avoid wiggling
    for (const [targetId, totalChange] of healthChanges) {
      const targetOrganism = this.organismMap.get(targetId);

      if (!targetOrganism) continue;

      await new Promise((resolve) => setTimeout(resolve, 700));
      if (targetId !== startingId) {
        targetOrganism.changeHealth(totalChange);
      }
    }
  }
}
