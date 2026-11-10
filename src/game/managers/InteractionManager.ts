import Organism from "../entities/organism";
import { getRelation } from "../services/RelationsService";
import type { Connection } from "../types/Connection";
import { interactionConfig, type InteractionConfig } from "../config";

type ArrowPulseAnimationCallback = (
  fromId: string,
  toId: string,
  hpChange: number,
) => void;

const MIN_HP_CHANGE_THRESHOLD = 1e-4;

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
    const originId = arrowOriginOrganism.organismData.id;

    const outgoingArrowsByOrganism = new Map<string, Connection[]>();

    const initialRelationData = getRelation(originId, startingId);
    const initialHealthChange =
      this.config.initialBaseHealthChange *
      initialRelationData.mult *
      initialRelationData.value *
      Math.sqrt(
        Math.max(0, arrowOriginOrganism.hp) /
          this.config.hpNormalizationDivisor,
      );

    if (Math.abs(initialHealthChange) <= MIN_HP_CHANGE_THRESHOLD) {
      return;
    }

    this.pulseAnimationCallback(originId, startingId, initialHealthChange);

    await new Promise((resolve) => setTimeout(resolve, this.pulseWaitTime));
    startingOrganism.changeHealth(initialHealthChange);

    for (const arrow of this.interactions) {
      if (arrow.from === originId && arrow.to === startingId) {
        continue;
      }

      let arrows = outgoingArrowsByOrganism.get(arrow.from);
      if (!arrows) {
        arrows = [];
        outgoingArrowsByOrganism.set(arrow.from, arrows);
      }
      arrows.push(arrow);
    }

    visited.add(startingId);
    queue.push({ id: startingId, depth: 0 });

    let head = 0;
    while (head < queue.length) {
      const current = queue[head++];

      let group = depthGroups.get(current.depth);
      if (!group) {
        group = [];
        depthGroups.set(current.depth, group);
      }
      group.push(current.id);

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

        const sourceHPChange = sourceOrganism.hp - sourceOrganism.previousHP;
        if (Math.abs(sourceHPChange) <= MIN_HP_CHANGE_THRESHOLD) continue;

        const outgoingArrows = outgoingArrowsByOrganism.get(sourceId) ?? [];
        const hpScale = Math.sqrt(
          Math.max(0, sourceOrganism.hp) / this.config.hpNormalizationDivisor,
        );

        for (const arrow of outgoingArrows) {
          const relationData = getRelation(arrow.from, arrow.to);
          const hpChange =
            sourceHPChange * relationData.mult * relationData.value * hpScale;

          if (Math.abs(hpChange) <= MIN_HP_CHANGE_THRESHOLD) continue;

          const currentChange = healthChanges.get(arrow.to) ?? 0;
          healthChanges.set(arrow.to, currentChange + hpChange);
          this.pulseAnimationCallback(arrow.from, arrow.to, hpChange);
        }
      }

      // If no meaningful health changes occurred at this depth, skip waiting and stop early
      if (healthChanges.size === 0) break;

      await new Promise((resolve) => setTimeout(resolve, this.pulseWaitTime));

      for (const [targetId, healthChange] of healthChanges) {
        this.organismMap.get(targetId)?.changeHealth(healthChange);
      }
    }
  }
}