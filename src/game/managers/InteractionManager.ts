import Organism from "../entities/organism";
import { getRelation } from "../services/RelationsService";
import type { Connection } from "../types/Connection";

// interactionPulse is here
export default class InteractionManager {
  private organismMap: Map<string, Organism>
  private interactions: { from: string; to: string }[];

  constructor(
    organismMap: Map<string, Organism>, 
    interactions: Connection[],
  ) {
    this.organismMap = organismMap;
    this.interactions = interactions;
  }

  public async interactionPulse(startingOrganism: Organism, initialRelation: number) {
      const visited = new Set<string>();
      const queue: { id: string; pulse: number }[] = [];
  
      visited.add(startingOrganism.organismData.id);
      queue.push({
        id: startingOrganism.organismData.id,
        pulse: initialRelation,
      });
  
      while (queue.length > 0) {
        const current = queue.shift();
  
        if (!current) {
          continue;
        }
  
        const neighbours = this.interactions
          .filter((relation) => relation.from === current.id)
          .map((relation) => relation.to);
  
        for (const element of neighbours) {
          if (!visited.has(element)) {
            const relationData = getRelation(current.id, element);
            const edgeRelation = relationData.value;
            const edgeMultiplier = relationData.mult;
  
            const newPulse = current.pulse * edgeRelation;
  
            visited.add(element);
            queue.push({
              id: element,
              pulse: newPulse,
            });
  
            const nodeOrganism = this.organismMap.get(current.id)!;
            const neighbourOrganism = this.organismMap.get(element)!;
  
            if (!nodeOrganism || !neighbourOrganism) {
              continue;
            }
  
            await new Promise(resolve => setTimeout(resolve, 100));
  
            neighbourOrganism.changeHealth(newPulse, edgeMultiplier, nodeOrganism.HP);
          }
        }
      }
    }
}