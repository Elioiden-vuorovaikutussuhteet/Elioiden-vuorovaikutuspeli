import { relations } from "../data/relations";
import type { organismsRelations } from "../data/relations";

type RelationValue = organismsRelations["value"];
type RelationMult = organismsRelations["mult"];

export const getRelation = (
    organism1: string,
    organism2: string
): { value: RelationValue; mult: RelationMult } => {
        const relation= relations.find(
            (relation) =>
                relation.source === organism1 && relation.target === organism2
        );
    return {
        value: relation?.value ?? 0,
        mult: relation?.mult ?? 0,
    }
};