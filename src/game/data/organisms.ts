import { z } from "zod";

export const OrganismSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  texture: z.string().min(1),
  default_scale: z.number().positive(),
  growth_types: z.array(z.string()),
  offsetX: z.number(),
  offsetY: z.number(),
  description: z.string(),
  wikilinks: z.array(z.string()),
});

export type OrganismData = z.infer<typeof OrganismSchema>;

export const organisms = z.array(OrganismSchema).parse([
  {
    id: "acacia",
    name: "Bullhorn Acacia",
    texture: "acacia_sprite",
    default_scale: 0.8,
    growth_types: ["grow"],
    offsetX: 0,
    offsetY: 0,
    description: "Bull horn acacia is a common name for a few species in the genus Vachellia with large thorns resembling a bull's horns. Although Vachellia-species can be found on most continents bull horn acacias only live in Central America, Mexico and Africa.",
    wikilinks: ["https://en.wikipedia.org/wiki/Bull_horn_acacia"],
  },
  {
    id: "amf",
    name: "Arbuscular Mycorrhizal Fungus",
    texture: "amf_sprite",
    default_scale: 0.8,
    growth_types: ["multiply"],
    offsetX: 0,
    offsetY: 300,
    description: "All arbuscular mycorrhizal symbiosis forming fungi belong to the class Glomeromycetes. Over 80 % of land plants form symbiosis with these obligate plant symbionts. The first land plants which developed ca. 500 million years ago depended on these fungi to conquer the land environment. These fungi form asexual spores but no sexual reproduction has ever been recorded.",
    wikilinks: ["https://en.wikipedia.org/wiki/Arbuscular_mycorrhiza"],
  },
  {
    id: "sapota",
    name: "Sapota",
    texture: "sapota_sprite",
    default_scale: 0.8,
    growth_types: ["grow"],
    offsetX: 400,
    offsetY: 0,
    description: "The tree’s Latin name is Manilcara zapota. It is a native Central American tree nowadays widely grown in tropical Asia for fruit, timber and chewing gum ingredient production.",
    wikilinks: ["https://en.wikipedia.org/wiki/Manilkara_zapota"]
  },
  {
    id: "ants",
    name: "Acacia Ants",
    texture: "ants_sprite",
    default_scale: 0.7,
    growth_types: ["multiply"],
    offsetX: -400,
    offsetY: 0,
    description: "Acacia ant’s Latin species name is Pseudomyrmex ferruginea. They live Central America, Mexico and Africa in symbiosis with bullhorn acacia. The ants' sting causes long lasting very painful effect.",
    wikilinks: ["https://en.wikipedia.org/wiki/Pseudomyrmex_ferruginea"],
  },
  {
    id: "antfootbacteria",
    name: "Ant Foot Bacteria",
    texture: "antfootbacteria_sprite",
    default_scale: 1,
    growth_types: ["multiply"],
    offsetX: -400,
    offsetY: 300,
    description: "These are bacteria residing on the feet of the acacia ants. They belong to genera such as Bacillus, Lactococcus, Pantoea and Burkholderia. These genera are widely present in many types of environments. Many species in these genera are known for their ability to repel other microbes. In this case the interaction is beneficial for both the ants and the trees as these bacteria repel both ant and plant pathogens.",
    wikilinks: ["https://en.wikipedia.org/wiki/Bacillus", "https://en.wikipedia.org/wiki/Lactococcus", "https://en.wikipedia.org/wiki/Pantoea", "https://en.wikipedia.org/wiki/Burkholderia"],
  },
  {
    id: "diazotroph",
    name: "Diazotrophic Bacteria",
    texture: "diazotroph_sprite",
    default_scale: 1,
    growth_types: ["multiply"],
    offsetX: 0,
    offsetY: -300,
    description: "The word diazotrophic means nitrogen fixing. Nitrogen fixation is a process where bacteria (or archaea) transform molecular nitrogen into ammonia, which can be used in cellular metabolism to build organic molecules such as amino acids. Since nitrogen fixation takes a lot of energy, some bacteria have developed rood nodule symbioses with plants to boost their energy supply. The diazotrophic bacteria in acacia roots and legumes generally belong to the genera Rhizobium, Bradyrhizobium and Mesorhizobium",
    wikilinks: ["https://en.wikipedia.org/wiki/Diazotroph"],
  },
  {
    id: "mycorrhizahelper",
    name: "Mycorrhiza Helper Bacteria",
    texture: "mycorrhizahelper_sprite",
    default_scale: 1,
    growth_types: ["multiply"],
    offsetX: 400,
    offsetY: 300,
    description: "Mycorrhiza helper bacteria belong to many bacterial species. They help glomeromycete fungi gather phosphorus and iron from soil as well as promote mycorrhizal symbiosis. The bacteria promote spore germination and aid hyphal growth. They also stimulate root growth and establishment of symbiotic structures and defend both fungi and plant roots against pathogens.",
    wikilinks: ["https://en.wikipedia.org/wiki/Mycorrhiza_helper_bacteria"],
  },
  {
    id: "acaciapathogen",
    name: "Bullhorn Acacia Pathogens",
    texture: "acaciapathogen_sprite",
    default_scale: 1.2,
    growth_types: ["multiply"],
    offsetX: -250,
    offsetY: -250,
    description: "Bull horn acacias have very weak internal defense systems as they have externalized their defense to their symbiotic ants. In the absence of ants, the trees are highly susceptible both to bacterial and fungal diseases. Pseudomonas syringae or Xanthomonas species can cause bacterial diseases, and a wide plethora of fungi can cause fungal infections.",
  },
  {
    id: "antpathogen",
    name: "Ant Infecting Pathogens",
    texture: "antpathogen_sprite",
    default_scale: 1.2,
    growth_types: ["multiply"],
    offsetX: -700,
    offsetY: 150,
    description: "Acacia ants rarely get sick due to their bacterial symbionts and vigorous grooming practices of the ant community. Nevertheless, occasionally a generalist insect pathogen Pseudomonas entomophila or fungal pathogens belonging to genera Metarhizium or Beauveria or more specific pseudomyrmex infecting fungus Ophiocordyceps pseudomyrmicis can cause infections.",
  },
]);

export const organismDataMap = new Map<string, OrganismData>(
  organisms.map((org) => [org.id, org]),
);

export function getOrganismData(id: string): OrganismData | undefined {
  return organismDataMap.get(id);
}
