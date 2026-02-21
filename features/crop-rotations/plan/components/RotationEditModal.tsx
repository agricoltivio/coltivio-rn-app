import { useState, useEffect } from "react";
import { Modal, View, Text, Pressable, TextInput, ScrollView, Keyboard } from "react-native";
import { useTheme } from "styled-components/native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Select } from "@/components/select/Select";
import { CompactDatePicker } from "@/components/datepicker/CompactDatePicker";
import { RotationEntry, RecurrenceRule } from "../plan-crop-rotations.store";
import { Plot } from "@/api/plots.api";
import { Crop } from "@/api/crops.api";
import { IonIconButton } from "@/components/buttons/IconButton";

type RotationEditModalProps = {
  visible: boolean;
  rotation: RotationEntry | null;
  plots: Plot[];
  crops: Crop[];
  selectedPlotId?: string;
  onSave: (plotId: string, rotation: RotationEntry) => void;
  onDelete?: (entryId: string) => void;
  onClose: () => void;
  onNavigateToCreateCrop?: () => void;
};

export function RotationEditModal({
  visible,
  rotation,
  plots,
  crops,
  selectedPlotId,
  onSave,
  onDelete,
  onClose,
  onNavigateToCreateCrop,
}: RotationEditModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [plotId, setPlotId] = useState(selectedPlotId || "");
  const [cropId, setCropId] = useState("");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [hasRecurrence, setHasRecurrence] = useState(false);
  const [interval, setInterval] = useState("1");
  const [hasUntil, setHasUntil] = useState(false);
  const [until, setUntil] = useState<Date>(
    new Date(new Date().getFullYear() + 3, 11, 31),
  );

  // Reset form when modal opens with new rotation
  useEffect(() => {
    if (visible && rotation) {
      setPlotId(selectedPlotId || "");
      setCropId(rotation.cropId);
      setFromDate(rotation.fromDate);
      setToDate(rotation.toDate);
      if (rotation.recurrence) {
        setHasRecurrence(true);
        setInterval(String(rotation.recurrence.interval));
        setHasUntil(!!rotation.recurrence.until);
        setUntil(
          rotation.recurrence.until ||
            new Date(new Date().getFullYear() + 3, 11, 31),
        );
      } else {
        setHasRecurrence(false);
        setInterval("1");
        setHasUntil(false);
      }
    } else if (visible && !rotation) {
      // New rotation
      setPlotId(selectedPlotId || "");
      setCropId("");
      setFromDate(new Date());
      setToDate(new Date());
      setHasRecurrence(false);
      setInterval("1");
      setHasUntil(false);
      setUntil(new Date(new Date().getFullYear() + 3, 11, 31));
    }
  }, [visible, rotation, selectedPlotId]);

  const handleSave = () => {
    if (!plotId || !cropId) return;

    const recurrence: RecurrenceRule | undefined = hasRecurrence
      ? { interval: Number(interval), until: hasUntil ? until : undefined }
      : undefined;

    const entry: RotationEntry = {
      entryId: rotation?.entryId || `new-${Date.now()}`,
      rotationId: rotation?.rotationId,
      cropId,
      fromDate,
      toDate,
      recurrence,
    };

    onSave(plotId, entry);
    onClose();
  };

  const handleDelete = () => {
    if (rotation && onDelete) {
      onDelete(rotation.entryId);
      onClose();
    }
  };

  const plotOptions = plots.map((p) => ({ label: p.name, value: p.id }));
  const cropOptions = crops.map((c) => ({ label: c.name, value: c.id }));

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
            width: "100%",
            maxWidth: 360,
          }}
          onPress={() => Keyboard.dismiss()}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
            contentContainerStyle={{ padding: theme.spacing.l }}
          >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: theme.colors.text,
              marginBottom: theme.spacing.m,
            }}
          >
            {rotation?.rotationId
              ? t("crop_rotations.plan.edit_rotation")
              : t("crop_rotations.plan.add_rotation_title")}
          </Text>

          {/* Plot Select */}
          <View style={{ marginBottom: theme.spacing.m }}>
            <Select
              label={t("plots.plot")}
              value={plotId}
              data={plotOptions}
              onChange={setPlotId}
              enableSearch
            />
          </View>

          {/* Crop Select */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.xs,
              marginBottom: theme.spacing.m,
            }}
          >
            <View style={{ flex: 1 }}>
              <Select
                label={t("crops.crop")}
                value={cropId}
                data={cropOptions}
                onChange={setCropId}
                enableSearch
              />
            </View>
            {onNavigateToCreateCrop && (
              <IonIconButton
                icon="add"
                color="black"
                iconSize={25}
                type="accent"
                onPress={onNavigateToCreateCrop}
              />
            )}
          </View>

          {/* Duration */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: theme.colors.gray1,
              marginBottom: theme.spacing.xs,
            }}
          >
            {t("crop_rotations.plan.duration")}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.s,
              marginBottom: theme.spacing.m,
            }}
          >
            <CompactDatePicker date={fromDate} onDateChange={setFromDate} />
            <Text style={{ color: theme.colors.gray2 }}>-</Text>
            <CompactDatePicker
              date={toDate}
              onDateChange={setToDate}
              minimumDate={fromDate}
            />
          </View>

          {/* Recurrence */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: theme.spacing.m,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.gray1,
                marginBottom: theme.spacing.xs,
              }}
            >
              {t("crop_rotations.plan.recurrence_optional")}
            </Text>

            {hasRecurrence && (
              <Pressable onPress={() => setHasRecurrence(false)}>
                <Ionicons
                  name="close-circle"
                  size={24}
                  color={theme.colors.gray2}
                />
              </Pressable>
            )}
          </View>
          {hasRecurrence ? (
            <>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: theme.spacing.s,
                  marginBottom: theme.spacing.xs,
                }}
              >
                <Text style={{ fontSize: 14, color: theme.colors.text }}>
                  {t("crop_rotations.plan.every")}
                </Text>
                <TextInput
                  value={interval}
                  onChangeText={(text) => {
                    if (!text) setInterval("");
                    const num = parseInt(text);
                    if (!isNaN(num) && num > 0) setInterval(String(num));
                  }}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="done"
                  blurOnSubmit
                  style={{
                    width: 50,
                    borderWidth: 1,
                    borderColor: theme.colors.gray3,
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    fontSize: 14,
                    textAlign: "center",
                  }}
                />
                <Text style={{ fontSize: 14, color: theme.colors.text }}>
                  {parseInt(interval) === 1
                    ? t("crop_rotations.plan.year")
                    : t("crop_rotations.plan.years")}
                </Text>
              </View>
              <CompactDatePicker
                date={until}
                onDateChange={(d) => {
                  setUntil(d);
                  setHasUntil(true);
                }}
                minimumDate={toDate}
                label={hasUntil ? t("crop_rotations.plan.until") : undefined}
                placeholder={t("crop_rotations.plan.add_end_date")}
                hasValue={hasUntil}
                onClear={() => setHasUntil(false)}
              />
            </>
          ) : (
            <Pressable
              onPress={() => setHasRecurrence(true)}
              style={{
                backgroundColor: theme.colors.gray5,
                paddingHorizontal: theme.spacing.s,
                paddingVertical: theme.spacing.xs,
                borderRadius: 8,
                alignSelf: "flex-start",
              }}
            >
              <Text style={{ fontSize: 15, color: theme.colors.text }}>
                {t("crop_rotations.plan.add_recurrence")}
              </Text>
            </Pressable>
          )}

          {/* Actions */}
          <View
            style={{
              flexDirection: "row",
              gap: theme.spacing.s,
              marginTop: theme.spacing.l,
            }}
          >
            {rotation && onDelete && (
              <Pressable
                onPress={handleDelete}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: theme.colors.danger + "15",
                  borderRadius: 10,
                }}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={theme.colors.danger}
                />
              </Pressable>
            )}
            <Pressable
              onPress={onClose}
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
                {t("buttons.cancel")}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={!plotId || !cropId}
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor:
                  !plotId || !cropId
                    ? theme.colors.gray3
                    : theme.colors.primary,
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
                {t("buttons.save")}
              </Text>
            </Pressable>
          </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
