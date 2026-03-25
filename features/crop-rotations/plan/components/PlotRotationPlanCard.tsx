import { Fragment } from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { Crop } from "@/api/crops.api";
import { PlotCropRotation } from "@/api/crop-rotations.api";
import {
  usePlanCropRotationsStore,
  RotationEntry,
} from "../plan-crop-rotations.store";
import { RotationEntryRow } from "./RotationEntryRow";
import { useOverlapValidation } from "../hooks/useOverlapValidation";
import { useWaitingTimeValidation } from "../hooks/useWaitingTimeValidation";

type PlotRotationPlanCardProps = {
  plotId: string;
  plotName: string;
  crops: Crop[];
  existingRotations: PlotCropRotation[];
};

export function PlotRotationPlanCard({
  plotId,
  plotName,
  crops,
  existingRotations,
}: PlotRotationPlanCardProps) {
  const theme = useTheme();
  const { getPlotPlan, addRotation, updateRotation, removeRotation } =
    usePlanCropRotationsStore();

  const plotPlan = getPlotPlan(plotId);
  const rotations = plotPlan?.rotations || [];

  const cropOptions = crops.map((c) => ({ label: c.name, value: c.id }));

  const overlapWarnings = useOverlapValidation(
    plotId,
    rotations,
    existingRotations,
  );
  const waitingTimeWarnings = useWaitingTimeValidation(
    plotId,
    rotations,
    existingRotations,
    crops,
  );

  const handleAddRotation = () => {
    const newRotation: RotationEntry = {
      entryId: `${plotId}-${Date.now()}`,
      cropId: "",
      fromDate: new Date(),
      toDate: new Date(),
    };
    addRotation(plotId, newRotation);
  };

  return (
    <View
      style={{
        padding: theme.spacing.m,
        backgroundColor: theme.colors.gray5,
        borderRadius: 12,
        marginBottom: theme.spacing.m,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: theme.colors.text,
          marginBottom: theme.spacing.m,
        }}
      >
        {plotName}
      </Text>

      <View
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: 10,
          padding: theme.spacing.m,
        }}
      >
        {rotations.map((rotation, index) => {
          const overlapWarning = overlapWarnings.get(rotation.entryId);
          const waitingWarning = waitingTimeWarnings.get(rotation.entryId);
          const warning = overlapWarning || waitingWarning;

          return (
            <Fragment key={rotation.entryId}>
              {index > 0 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: theme.colors.gray4,
                    marginVertical: theme.spacing.s,
                  }}
                />
              )}
              <RotationEntryRow
                rotation={rotation}
                plotId={plotId}
                crops={cropOptions}
                existingRotations={existingRotations}
                canDelete={rotations.length > 0}
                warning={warning?.message}
                onUpdate={(updates) =>
                  updateRotation(plotId, rotation.entryId, updates)
                }
                onDelete={() => removeRotation(plotId, rotation.entryId)}
              />
            </Fragment>
          );
        })}
      </View>

      <Pressable
        onPress={handleAddRotation}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: theme.spacing.xs,
          paddingVertical: 12,
          marginTop: theme.spacing.s,
          backgroundColor: theme.colors.white,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.colors.gray3,
          borderStyle: "dashed",
        }}
      >
        <Ionicons
          name="add-circle-outline"
          size={20}
          color={theme.colors.primary}
        />
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: theme.colors.primary,
          }}
        >
          Add Rotation
        </Text>
      </Pressable>
    </View>
  );
}
