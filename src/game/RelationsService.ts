import { relations } from "./data/relations";
import type { organismsRelations } from "./data/relations";

type RelationValue = organismsRelations["value"];

export const getRelation = (
    organism1: string,
    organism2: string
): RelationValue => {
    return (
        relations.find(
            (relation) =>
                relation.source === organism1 && relation.target === organism2
        )?.value ?? 0
    );
};
