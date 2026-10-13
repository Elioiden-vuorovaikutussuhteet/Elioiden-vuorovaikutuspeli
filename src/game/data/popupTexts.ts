export interface PopupText {
    description: string;
}

export function getInteractionId(
    first: string,
    second: string,
): string {
    return `${first}-${second}`;
}

export const popupTexts: Record<string, PopupText> = {
    "acacia-amf": {
        description: "Bullhorn acacia provides the arbuscular mycorrhizal symbiosis forming glomeromycete fungi with high energy carbohydrates."
    },

    "amf-acacia": {
        description: "Fungi belonging to the taxa Glomeromycota form arbuscular mycorrhizal symbiosis with acacia trees and provide Bullhorn acacias with water and nutrients, phosphorus in particular. "
    },

    "acacia-ants": {
        description: "Bullhorn acacias protect the ant queen, eggs and larvae from elements and predators. Bullhorn acacias provide adult ants also with high energy nectar and larvae with Beltian bodies high with protein, fats and vitamins."
    },

    "ants-acacia": {
        description: "Ants remove shading plant branches, vines and vegetation growing at the base of the trees. They also protect bullhorn acacia aggressively against herbivores such as insects and rodents. "
    },
    "sapota-amf": {
        description: "Sapodilla tree provides the arbuscular mycorrhizal fungi with high energy carbohydrates. "
    },
    "amf-sapota": {
        description: "Fungi belonging to the taxa Glomeromycota form arbuscular mycorrhizal symbiosis provide Sapodilla trees with water and nutrients, particularly phosphorus and nitrogen. "
    },
    "sapota-acacia": {
        description: "Sapodilla tree competes for nutrients and light with Bullhorn acacia. "
    },
    "acacia-sapota": {
        description: "Bullhorn acacia competes for nutrients and light with Sapodilla tree. "
    },
};
