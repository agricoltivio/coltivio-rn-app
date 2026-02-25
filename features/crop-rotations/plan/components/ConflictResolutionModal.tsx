import { Modal, View, Text, Pressable } from "react-native";
import { useTheme } from "styled-components/native";
import { format } from "date-fns";
import { ConflictInfo } from "../hooks/useOverlapValidation";

type ConflictResolutionModalProps = {
  visible: boolean;
  conflict: ConflictInfo | null;
  onAdjust: () => void;
  onCancel: () => void;
};

export function ConflictResolutionModal({
  visible,
  conflict,
  onAdjust,
  onCancel,
}: ConflictResolutionModalProps) {
  const theme = useTheme();

  if (!conflict) return null;

  const formatDate = (date?: Date) => date ? format(date, "MMM d, yyyy") : "";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: theme.spacing.m,
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.white,
            borderRadius: 16,
            padding: theme.spacing.l,
            width: "100%",
            maxWidth: 340,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: theme.colors.text,
              marginBottom: theme.spacing.m,
              textAlign: "center",
            }}
          >
            Date Conflict
          </Text>

          <Text
            style={{
              fontSize: 15,
              color: theme.colors.gray1,
              marginBottom: theme.spacing.m,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            This rotation overlaps with{" "}
            <Text style={{ fontWeight: "600", color: theme.colors.text }}>
              {conflict.conflictingCropName || "another rotation"}
            </Text>
            {conflict.conflictingFromDate && conflict.conflictingToDate && (
              <>
                {"\n"}({formatDate(conflict.conflictingFromDate)} - {formatDate(conflict.conflictingToDate)})
              </>
            )}
          </Text>

          <View style={{ gap: theme.spacing.s }}>
            <Pressable
              onPress={onAdjust}
              style={{
                paddingVertical: 14,
                backgroundColor: theme.colors.primary,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: theme.colors.white,
                }}
              >
                Adjust End Date
              </Text>
            </Pressable>

            <Pressable
              onPress={onCancel}
              style={{
                paddingVertical: 14,
                backgroundColor: theme.colors.gray5,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: theme.colors.gray1,
                }}
              >
                Keep Both (Resolve Manually)
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
