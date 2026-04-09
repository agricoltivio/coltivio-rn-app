import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { CompactDatePicker } from "@/components/datepicker/CompactDatePicker";
import { Select } from "@/components/select/Select";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/features/user/users.hooks";
import { Modal, Pressable, Text, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useTheme } from "styled-components/native";
import { formatLocalizedDate } from "@/utils/date";
import { locale } from "@/locales/i18n";
import {
  useAnimalByIdQuery,
  useSetCustomOutdoorJournalCategoriesMutation,
} from "./animals.hooks";
import { ManageAnimalCategoriesScreenProps } from "./navigation/animals-routes";

const CATEGORY_OPTIONS = [
  "A1",
  "A2",
  "A3",
  "A4",
  "A5",
  "A6",
  "A7",
  "A8",
  "A9",
  "B1",
  "B2",
  "B3",
  "C1",
  "C2",
  "D1",
  "D2",
  "D3",
  "E1",
  "E2",
  "E3",
  "E4",
  "F1",
  "F2",
].map((val) => ({ label: val, value: val }));

type CategoryEntry = {
  startDate: string;
  endDate: string | null;
  category: string;
};

export function ManageAnimalCategoriesScreen({
  route,
  navigation,
}: ManageAnimalCategoriesScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { animalId } = route.params;
  const { animal } = useAnimalByIdQuery(animalId);

  const [entries, setEntries] = useState<CategoryEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Modal form state
  const [modalCategory, setModalCategory] = useState("A1");
  const [modalStartDate, setModalStartDate] = useState(new Date());
  const [modalEndDate, setModalEndDate] = useState<Date | null>(null);
  const [modalHasEndDate, setModalHasEndDate] = useState(false);

  // Initialize entries from animal data
  useEffect(() => {
    if (animal) {
      setEntries(
        animal.customOutdoorJournalCategories.map((e) => ({
          startDate: e.startDate,
          endDate: e.endDate,
          category: e.category,
        })),
      );
    }
  }, [animal]);

  // Detect overlapping entries (simple date range overlap, no recurrence)
  const overlappingIndices = useMemo(() => {
    const result = new Set<number>();
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = entries[i];
        const b = entries[j];
        const aStart = new Date(a.startDate).getTime();
        const aEnd = a.endDate ? new Date(a.endDate).getTime() : Infinity;
        const bStart = new Date(b.startDate).getTime();
        const bEnd = b.endDate ? new Date(b.endDate).getTime() : Infinity;
        if (aStart <= bEnd && aEnd >= bStart) {
          result.add(i);
          result.add(j);
        }
      }
    }
    return result;
  }, [entries]);

  const hasOverlaps = overlappingIndices.size > 0;

  const saveMutation = useSetCustomOutdoorJournalCategoriesMutation(() =>
    navigation.goBack(),
  );

  function openAddModal() {
    setEditingIndex(null);
    setModalCategory("A1");
    setModalStartDate(new Date());
    setModalEndDate(null);
    setModalHasEndDate(false);
    setModalVisible(true);
  }

  function openEditModal(index: number) {
    const entry = entries[index];
    setEditingIndex(index);
    setModalCategory(entry.category);
    setModalStartDate(new Date(entry.startDate));
    if (entry.endDate) {
      setModalEndDate(new Date(entry.endDate));
      setModalHasEndDate(true);
    } else {
      setModalEndDate(null);
      setModalHasEndDate(false);
    }
    setModalVisible(true);
  }

  function handleModalConfirm() {
    const newEntry: CategoryEntry = {
      startDate: modalStartDate.toISOString(),
      endDate:
        modalHasEndDate && modalEndDate ? modalEndDate.toISOString() : null,
      category: modalCategory,
    };
    if (editingIndex !== null) {
      setEntries((prev) =>
        prev.map((e, i) => (i === editingIndex ? newEntry : e)),
      );
    } else {
      setEntries((prev) => [...prev, newEntry]);
    }
    setModalVisible(false);
  }

  function handleDelete(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    saveMutation.mutate({
      animalId,
      input: {
        entries: entries.map((e) => ({
          startDate: e.startDate,
          endDate: e.endDate,
          category: e.category as "A1",
        })),
      },
    });
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSave}
            loading={saveMutation.isPending}
            disabled={saveMutation.isPending || hasOverlaps}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("animals.manage_categories")}
      >
        <H2>{t("animals.manage_categories")}</H2>

        {/* Overlap warning */}
        {hasOverlaps && (
          <View
            style={{
              marginTop: theme.spacing.m,
              backgroundColor: theme.colors.white,
              borderRadius: 10,
              padding: theme.spacing.m,
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.warning,
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.xs,
            }}
          >
            <Ionicons
              name="alert-circle"
              size={20}
              color={theme.colors.warning}
            />
            <Subtitle style={{ flex: 1 }}>
              {t("animals.category_overlap_warning")}
            </Subtitle>
          </View>
        )}

        {/* List of entries */}
        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.s }}>
          {entries.length === 0 && (
            <Subtitle>{t("common.no_entries")}</Subtitle>
          )}
          {entries.map((entry, index) => (
            <View
              key={index}
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 10,
                padding: theme.spacing.m,
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.s,
                ...(overlappingIndices.has(index) && {
                  borderWidth: 1,
                  borderColor: theme.colors.warning,
                }),
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: theme.colors.text,
                  }}
                >
                  {entry.category}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: theme.colors.gray1,
                    marginTop: 2,
                  }}
                >
                  {formatLocalizedDate(new Date(entry.startDate), locale)}
                  {" – "}
                  {entry.endDate
                    ? formatLocalizedDate(new Date(entry.endDate), locale)
                    : t("animals.open_ended")}
                </Text>
              </View>
              {canWrite("animals") && (
                <Pressable
                  onPress={() => openEditModal(index)}
                  style={{ padding: theme.spacing.xs }}
                >
                  <Ionicons
                    name="pencil"
                    size={20}
                    color={theme.colors.primary}
                  />
                </Pressable>
              )}
              {canWrite("animals") && (
                <Pressable
                  onPress={() => handleDelete(index)}
                  style={{ padding: theme.spacing.xs }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={theme.colors.danger}
                  />
                </Pressable>
              )}
            </View>
          ))}
        </View>

        {/* Add button */}
        {canWrite("animals") && (
          <Button
            type="accent"
            title={t("animals.add_category_entry")}
            onPress={openAddModal}
            style={{ marginTop: theme.spacing.m }}
          />
        )}
      </ScrollView>

      {/* Edit/Add Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        {modalVisible && (
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
              padding: theme.spacing.m,
            }}
            onPress={() => setModalVisible(false)}
          >
            <KeyboardAvoidingView
              behavior="padding"
              style={{ width: "100%", maxWidth: 360 }}
            >
              <Pressable
                style={{
                  backgroundColor: theme.colors.white,
                  borderRadius: 16,
                  padding: theme.spacing.l,
                  width: "100%",
                  overflow: "visible",
                }}
                onPress={(e) => e.stopPropagation()}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: theme.colors.text,
                    marginBottom: theme.spacing.m,
                  }}
                >
                  {editingIndex !== null
                    ? t("animals.custom_animal_category")
                    : t("animals.add_category_entry")}
                </Text>

                {/* Category select */}
                <View style={{ marginBottom: theme.spacing.m }}>
                  <Select
                    label={t("animals.category")}
                    value={modalCategory}
                    data={CATEGORY_OPTIONS}
                    onChange={setModalCategory}
                  />
                </View>

                {/* Start date */}
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: theme.colors.gray1,
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  {t("animals.start_date")}
                </Text>
                <View style={{ marginBottom: theme.spacing.m }}>
                  <CompactDatePicker
                    date={modalStartDate}
                    onDateChange={setModalStartDate}
                  />
                </View>

                {/* End date (optional) */}
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: theme.colors.gray1,
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  {t("animals.end_date_optional")}
                </Text>
                <View style={{ marginBottom: theme.spacing.l }}>
                  <CompactDatePicker
                    date={modalEndDate ?? new Date()}
                    onDateChange={(d) => {
                      setModalEndDate(d);
                      setModalHasEndDate(true);
                    }}
                    minimumDate={modalStartDate}
                    placeholder={t("animals.end_date")}
                    hasValue={modalHasEndDate}
                    onClear={() => {
                      setModalHasEndDate(false);
                      setModalEndDate(null);
                    }}
                  />
                </View>

                {/* Actions */}
                <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
                  <Pressable
                    onPress={() => setModalVisible(false)}
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
                    onPress={handleModalConfirm}
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
                      {t("buttons.confirm")}
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            </KeyboardAvoidingView>
          </Pressable>
        )}
      </Modal>
    </ContentView>
  );
}
