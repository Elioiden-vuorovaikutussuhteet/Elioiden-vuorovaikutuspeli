import {
  Box,
  Typography,
  Divider,
} from "@mui/material";
import DynamicForm from '../components/DynamicForm';
import {
  type OrganismData,
} from "../game/data/organisms";
import {
  type OrganismsRelations,
} from "../game/data/relations";
import {
  type PopupText,
  getInteractionId,
} from "../game/data/popupTexts";
import { organismRegistry } from "../game/data/organismRegistry";

interface OrganismEditorProps {
  organisms: OrganismData[];
  relations: OrganismsRelations[];
  popupTexts: Record<string, PopupText>;

  selectedOrganismId: string;

  onOrganismChange: (
    organism: OrganismData
  ) => void;

  onRelationChange: (
    index: number,
    relation: OrganismsRelations
  ) => void;

  onPopupTextChange: (
    interactionId: string,
    popupText: PopupText
  ) => void;
}

function OrganismEditor({
  organisms,
  relations,
  popupTexts,
  selectedOrganismId,
  onOrganismChange,
  onRelationChange,
  onPopupTextChange,
}: OrganismEditorProps) {

  const selectedOrganism = organisms.find(
    (organism) => organism.id === selectedOrganismId
  );

  if (!selectedOrganism) {
    return (
      <Typography>
        No organism selected.
      </Typography>
    );
  }

  const organismSchema = organismRegistry.find(
    (item) => item.id === "organism"
  )!.schema;

  const relationSchema = organismRegistry.find(
    (item) => item.id === "relation"
  )!.schema;

  const popupTextSchema = organismRegistry.find(
    (item) => item.id === "popupText"
  )!.schema;

  const outgoingRelations = relations
    .map((relation, index) => ({
      relation,
      index,
    }))
    .filter(
      ({ relation }) =>
        relation.source === selectedOrganismId
    );

  return (
    <Box sx={{ mt: 3 }}>

      {/* Organism Form */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Organism properties
      </Typography>

      <DynamicForm
        key={`organism-${selectedOrganism.id}`}
        schema={organismSchema}
        defaults={selectedOrganism}
        organisms={organisms}
        onChange={(values) => {
          onOrganismChange(
            values as OrganismData
          );
        }}
      />

      <Divider sx={{ my: 4 }} />

      {/* Outgoing Relations */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Outgoing relations
      </Typography>

      {outgoingRelations.length === 0 && (
        <Typography color="text.secondary">
          This organism has no outgoing relations.
        </Typography>
      )}

      {outgoingRelations.map(({ relation, index }) => {

        const interactionId = getInteractionId(
          relation.source,
          relation.target
        );

        const popupText = popupTexts[interactionId];

        return (
          <Box
            key={`${interactionId}-${index}`}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: 2,
              mb: 3,
            }}
          >

            {/* Relation */}
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Relation: {relation.source} → {relation.target}
            </Typography>

            <DynamicForm
              key={`relation-${index}`}
              schema={relationSchema}
              defaults={relation}
              organisms={organisms}
              onChange={(values) => {
                onRelationChange(
                  index,
                  values as OrganismsRelations
                );
              }}
            />

            <Divider sx={{ my: 3 }} />

            {/* Popup Text */}
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Popup text
            </Typography>

            <DynamicForm
              key={`popup-${interactionId}`}
              schema={popupTextSchema}
              defaults={
                popupText ?? ({} as PopupText)
              }
              organisms={organisms}
              onChange={(values) => {
                onPopupTextChange(
                  interactionId,
                  values as PopupText
                );
              }}
            />

          </Box>
        );
      })}

    </Box>
  );
}

export default OrganismEditor;
