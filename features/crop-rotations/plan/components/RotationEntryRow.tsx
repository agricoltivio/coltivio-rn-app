import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { Select } from "@/components/select/Select";
import { CropRotationDatePicker } from "@/components/datepicker/CropRotationDatePicker";
import { PlotCropRotation } from "@/api/crop-rotations.api";
import { RotationEntry } from "../plan-crop-rotations.store";
import { RecurrenceChip } from "./RecurrenceChip";
import { RecurrenceModal } from "./RecurrenceModal";

type RotationEntryRowProps = {
  rotation: RotationEntry;
  plotId: string;
  crops: { label: string; value: string }[];
  existingRotations: PlotCropRotation[];
  canDelete: boolean;
  error?: string;
  warning?: string;
  onUpdate: (updates: Partial<RotationEntry>) => void;
  onDelete: () => void;
};

export function RotationEntryRow({
  rotation,
  plotId,
  crops,
  existingRotations,
  canDelete,
  error,
  warning,
  onUpdate,
  onDelete,
}: RotationEntryRowProps) {
  const theme = useTheme();
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);

  // Filter out the current rotation from existingRotations for calendar highlighting
  const otherRotations = existingRotations.filter(r => r.id !== rotation.rotationId);

  return (
    <View
      style={{
        paddingVertical: theme.spacing.s,
        borderLeftWidth: error ? 3 : warning ? 3 : 0,
        borderLeftColor: error ? theme.colors.danger : warning ? "#FFA500" : undefined,
        paddingLeft: error || warning ? theme.spacing.s : 0,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: theme.spacing.s }}>
        <View style={{ flex: 1 }}>
          <Select
            label="Crop"
            value={rotation.cropId}
            data={crops}
            onChange={cropId => onUpdate({ cropId })}
            enableSearch
            error={error && !rotation.cropId ? "Crop is required" : undefined}
          />
        </View>

        {canDelete && (
          <Pressable
            onPress={onDelete}
            style={{
              padding: 8,
              marginTop: 32,
            }}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
          </Pressable>
        )}
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          gap: theme.spacing.s,
          marginTop: theme.spacing.s,
        }}
      >
        <CropRotationDatePicker
          label="From"
          date={rotation.fromDate}
          mode="from"
          plotId={plotId}
          existingRotations={otherRotations}
          onDateChange={fromDate => onUpdate({ fromDate })}
        />

        <CropRotationDatePicker
          label="To"
          date={rotation.toDate}
          mode="to"
          plotId={plotId}
          existingRotations={otherRotations}
          minimumDate={rotation.fromDate}
          onDateChange={toDate => onUpdate({ toDate })}
        />

        <RecurrenceChip
          recurrence={rotation.recurrence}
          onPress={() => setShowRecurrenceModal(true)}
        />
      </View>

      {(error || warning) && (
        <View
          style={{
            marginTop: theme.spacing.s,
            padding: theme.spacing.s,
            backgroundColor: error
              ? theme.colors.danger + "20"
              : "#FFA50020",
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: error ? theme.colors.danger : "#D97706",
            }}
          >
            {error || warning}
          </Text>
        </View>
      )}

      <RecurrenceModal
        visible={showRecurrenceModal}
        initialRecurrence={rotation.recurrence}
        onSave={recurrence => onUpdate({ recurrence })}
        onClear={() => onUpdate({ recurrence: undefined })}
        onClose={() => setShowRecurrenceModal(false)}
      />
    </View>
  );
}
