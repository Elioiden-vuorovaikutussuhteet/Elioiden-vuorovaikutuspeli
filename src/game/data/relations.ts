export interface organismsRelations {
    source: string;
    target: string;
    value: -1 | 0 | 1;
}

export const relations: organismsRelations[] = [
    { source: "acacia", target: "amf", value: 1 },
    { source: "acacia", target: "ants", value: 1 },
    { source: "acacia", target: "sapota", value: -1 },
    { source: "amf", target: "acacia", value: 1 },
    { source: "amf", target: "sapota", value: 1 },
    { source: "ants", target: "acacia", value: 1 },
    { source: "ants", target: "sapota", value: -1 },
    { source: "sapota", target: "acacia", value: -1 },
    { source: "sapota", target: "amf", value: 1 },
];