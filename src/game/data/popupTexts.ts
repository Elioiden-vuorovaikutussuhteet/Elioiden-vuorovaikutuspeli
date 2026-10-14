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
        description: "All arbuscular mycorrhizal fungi belong to the taxa Glomeromycota. They form symbiosis with acacia trees and provide Bullhorn acacias with water and nutrients, phosphorus in particular."
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
    "ants-antfootbacteria": {
        description: "Acacia ants provide a good living space as well as food for surface bacteria belonging to genera such as Bacillus, Lactococcus, Pantoea and Burkholderia. "
    },
    "antfootbacteria-ants": {
        description: "Ant foot bacteria secrete antimicrobial metabolites to kill both bacterial and fungal pathogens."
    },
    "diazotroph-acacia": {
        description: "Root nodule forming nitrogen fixing bacteria belonging to genera such as Rhizobium, Bradyrhizobium and Mesorhizobium transform biologically inactive nitrogen molecules from atmosphere to biologically active ammonium ions. This provides the plant with nitrogen, which is often a limiting factor for plant growth. "
    },
    "acacia-diazotroph": {
        description: "Root nodule forming nitrogen fixing bacteria belonging to genera such as Rhizobium, Bradyrhizobium and Mesorhizobium receive high energy carbohydrates from the plant as well as protected living space in the specialized root nodules. Acacia also produces oxygen binding leghemoglobin to the root nodules to assist in nitrogen fixation. "
    },
    "glomeromycetes-acacia": {
        description: "Fungi belonging to the taxa Glomeromycota form arbuscular mycorrhizal symbiosis with acacia trees and provide Bullhorn acacias with water and nutrients, phosphorus in particular. "
    },
    "acacia-glomeromycetes": {
        description: "Bullhorn acacia provides the arbuscular mycorrhizal symbiosis forming glomeromycete fungi with high energy carbohydrates. "
    },
    "glomeromycetes-sapota": {
        description: "Fungi belonging to the taxa Glomeromycota form arbuscular mycorrhizal symbiosis provide Sapodilla trees with water and nutrients, particularly phosphorus and nitrogen. "
    },
    "glomeromycetes-mycorrhizahelper": {
        description: "Arbuscular mycorrhizal symbiosis forming glomeromycetes provide mycorrhiza helper bacteria with a place to grow as well as organic acids and other molecules for food. "
    },
    "mycorrhizahelper-glomeromycetes": {
        description: "Mycorrhiza helper bacteria help arbuscular mycorrhizal symbiosis forming glomeromycetes to gather phosphorus and iron from soil as well as promote mycorrhizal symbiosis with plant by stimulating fungal and root growth and establishment of symbiotic structures. They also defend both fungi and plant roots against pathogens. "
    },
    "mycorrhizahelper-acacia": {
        description: "Mycorrhiza helper bacteria defend the tree mycorrhizosphere against pathogens. "
    },
    "mycorrhizahelper-sapota": {
        description: "Mycorrhiza helper bacteria defend the tree mycorrhizosphere against pathogens. "
    },
    "ants-sapota": {
        description: "Remove Sapodilla branches which might shade the bullhorn acacia tree as well as sapodilla seedlings close to the acacia."
    },




    


    
};
