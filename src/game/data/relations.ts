export interface organismsRelations {
    source: string;
    target: string;
    value: -1 | 0 | 1;
    mult: number;
}

export const relations: organismsRelations[] = [
    { source: "acacia", target: "amf", value: 1, mult: 0.15 },
    { source: "acacia", target: "ants", value: 1, mult: 0.15 },
    { source: "acacia", target: "sapota", value: -1, mult: 0.15 },
    { source: "amf", target: "acacia", value: 1, mult: 0.15 },
    { source: "amf", target: "sapota", value: 1, mult: 0.15 },
    { source: "ants", target: "acacia", value: 1, mult: 0.15 },
    { source: "ants", target: "sapota", value: -1, mult: 0.15 },
    { source: "sapota", target: "acacia", value: -1, mult: 0.15 },
    { source: "sapota", target: "amf", value: 1, mult: 0.15 },
];