import { Button } from "@/components/buttons/Button";
import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import { TextInput } from "@/components/inputs/TextInput";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ListItem } from "@/components/list/ListItem";
import { H3, Label } from "@/theme/Typography";
import {
  formatLocalizedDate,
  parseDateOnly,
  toLocalDateString,
} from "@/utils/date";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { RefObject, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Keyboard, Platform, Pressable, View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useCreateAnimalWeightMutation,
  useUpdateAnimalWeightMutation,
} from "./breeding.hooks";

// Weight shown on the field: the latest saved entry, or the not yet saved one of a new animal
export type DrawerWeight = { id?: string; date: Date; weightKg: number };

type DrawerStep = "choose" | "edit" | "new";

// Drawer for the weight field: choose between editing the current weight and adding a new
// entry, then enter date and kg. Without animalId (animal not created yet) the entry is handed
// to onPendingWeightChange instead of being saved.
export function AnimalWeightDrawer({
  sheetRef,
  animalId,
  currentWeight,
  onPendingWeightChange,
}: {
  sheetRef: RefObject<BottomSheetModal | null>;
  animalId?: string;
  currentWeight: DrawerWeight | null;
  onPendingWeightChange?: (weight: DrawerWeight) => void;
}) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  // PortalHost renders portals as an unkeyed list, a unique key keeps this sheet's state apart
  const portalKey = useId();
  // null: drawer just opened, shows the choice (or the new entry form when there is no weight yet)
  const [selectedStep, setSelectedStep] = useState<DrawerStep | null>(null);
  const [entryDate, setEntryDate] = useState(new Date());
  const [weightInput, setWeightInput] = useState("");
  const [weightInputKey, setWeightInputKey] = useState(0);
  // The shared DatePicker opens its own drawer, which can't stack on this one. The calendar is
  // shown inline here instead (iOS), Android uses its native dialog which is no drawer.
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const step: DrawerStep = selectedStep ?? (currentWeight ? "choose" : "new");

  const createWeightMutation = useCreateAnimalWeightMutation(() =>
    sheetRef.current?.dismiss(),
  );
  const updateWeightMutation = useUpdateAnimalWeightMutation(() =>
    sheetRef.current?.dismiss(),
  );

  function selectStep(nextStep: "edit" | "new") {
    setSelectedStep(nextStep);
    setWeightInputKey((key) => key + 1);
    if (nextStep === "edit" && currentWeight) {
      setEntryDate(currentWeight.date);
      setWeightInput(String(currentWeight.weightKg));
    } else {
      setEntryDate(new Date());
      setWeightInput("");
    }
  }

  function resetDrawer() {
    setSelectedStep(null);
    setWeightInputKey((key) => key + 1);
    setDatePickerOpen(false);
    setEntryDate(new Date());
    setWeightInput("");
  }

  const weightKg = parseFloat(weightInput.replace(",", "."));
  const isValid = Number.isFinite(weightKg) && weightKg > 0;
  const isSaving =
    createWeightMutation.isPending || updateWeightMutation.isPending;

  function save() {
    if (!isValid) return;
    if (!animalId) {
      onPendingWeightChange?.({ date: entryDate, weightKg });
      sheetRef.current?.dismiss();
      return;
    }
    const input = { date: toLocalDateString(entryDate), weightKg };
    // The drawer stays open on failure, tell the user instead of doing nothing
    const showError = () =>
      Alert.alert(t("common.error"), t("common.unknown_error"));
    if (step === "edit" && currentWeight?.id) {
      updateWeightMutation.mutate(
        { weightId: currentWeight.id, input },
        { onError: showError },
      );
    } else {
      createWeightMutation.mutate({ animalId, input }, { onError: showError });
    }
  }

  return (
    <Portal>
      <BottomSheetModalProvider key={portalKey}>
        <BottomDrawerModal ref={sheetRef} onClose={resetDrawer}>
          <View style={{ gap: theme.spacing.s }}>
            <H3>{t("breeding.weight")}</H3>
            {step === "choose" ? (
              <View>
                <ListItem onPress={() => selectStep("edit")}>
                  <ListItem.Content>
                    <ListItem.Title>{t("breeding.edit_weight")}</ListItem.Title>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
                <ListItem onPress={() => selectStep("new")}>
                  <ListItem.Content>
                    <ListItem.Title>
                      {t("breeding.add_weight_entry")}
                    </ListItem.Title>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
              </View>
            ) : (
              <View style={{ gap: theme.spacing.s }}>
                <Pressable
                  onPress={() => {
                    Keyboard.dismiss();
                    setDatePickerOpen((open) => !open);
                  }}
                >
                  <View pointerEvents="none">
                    <TextInput
                      label={t("breeding.date")}
                      value={formatLocalizedDate(
                        entryDate,
                        i18n.language,
                        "long",
                      )}
                    />
                  </View>
                </Pressable>
                {datePickerOpen && Platform.OS === "ios" && (
                  <DateTimePicker
                    value={entryDate}
                    mode="date"
                    display="inline"
                    // A weighing can't be in the future
                    maximumDate={new Date()}
                    locale={i18n.language}
                    themeVariant="light"
                    onChange={(_event, selectedDate) => {
                      if (!selectedDate) return;
                      setEntryDate(selectedDate);
                      setDatePickerOpen(false);
                    }}
                  />
                )}
                {datePickerOpen && Platform.OS === "android" && (
                  <DateTimePicker
                    value={entryDate}
                    mode="date"
                    display="calendar"
                    // A weighing can't be in the future
                    maximumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setDatePickerOpen(false);
                      if (event.type === "set" && selectedDate) {
                        setEntryDate(selectedDate);
                      }
                    }}
                  />
                )}
                <View>
                  <Label style={{ marginBottom: theme.spacing.xxs }}>
                    {t("breeding.weight_kg")}
                  </Label>
                  <BottomSheetTextInput
                    // Uncontrolled: writing the value back on every keystroke made the native
                    // input flicker. Remounted via key to load the start value of a step.
                    key={weightInputKey}
                    defaultValue={weightInput}
                    onChangeText={setWeightInput}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor={theme.colors.gray2}
                    style={{
                      fontSize: 17,
                      padding: 10,
                      borderRadius: theme.radii.l,
                      borderWidth: 1,
                      borderColor: theme.colors.gray2,
                      backgroundColor: theme.colors.white,
                      color: theme.colors.gray0,
                    }}
                  />
                </View>
                <Button
                  title={t("buttons.save")}
                  onPress={save}
                  disabled={!isValid || isSaving}
                  loading={isSaving}
                />
              </View>
            )}
          </View>
        </BottomDrawerModal>
      </BottomSheetModalProvider>
    </Portal>
  );
}

// Converts the API's latest weight to the drawer's weight
export function toDrawerWeight(
  latestWeight:
    | { id: string; date: string; weightKg: number }
    | null
    | undefined,
): DrawerWeight | null {
  if (!latestWeight) return null;
  return {
    id: latestWeight.id,
    date: parseDateOnly(latestWeight.date),
    weightKg: latestWeight.weightKg,
  };
}
