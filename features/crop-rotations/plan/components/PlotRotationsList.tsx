import { View, Text, Pressable } from "react-native";
import { useTheme } from "styled-components/native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { RotationEntry } from "../plan-crop-rotations.store";
import { Crop } from "@/api/crops.api";

type RotationWithConflict = RotationEntry & {
  conflictMessage?: string;
  warningMessage?: string;
};

type PlotRotationsListProps = {
  plotId: string;
  plotName: string;
  rotations: RotationWithConflict[];
  crops: Crop[];
  onRotationPress?: (rotation: RotationEntry) => void;
  onAddPress?: () => void;
};

export function PlotRotationsList({
  plotName,
  rotations,
  crops,
  onRotationPress,
  onAddPress,
}: PlotRotationsListProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const getCropName = (cropId: string) => {
    return crops.find((c) => c.id === cropId)?.name || t("common.unknown");
  };

  const formatDateRange = (from: Date, to: Date) => {
    return `${format(from, "dd.MM.yyyy")} - ${format(to, "dd.MM.yyyy")}`;
  };

  const formatRecurrence = (recurrence: RotationEntry["recurrence"]) => {
    if (!recurrence) return null;
    const repeatText =
      recurrence.interval === 1
        ? t("crop_rotations.plan.repeats_every_year")
        : t("crop_rotations.plan.repeats_every_years", {
            count: recurrence.interval,
          });
    const untilText = recurrence.until
      ? t("crop_rotations.plan.until_date", {
          date: format(recurrence.until, "MM.yyyy"),
        })
      : "";
    return `${repeatText}${untilText ? ` ${untilText}` : ""}`;
  };

  return (
    <View
      style={{
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        marginBottom: theme.spacing.m,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: theme.spacing.m,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.gray4,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: theme.colors.text,
          }}
        >
          {plotName}
        </Text>
        {onAddPress && (
          <Pressable
            onPress={onAddPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.primary,
              }}
            >
              {t("buttons.add")}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Rotations list */}
      {rotations.length === 0 ? (
        <View style={{ padding: theme.spacing.m }}>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.gray2,
              textAlign: "center",
            }}
          >
            {t("crop_rotations.plan.no_rotations_yet")}
          </Text>
        </View>
      ) : (
        rotations.map((rotation, index) => {
          const hasConflict = !!rotation.conflictMessage;
          const hasWarning = !!rotation.warningMessage;
          const showWarningStyle = hasWarning && !hasConflict;
          return (
            <Pressable
              key={rotation.entryId}
              onPress={onRotationPress ? () => onRotationPress(rotation) : undefined}
              style={{
                padding: theme.spacing.m,
                borderBottomWidth: index < rotations.length - 1 ? 1 : 0,
                borderBottomColor: theme.colors.gray4,
                borderLeftWidth: hasConflict || showWarningStyle ? 3 : 0,
                borderLeftColor: hasConflict
                  ? theme.colors.danger
                  : theme.colors.warning,
                backgroundColor: hasConflict
                  ? theme.colors.danger + "08"
                  : showWarningStyle
                    ? theme.colors.warning + "12"
                    : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: theme.colors.text,
                  marginBottom: 4,
                }}
              >
                {getCropName(rotation.cropId)}
              </Text>

              <Text style={{ fontSize: 13, color: theme.colors.gray1 }}>
                {formatDateRange(rotation.fromDate, rotation.toDate)}
                {rotation.recurrence && (
                  <Text style={{ color: theme.colors.gray2 }}>
                    {" · "}
                    {formatRecurrence(rotation.recurrence)}
                  </Text>
                )}
              </Text>

              {hasConflict && (
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.danger,
                    marginTop: 4,
                  }}
                >
                  {rotation.conflictMessage}
                </Text>
              )}
              {hasWarning && (
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.warning,
                    marginTop: 4,
                  }}
                >
                  {rotation.warningMessage}
                </Text>
              )}
            </Pressable>
          );
        })
      )}
    </View>
  );
}
