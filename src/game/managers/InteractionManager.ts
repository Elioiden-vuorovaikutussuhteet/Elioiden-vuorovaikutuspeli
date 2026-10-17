import Organism from "../entities/organism";
import { getRelation } from "../services/RelationsService";
import type { Connection } from "../types/Connection";

// interactionPulse is here
export default class InteractionManager {
  private organismMap: Map<string, Organism>;
  private interactions: Connection[];

  private pulseWaitTime: number;

  constructor(
    organismMap: Map<string, Organism>,
    interactions: Connection[],
  ) {
    this.organismMap = organismMap;
    this.interactions = interactions;
    this.pulseWaitTime = 1000
  }

public async interactionPulse(startingOrganism: Organism, arrowOriginOrganism: Organism) {
    const visited = new Set<string>();
    const queue: { id: string; depth: number }[] = [];
    const depthGroups = new Map<number, string[]>();

    const startingId = startingOrganism.organismData.id;

    const outgoingArrowsByOrganism = new Map<string, Connection[]>();
    const pulseInteractions = [...this.interactions];

    const initialRelationData = getRelation(arrowOriginOrganism.organismData.id, startingOrganism.organismData.id);
    const initialHealthChange = 5 * initialRelationData.mult * initialRelationData.value;
    // call pulse animation of initial arrow here
    await new Promise((resolve) => setTimeout(resolve, this.pulseWaitTime));
    startingOrganism.changeHealth(initialHealthChange);

    for (const arrow of pulseInteractions) {
      if (
        arrow.from === arrowOriginOrganism.organismData.id &&
        arrow.to === startingOrganism.organismData.id
      ) {
        continue;
      }

      const arrows = outgoingArrowsByOrganism.get(arrow.from) ?? [];

      arrows.push(arrow);
      outgoingArrowsByOrganism.set(arrow.from, arrows);
}

    visited.add(startingId);

    queue.push({
      id: startingId,
      depth: 0,
    });

    // organisms get grouped by their distance from starting organism with BFS
    while (queue.length > 0) {
      const current = queue.shift();

      if (!current) continue;

      if (!depthGroups.has(current.depth)) {
        depthGroups.set(current.depth, []);
      }

      depthGroups.get(current.depth)!.push(current.id);

      const outgoingArrows = outgoingArrowsByOrganism.get(current.id) ?? [];

      for (const arrow of outgoingArrows) {
        if (visited.has(arrow.to)) continue;

        visited.add(arrow.to);

        queue.push({
          id: arrow.to,
          depth: current.depth + 1,
        });
      }
    }

    /* 
    do health changes depth by depth for spreading pulse effect
    this version means one organisms health can change multiple times during 1 pulse, 
    without arrow animations it can look a bit confusing
    commented out is a version where each organism changes health only once during the pulse, which without arrow animations 
    may look a bit nicer, and is closer to the original pulse implementation, but interaction wise makes less sense

    possible change if this doesn't work exactly as wanted: snapshot every organisms previousHP here instead of in changeHealth()
    */

    // const hasChangedHealth = new Set<string>();

    for (const organismIds of depthGroups.values()) {
      const healthChanges = new Map<string, number>();

      for (const sourceId of organismIds) {
        const sourceOrganism = this.organismMap.get(sourceId);

        if (!sourceOrganism) continue;

        const outgoingArrows = outgoingArrowsByOrganism.get(sourceId) ?? [];

        for (const arrow of outgoingArrows) {
          const relationData = getRelation(arrow.from, arrow.to);
          const sourceHPChange = sourceOrganism.hp - sourceOrganism.previousHP;
          const hpChange = sourceHPChange * relationData.mult * relationData.value;
          
          const currentChange = healthChanges.get(arrow.to) ?? 0;

          healthChanges.set(arrow.to, currentChange + hpChange);
          // once arrows are a referrable object, call its' pulse animation here
        }
      }
      await new Promise((resolve) => setTimeout(resolve, this.pulseWaitTime));

      for (const [targetId, healthChange] of healthChanges) {
        // if (hasChangedHealth.has(targetId)) continue;

        const targetOrganism = this.organismMap.get(targetId);
        if (!targetOrganism) continue;

        targetOrganism.changeHealth(healthChange);
        // hasChangedHealth.add(targetId);
      }
    }
  }
}
