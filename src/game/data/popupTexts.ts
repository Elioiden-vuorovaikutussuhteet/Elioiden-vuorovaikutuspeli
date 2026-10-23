export interface PopupText {
  title : string,
  relation: string,
  description: string;
}

export function getInteractionId(first: string, second: string): string {
  return `${first}-${second}`;
}

export const popupTexts: Record<string, PopupText> = {
  "acacia-amf": {
    title: "Acacia -> Glomeromycetes",
    relation: "Relation: Symbiotic",
    description:
      "Bullhorn acacia provides the arbuscular mycorrhizal symbiosis forming glomeromycetes fungi with high energy carbohydrates.",
  },

  "amf-acacia": {
    title: "Glomeromycetes -> Acacia",
    relation: "Relation: Symbiotic",
    description:
      "All arbuscular mycorrhizal fungi belong to the taxa Glomeromycota. They form symbiosis with acacia trees and provide Bullhorn acacias with water and nutrients, phosphorus in particular.",
  },

  "acacia-ants": {
    title: "Acacia -> Ants",
    relation: "Relation: Symbiotic",
    description:
      "Bullhorn acacias protect the ant queen, eggs and larvae from elements and predators. Bullhorn acacias provide adult ants also with high energy nectar and larvae with Beltian bodies high with protein, fats and vitamins.",
  },

  "ants-acacia": {
    title: "Ants -> Acacia",
    relation: "Relation: Symbiotic",
    description:
      "Ants remove shading plant branches, vines and vegetation growing at the base of the trees. They also protect bullhorn acacia aggressively against herbivores such as insects and rodents. ",
  },
  "sapota-amf": {
    title: "Sapodilla -> Glomeromycetes",
    relation: "Relation: Symbiotic",
    description:
      "Sapodilla tree provides the arbuscular mycorrhizal fungi with high energy carbohydrates. ",
  },
  "amf-sapota": {
    title: "Glomeromycetes -> Sapodilla",
    relation: "Relation: Symbiotic",
    description:
      "Fungi belonging to the taxa Glomeromycota form arbuscular mycorrhizal symbiosis provide Sapodilla trees with water and nutrients, particularly phosphorus and nitrogen. ",
  },
  "sapota-acacia": {
    title: "Sapodilla -> Acacia",
    relation: "Relation: Competitive",
    description:
      "Sapodilla tree competes for nutrients and light with Bullhorn acacia. ",
  },
  "acacia-sapota": {
    title: "Acacia -> Sapodilla",
    relation: "Relation: Competitive",
    description:
      "Bullhorn acacia competes for nutrients and light with Sapodilla tree. ",
  },
  "ants-antfootbacteria": {
    title: "Ants -> Antfootbacteria",
    relation: "Relation: Symbiotic",
    description:
      "Acacia ants provide a good living space as well as food for surface bacteria belonging to genera such as Bacillus, Lactococcus, Pantoea and Burkholderia. ",
  },
  "antfootbacteria-ants": {
    title: "Antfootbacteria -> Ants",
    relation: "Relation: Symbiotic",
    description:
      "Ant foot bacteria secrete antimicrobial metabolites to kill both bacterial and fungal pathogens.",
  },
  "diazotroph-acacia": {
    title: "Diazotrophic bacteria -> Acacia",
    relation: "Relation: Symbiotic",
    description:
      "Root nodule forming nitrogen fixing bacteria belonging to genera such as Rhizobium, Bradyrhizobium and Mesorhizobium transform biologically inactive nitrogen molecules from atmosphere to biologically active ammonium ions. This provides the plant with nitrogen, which is often a limiting factor for plant growth. ",
  },
  "acacia-diazotroph": {
    title: "Acacia -> Diazotrophic bacteria",
    relation: "Relation: Symbiotic",
    description:
      "Root nodule forming nitrogen fixing bacteria belonging to genera such as Rhizobium, Bradyrhizobium and Mesorhizobium receive high energy carbohydrates from the plant as well as protected living space in the specialized root nodules. Acacia also produces oxygen binding leghemoglobin to the root nodules to assist in nitrogen fixation. ",
  },
  "amf-mycorrhizahelper": {
    title: "Glomeromycetes -> Mycorrhiza helper bacteria",
    relation: "Relation: Symbiotic",
    description:
      "Arbuscular mycorrhizal symbiosis forming glomeromycetes provide mycorrhiza helper bacteria with a place to grow as well as organic acids and other molecules for food. ",
  },
  "mycorrhizahelper-amf": {
    title: "Mycorrhiza helper bacteria -> Glomeromycetes",
    relation: "Relation: Symbiotic",
    description:
      "Mycorrhiza helper bacteria help arbuscular mycorrhizal symbiosis forming glomeromycetes to gather phosphorus and iron from soil as well as promote mycorrhizal symbiosis with plant by stimulating fungal and root growth and establishment of symbiotic structures. They also defend both fungi and plant roots against pathogens. ",
  },
  "mycorrhizahelper-acacia": {
    title: "Mycorrhiza helper bacteria -> Acacia",
    relation: "Relation: Symbiotic",
    description:
      "Mycorrhiza helper bacteria defend the tree mycorrhizosphere against pathogens. ",
  },
  "mycorrhizahelper-sapota": {
    title: "Mycorrhiza helper bacteria -> Sapodilla",
    relation: "Relation: Symbiotic",
    description:
      "Mycorrhiza helper bacteria defend the tree mycorrhizosphere against pathogens. ",
  },
  "ants-sapota": {
    title: "Ants -> Sapodilla",
    relation: "Relation: Harmful",
    description:
      "Removes Sapodilla branches which might shade the bullhorn acacia tree as well as sapodilla seedlings close to the acacia.",
  },
};
