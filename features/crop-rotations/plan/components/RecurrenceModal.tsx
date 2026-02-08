import { useState, useEffect } from "react";
import { Modal, View, Text, Pressable, TextInput } from "react-native";
import { useTheme } from "styled-components/native";
import { RecurrenceRule } from "../plan-crop-rotations.store";
import { CompactDatePicker } from "@/components/datepicker/CompactDatePicker";

type RecurrenceModalProps = {
  visible: boolean;
  initialRecurrence?: RecurrenceRule;
  onSave: (recurrence: RecurrenceRule) => void;
  onClear: () => void;
  onClose: () => void;
};

export function RecurrenceModal({
  visible,
  initialRecurrence,
  onSave,
  onClear,
  onClose,
}: RecurrenceModalProps) {
  const theme = useTheme();

  const [interval, setInterval] = useState(initialRecurrence?.interval || 1);
  const [until, setUntil] = useState<Date>(
    initialRecurrence?.until || new Date(new Date().getFullYear() + 3, 11, 31)
  );

  useEffect(() => {
    if (initialRecurrence) {
      setInterval(initialRecurrence.interval);
      if (initialRecurrence.until) {
        setUntil(initialRecurrence.until);
      }
    }
  }, [initialRecurrence]);

  const handleSave = () => {
    const recurrence: RecurrenceRule = {
      interval,
      until,
    };
    onSave(recurrence);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: theme.spacing.m,
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: theme.colors.white,
            borderRadius: 16,
            padding: theme.spacing.l,
            width: "100%",
            maxWidth: 320,
          }}
          onPress={e => e.stopPropagation()}
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
            Yearly Recurrence
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: theme.colors.gray1,
              marginBottom: theme.spacing.xs,
            }}
          >
            Repeat every
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.s,
              marginBottom: theme.spacing.m,
            }}
          >
            <TextInput
              value={String(interval)}
              onChangeText={text => {
                const num = parseInt(text);
                if (!isNaN(num) && num > 0) setInterval(num);
              }}
              keyboardType="number-pad"
              style={{
                width: 60,
                borderWidth: 1,
                borderColor: theme.colors.gray3,
                borderRadius: 8,
                paddingHorizontal: theme.spacing.s,
                paddingVertical: 8,
                fontSize: 16,
                textAlign: "center",
              }}
            />
            <Text style={{ fontSize: 15, color: theme.colors.text }}>
              {interval === 1 ? "year" : "years"}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 14,
              color: theme.colors.gray1,
              marginBottom: theme.spacing.xs,
            }}
          >
            Until
          </Text>
          <View style={{ marginBottom: theme.spacing.l }}>
            <CompactDatePicker
              date={until}
              onDateChange={setUntil}
              minimumDate={new Date()}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: theme.spacing.s,
            }}
          >
            <Pressable
              onPress={() => {
                onClear();
                onClose();
              }}
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor: theme.colors.gray5,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: theme.colors.gray1,
                }}
              >
                Clear
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor: theme.colors.primary,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: theme.colors.white,
                }}
              >
                Save
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
