import { OrganismSchema } from "../data/organisms";
import { organismsRelationsSchema } from "../data/relations";
import { popupTextSchema } from "../data/popupTexts";

export const organismRegistry = [
  {
    id: "organism",
    label: "Organism",
    schema: OrganismSchema,
  },
  {
    id: "relation",
    label: "Relation",
    schema: organismsRelationsSchema,
  },
  {
    id: "popupText",
    label: "Popup Text",
    schema: popupTextSchema,
  },
] as const;