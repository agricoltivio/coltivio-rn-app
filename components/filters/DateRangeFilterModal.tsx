import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { CompactDatePicker } from "@/components/datepicker/CompactDatePicker";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, View } from "react-native";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";

type DateRangeFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  onApply: (from: Date | null, to: Date | null) => void;
  initialFrom: Date | null;
  initialTo: Date | null;
};

export function DateRangeFilterModal({
  visible,
  onClose,
  onApply,
  initialFrom,
  initialTo,
}: DateRangeFilterModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const frame = useSafeAreaFrame();
  const [fromDate, setFromDate] = useState<Date | undefined>(
    initialFrom ?? undefined,
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    initialTo ?? undefined,
  );

  function handleClear() {
    setFromDate(undefined);
    setToDate(undefined);
    onApply(null, null);
  }

  function handleApply() {
    onApply(fromDate ?? null, toDate ?? null);
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      transparent
    >
      <Card
        elevated
        style={{
          position: "absolute",
          top: frame.height / 4,
          left: theme.spacing.m,
          right: theme.spacing.m,
          maxWidth: "90%",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: theme.spacing.m,
          }}
        >
          <CompactDatePicker
            // label={t("treatments.birthday_from")}
            date={fromDate || new Date()}
            onDateChange={(date) => setFromDate(date ?? undefined)}
          />
          <CompactDatePicker
            label={t("treatments.birthday_to")}
            date={toDate || new Date()}
            onDateChange={(date) => setToDate(date ?? undefined)}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: theme.spacing.m,
            marginTop: theme.spacing.xl,
          }}
        >
          <Button
            type="accent"
            title={t("buttons.apply")}
            onPress={handleApply}
          />
          <Button
            title={t("buttons.clear")}
            onPress={handleClear}
            type="danger"
          />
        </View>
      </Card>
    </Modal>
  );
}
