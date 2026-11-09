import Organism from "../entities/organism";
import { getRelation } from "../services/RelationsService";
import type { Connection } from "../types/Connection";
import { interactionConfig, type InteractionConfig } from "../config";

type ArrowPulseAnimationCallback = (
  fromId: string,
  toId: string,
  hpChange: number,
) => void;

export default class InteractionManager {
  private organismMap: Map<string, Organism>;
  private interactions: Connection[];
  private pulseAnimationCallback: ArrowPulseAnimationCallback;
  private config: InteractionConfig;
  private pulseWaitTime: number;

  constructor(
    organismMap: Map<string, Organism>,
    interactions: Connection[],
    pulseAnimationCallback: ArrowPulseAnimationCallback,
    config: Partial<InteractionConfig> = {},
  ) {
    this.organismMap = organismMap;
    this.interactions = interactions;
    this.pulseAnimationCallback = pulseAnimationCallback;
    this.config = { ...interactionConfig, ...config };
    this.pulseWaitTime = this.config.pulseWaitTime;
  }

  public async interactionPulse(
    startingOrganism: Organism,
    arrowOriginOrganism: Organism,
  ) {
    const visited = new Set<string>();
    const queue: { id: string; depth: number }[] = [];
    const depthGroups = new Map<number, string[]>();

    const startingId = startingOrganism.organismData.id;

    const outgoingArrowsByOrganism = new Map<string, Connection[]>();
    const pulseInteractions = [...this.interactions];

    const initialRelationData = getRelation(
      arrowOriginOrganism.organismData.id,
      startingOrganism.organismData.id,
    );
    const initialHealthChange =
      this.config.initialBaseHealthChange *
      initialRelationData.mult *
      initialRelationData.value *
      Math.sqrt(
        Math.max(0, arrowOriginOrganism.hp) /
          this.config.hpNormalizationDivisor,
      );

    this.pulseAnimationCallback(
      arrowOriginOrganism.organismData.id,
      startingOrganism.organismData.id,
      initialHealthChange,
    );

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
    queue.push({ id: startingId, depth: 0 });

    // Organisms get grouped by their distance from starting organism with BFS
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

    for (const organismIds of depthGroups.values()) {
      const healthChanges = new Map<string, number>();

      for (const sourceId of organismIds) {
        const sourceOrganism = this.organismMap.get(sourceId);
        if (!sourceOrganism) continue;

        const outgoingArrows = outgoingArrowsByOrganism.get(sourceId) ?? [];

        for (const arrow of outgoingArrows) {
          const relationData = getRelation(arrow.from, arrow.to);
          const sourceHPChange = sourceOrganism.hp - sourceOrganism.previousHP;
          const hpChange =
            sourceHPChange *
            relationData.mult *
            relationData.value *
            Math.sqrt(
              Math.max(0, sourceOrganism.hp) /
                this.config.hpNormalizationDivisor,
            );

          const currentChange = healthChanges.get(arrow.to) ?? 0;

          healthChanges.set(arrow.to, currentChange + hpChange);
          this.pulseAnimationCallback(arrow.from, arrow.to, hpChange);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, this.pulseWaitTime));

      for (const [targetId, healthChange] of healthChanges) {
        const targetOrganism = this.organismMap.get(targetId);
        if (!targetOrganism) continue;

        targetOrganism.changeHealth(healthChange);
      }
    }
  }
}