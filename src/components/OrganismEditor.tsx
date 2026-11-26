import {
  Box,
  Typography,
  Divider,
  Button,
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

  formVersion: number

  onOrganismChange: (
    originalId: string,
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

  onDeleteOrganism: (id: string) => void;
}

function OrganismEditor({
  organisms,
  relations,
  popupTexts,
  selectedOrganismId,
  formVersion,
  onOrganismChange,
  onRelationChange,
  onPopupTextChange,
  onDeleteOrganism,
}: OrganismEditorProps) {

  const selectedIndex = organisms.findIndex(
  (organism) => organism.id === selectedOrganismId,
  );
  const selectedOrganism =
    selectedIndex >= 0 ? organisms[selectedIndex] : undefined;

  if (!selectedOrganism) {
    return <Typography>No organism selected.</Typography>;
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
        key={`organism-${selectedIndex}-${formVersion}`}
        schema={organismSchema}
        defaults={selectedOrganism}
        organisms={organisms}
        onChange={(values) => {
          onOrganismChange(
            selectedOrganism.id,
            values as OrganismData,
          );
        }}
      />

      <Button
        color="error"
        variant="outlined"
        onClick={() => onDeleteOrganism(selectedOrganismId)}
      >
        Delete Organism
      </Button>

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
            borderColor: "#cbd5e1",
            borderRadius: 2,
            p: 3,
            mb: 4,
            backgroundColor: "#f8fafc",
            boxShadow: "0 2px 5px rgba(0,0,0,0.04)",
          }}
        >

            {/* Relation */}
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Relation: {relation.source} → {relation.target}
            </Typography>

            <DynamicForm
              key={`relation-${index}-${formVersion}`}
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
              key={`popup-${interactionId}-${formVersion}`}
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
