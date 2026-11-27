import { z } from "zod";

export const popupTextSchema = z.object({
  title: z.string(),
  relation: z.string(),
  description: z.string(),
});

export type PopupText = z.infer<typeof popupTextSchema>;

export function getInteractionId(first: string, second: string): string {
  return `${first}-${second}`;
}

export const popupTexts: Record<string, PopupText> = {
  "acacia-amf": {
    title:
      "Symbiotic relationship between Bullhorn Acacia and Arbuscular Mycorrhizal Fungi",
    relation: "Symbiotic",
    description:
      "Bullhorn acacia provides the arbuscular mycorrhizal symbiosis forming glomeromycete fungi with high energy carbohydrates.",
  },

  "amf-acacia": {
    title:
      "Symbiotic relationship between Arbuscular Mycorrhizal Fungi and Bullhorn Acacia",
    relation: "Symbiotic",
    description:
      "All arbuscular mycorrhizal fungi belong to the taxa Glomeromycota. They form symbiosis with acacia trees and provide Bullhorn acacias with water and nutrients, phosphorus in particular.",
  },

  "acacia-ants": {
    title: "Symbiotic relationship between Bullhorn Acacia and Acacia Ants",
    relation: "Symbiotic",
    description:
      "Bullhorn acacias protect the ant queen, eggs and larvae from elements and predators. Bullhorn acacias provide adult ants also with high energy nectar and larvae with Beltian bodies high with protein, fats and vitamins.",
  },

  "ants-acacia": {
    title: "Symbiotic relationship between Acacia Ants and Bullhorn Acacia",
    relation: "Symbiotic",
    description:
      "Ants remove shading plant branches, vines and vegetation growing at the base of the trees. They also protect bullhorn acacia aggressively against herbivores such as insects and rodents. ",
  },
  "sapota-amf": {
    title:
      "Symbiotic relationship between Sapodilla and Arbuscular Mycorrhizal Fungi",
    relation: "Symbiotic",
    description:
      "Sapodilla tree provides the arbuscular mycorrhizal fungi with high energy carbohydrates. ",
  },
  "amf-sapota": {
    title:
      "Symbiotic relationship between Arbuscular Mycorrhizal Fungi and Sapodilla",
    relation: "Symbiotic",
    description:
      "Fungi belonging to the taxa Glomeromycota form arbuscular mycorrhizal symbiosis provide Sapodilla trees with water and nutrients, particularly phosphorus and nitrogen. ",
  },
  "sapota-acacia": {
    title: "Competitive relationship between Sapodilla and Bullhorn Acacia",
    relation: "Competitive",
    description:
      "Sapodilla tree competes for nutrients and light with Bullhorn acacia. ",
  },
  "acacia-sapota": {
    title: "Competitive relationship between Bullhorn Acacia and Sapodilla",
    relation: "Competitive",
    description:
      "Bullhorn acacia competes for nutrients and light with Sapodilla tree. ",
  },
  "ants-antfootbacteria": {
    title: "Symbiotic relationship between Acacia Ants and Ant Foot Bacteria",
    relation: "Symbiotic",
    description:
      "Acacia ants provide a good living space as well as food for surface bacteria belonging to genera such as Bacillus, Lactococcus, Pantoea and Burkholderia. ",
  },
  "antfootbacteria-ants": {
    title: "Symbiotic relationship between Ant Foot Bacteria and Acacia Ants",
    relation: "Symbiotic",
    description:
      "Ant foot bacteria secrete antimicrobial metabolites to kill both bacterial and fungal pathogens.",
  },
  "diazotroph-acacia": {
    title:
      "Symbiotic relationship between Diazotrophic Bacteria and Bullhorn Acacia",
    relation: "Symbiotic",
    description:
      "Root nodule forming nitrogen fixing bacteria belonging to genera such as Rhizobium, Bradyrhizobium and Mesorhizobium transform biologically inactive nitrogen molecules from atmosphere to biologically active ammonium ions. This provides the plant with nitrogen, which is often a limiting factor for plant growth. ",
  },
  "acacia-diazotroph": {
    title:
      "Symbiotic relationship between Bullhorn Acacia and Diazotrophic Bacteria",
    relation: "Symbiotic",
    description:
      "Root nodule forming nitrogen fixing bacteria belonging to genera such as Rhizobium, Bradyrhizobium and Mesorhizobium receive high energy carbohydrates from the plant as well as protected living space in the specialized root nodules. Acacia also produces oxygen binding leghemoglobin to the root nodules to assist in nitrogen fixation. ",
  },
  "amf-mycorrhizahelper": {
    title:
      "Symbiotic relationship between Arbuscular Mycorrhizal Fungi and Mycorrhiza Helper Bacteria",
    relation: "Symbiotic",
    description:
      "Arbuscular mycorrhizal symbiosis forming glomeromycetes provide mycorrhiza helper bacteria with a place to grow as well as organic acids and other molecules for food. ",
  },
  "mycorrhizahelper-amf": {
    title:
      "Symbiotic relationship between Mycorrhiza Helper Bacteria and Arbuscular Mycorrhizal Fungi",
    relation: "Symbiotic",
    description:
      "Mycorrhiza helper bacteria help arbuscular mycorrhizal symbiosis forming glomeromycetes to gather phosphorus and iron from soil as well as promote mycorrhizal symbiosis with plant by stimulating fungal and root growth and establishment of symbiotic structures. They also defend both fungi and plant roots against pathogens. ",
  },
  "mycorrhizahelper-acacia": {
    title:
      "Symbiotic relationship between Mycorrhiza Helper Bacteria and Bullhorn Acacia",
    relation: "Symbiotic",
    description:
      "Mycorrhiza helper bacteria defend the tree mycorrhizosphere against pathogens. ",
  },
  "mycorrhizahelper-sapota": {
    title:
      "Symbiotic relationship between Mycorrhiza Helper Bacteria and Sapodilla",
    relation: "Symbiotic",
    description:
      "Mycorrhiza helper bacteria defend the tree mycorrhizosphere against pathogens. ",
  },
  "ants-sapota": {
    title: "Harmful relationship between Acacia Ants and Sapodilla",
    relation: "Harmful",
    description:
      "Remove Sapodilla branches which might shade the bullhorn acacia tree as well as sapodilla seedlings close to the acacia.",
  },
  "antfootbacteria-antpathogen": {
    title:
      "Harmful relationship between Ant Foot Bacteria and Ant Infecting Pathogens",
    relation: "Harmful",
    description:
      "Ant foot bacteria secrete antimicrobial metabolites to kill both bacterial and fungal pathogens.",
  },
  "antfootbacteria-acaciapathogen": {
    title:
      "Harmful relationship between Ant Foot Bacteria and Bullhorn Acacia Pathogens",
    relation: "Harmful",
    description:
      "Ant foot bacteria secrete antimicrobial metabolites to kill both bacterial and fungal plant pathogens.",
  },
  "acaciapathogen-acacia": {
    title:
      "Harmful relationship between Bullhorn Acacia Pathogens and Bullhorn Acacia",
    relation: "Harmful",
    description:
      "Bullhorn acacias have relatively weak defense systems as ants take care of their defense. Without acacia ants acacias are more susceptible to both bacterial and fungal diseases.",
  },
  "acacia-acaciapathogen": {
    title:
      "Symbiotic relationship between Bullhorn Acacia and Bullhorn Acacia Pathogens",
    relation: "Symbiotic",
    description: "Plant pathogens need their host to live.",
  },
  "antpathogen-ants": {
    title:
      "Harmful relationship between Ant Infecting Pathogens and Acacia Ants",
    relation: "Harmful",
    description:
      "Acacia ants rarely get sick as they groom vigorously. However, occasionally they can get fungal or bacterial diseases.",
  },
  "amf-acaciapathogen": {
    title:
      "Harmful relationship between Arbuscular Mycorrhizal Fungi and Bullhorn Acacia Pathogens",
    relation: "Harmful",
    description: "Mycorrhizal fungi protect acacia trees from plant pathogens.",
  },
};
