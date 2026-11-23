import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import { Button } from "@/components/buttons/Button";
import { InlineDatePicker } from "@/components/datepicker/InlineDatePicker";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { H3 } from "@/theme/Typography";
import { parseDateOnly, toLocalDateString } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { RefObject, useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useUnlinkOffspringMutation,
  useUpdateAnimalMutation,
} from "./animals.hooks";
import { useEarliestHerdChangeDateQuery, useHerdsQuery } from "./herds.hooks";

// Fields of the animal details that can be changed on their own, without the full form.
// The ear tag uses the edit form's search list, the weight its own drawer.
export type AnimalQuickEditField =
  | "name"
  | "type"
  | "sex"
  | "dateOfBirth"
  | "usage"
  | "color"
  | "notes"
  | "death"
  | "herd";

type AnimalUsage = "milk" | "other";
type AnimalType =
  | "goat"
  | "sheep"
  | "cow"
  | "horse"
  | "donkey"
  | "pig"
  | "deer";
const ANIMAL_TYPES: AnimalType[] = [
  "goat",
  "sheep",
  "cow",
  "horse",
  "donkey",
  "pig",
  "deer",
];
type AnimalSex = "male" | "female";
type DeathReason = "died" | "slaughtered";

// The "no herd" option (leaving the herd)
const NO_HERD = "__none__";

// A short list of choices with a check mark on the selected one
function OptionList<TValue extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { value: TValue; label: string }[];
  selected: TValue | null;
  onSelect: (value: TValue) => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: theme.colors.white,
      }}
    >
      {options.map((option) => (
        <ListItem key={option.value} onPress={() => onSelect(option.value)}>
          <ListItem.Content>
            <ListItem.Title>{option.label}</ListItem.Title>
          </ListItem.Content>
          {selected === option.value && (
            <Ionicons
              name="checkmark"
              size={22}
              color={theme.colors.primary}
              style={{ alignSelf: "center", marginRight: theme.spacing.s }}
            />
          )}
        </ListItem>
      ))}
    </View>
  );
}

// Quick edit of one field of the animal in a bottom sheet, saved right away. Rendered
// through a Portal at the app root like the other sheets of the animal details.
export function AnimalQuickEditSheet({
  sheetRef,
  field,
  animal,
  onClose,
  onOpenHerd,
}: {
  sheetRef: RefObject<BottomSheetModal | null>;
  field: AnimalQuickEditField | null;
  onClose: () => void;
  // Herd field: open the herd itself
  onOpenHerd: (herdId: string) => void;
  animal: {
    id: string;
    name: string;
    type: AnimalType;
    sex: AnimalSex;
    dateOfBirth: string | null;
    usage: AnimalUsage;
    color: string | null;
    notes: string | null;
    dateOfDeath: string | null;
    deathReason: DeathReason | null;
    herdId: string | null;
    // as mother or father: unlinked when the sex or type changes
    offspringIds: string[];
    // has a mother or father: unlinked when the type changes
    hasParents: boolean;
  };
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  // Unique per screen instance: the same animal can be open twice in the stack
  const portalKey = useId();
  const unlinkOffspringMutation = useUnlinkOffspringMutation();
  const updateAnimalMutation = useUpdateAnimalMutation(() =>
    sheetRef.current?.dismiss(),
  );
  const { herds } = useHerdsQuery();

  const [animalType, setAnimalType] = useState<AnimalType>(animal.type);
  const [sex, setSex] = useState<AnimalSex>(animal.sex);
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [usage, setUsage] = useState<AnimalUsage>(animal.usage);
  const [text, setText] = useState("");
  const [dateOfDeath, setDateOfDeath] = useState(new Date());
  const [deathReason, setDeathReason] = useState<DeathReason | null>(null);
  const [herdChoice, setHerdChoice] = useState<string>(NO_HERD);
  const [herdEffectiveDate, setHerdEffectiveDate] = useState(new Date());

  const currentHerdId = animal.herdId;
  const herdChanged = herdChoice !== (currentHerdId ?? NO_HERD);
  // A herd change can't take effect before the animal joined its current herd
  const { earliestEffectiveDate } = useEarliestHerdChangeDateQuery(
    [animal.id],
    field === "herd" && herdChanged,
  );

  // Start from the current value each time the sheet opens for a field
  useEffect(() => {
    if (!field) return;
    setAnimalType(animal.type);
    setSex(animal.sex);
    setDateOfBirth(
      animal.dateOfBirth ? parseDateOnly(animal.dateOfBirth) : new Date(),
    );
    setUsage(animal.usage);
    setText(
      field === "name"
        ? animal.name
        : field === "color"
          ? (animal.color ?? "")
          : (animal.notes ?? ""),
    );
    setDateOfDeath(
      animal.dateOfDeath ? parseDateOnly(animal.dateOfDeath) : new Date(),
    );
    setDeathReason(animal.deathReason);
    setHerdChoice(animal.herdId ?? NO_HERD);
    setHerdEffectiveDate(new Date());
  }, [
    field,
    animal.type,
    animal.name,
    animal.sex,
    animal.dateOfBirth,
    animal.usage,
    animal.color,
    animal.notes,
    animal.dateOfDeath,
    animal.deathReason,
    animal.herdId,
  ]);

  // Today, unless that is before the earliest allowed day
  useEffect(() => {
    if (earliestEffectiveDate && herdEffectiveDate < earliestEffectiveDate) {
      setHerdEffectiveDate(earliestEffectiveDate);
    }
  }, [earliestEffectiveDate, herdEffectiveDate]);

  const titles: Record<AnimalQuickEditField, string> = {
    name: t("forms.labels.name"),
    type: t("forms.labels.type"),
    sex: t("forms.labels.sex"),
    dateOfBirth: t("animals.date_of_birth"),
    usage: t("animals.usage"),
    color: t("animals.color"),
    notes: t("animals.notes"),
    death: t("animals.death"),
    herd: t("animals.herd"),
  };

  // This animal as mother / father of its offspring, by its current sex
  const parentField = animal.sex === "female" ? "motherId" : "fatherId";

  // A sex change unlinks the offspring (they'd have a male mother / female father): confirm
  function saveSex() {
    if (sex === animal.sex) {
      sheetRef.current?.dismiss();
      return;
    }
    if (animal.offspringIds.length === 0) {
      updateAnimalMutation.mutate({ id: animal.id, sex });
      return;
    }
    Alert.alert(
      t("animals.sex_change_offspring_title"),
      t("animals.sex_change_offspring_body", {
        name: animal.name,
        count: animal.offspringIds.length,
        parent: t(
          animal.sex === "female" ? "animals.mother" : "animals.father",
        ),
      }),
      [
        { text: t("buttons.cancel"), style: "cancel" },
        {
          text: t("animals.change_anyway"),
          style: "destructive",
          onPress: () => {
            unlinkOffspringMutation.mutate({
              offspringIds: animal.offspringIds,
              parentField,
            });
            updateAnimalMutation.mutate({ id: animal.id, sex });
          },
        },
      ],
    );
  }

  // Category, breeding calendar and treatments depend on the type: always confirm. Parents
  // and offspring would then be of another type, so they're unlinked.
  function saveType() {
    if (animalType === animal.type) {
      sheetRef.current?.dismiss();
      return;
    }
    const hasRelatives = animal.hasParents || animal.offspringIds.length > 0;
    Alert.alert(
      t("animals.type_change_title"),
      [
        t("animals.type_change_body", { name: animal.name }),
        hasRelatives ? t("animals.type_change_relatives") : null,
      ]
        .filter(Boolean)
        .join(" "),
      [
        { text: t("buttons.cancel"), style: "cancel" },
        {
          text: t("animals.change_anyway"),
          style: "destructive",
          onPress: () => {
            if (animal.offspringIds.length > 0) {
              unlinkOffspringMutation.mutate({
                offspringIds: animal.offspringIds,
                parentField,
              });
            }
            updateAnimalMutation.mutate({
              id: animal.id,
              type: animalType,
              ...(animal.hasParents ? { motherId: null, fatherId: null } : {}),
            });
          },
        },
      ],
    );
  }

  function save() {
    if (!field) return;
    if (field === "name") {
      // Required, an empty name isn't saved
      const name = text.trim();
      if (name) updateAnimalMutation.mutate({ id: animal.id, name });
    } else if (field === "type") {
      saveType();
    } else if (field === "sex") {
      saveSex();
    } else if (field === "dateOfBirth") {
      updateAnimalMutation.mutate({
        id: animal.id,
        dateOfBirth: toLocalDateString(dateOfBirth),
      });
    } else if (field === "usage") {
      updateAnimalMutation.mutate({ id: animal.id, usage });
    } else if (field === "death") {
      updateAnimalMutation.mutate({
        id: animal.id,
        dateOfDeath: toLocalDateString(dateOfDeath),
        deathReason,
      });
    } else if (field === "herd") {
      if (!herdChanged) {
        sheetRef.current?.dismiss();
        return;
      }
      updateAnimalMutation.mutate({
        id: animal.id,
        herdId: herdChoice === NO_HERD ? null : herdChoice,
        herdEffectiveDate: toLocalDateString(herdEffectiveDate),
      });
    } else {
      // An emptied field clears the value, like in the edit form
      updateAnimalMutation.mutate({
        id: animal.id,
        [field]: text.trim() || null,
      });
    }
  }

  return (
    <Portal>
      <BottomSheetModalProvider key={portalKey}>
        <BottomDrawerModal ref={sheetRef} onClose={onClose}>
          {field && (
            <View style={{ gap: theme.spacing.m }}>
              <H3>{titles[field]}</H3>

              {field === "type" && (
                <OptionList
                  options={ANIMAL_TYPES.map((type) => ({
                    value: type,
                    label: t(`animals.animal_types.${type}`),
                  }))}
                  selected={animalType}
                  onSelect={setAnimalType}
                />
              )}

              {field === "sex" && (
                <OptionList
                  options={[
                    { value: "female", label: t("animals.sex.female") },
                    { value: "male", label: t("animals.sex.male") },
                  ]}
                  selected={sex}
                  onSelect={setSex}
                />
              )}

              {field === "dateOfBirth" && (
                <InlineDatePicker
                  label={t("animals.date_of_birth")}
                  date={dateOfBirth}
                  onChange={setDateOfBirth}
                  maximumDate={new Date()}
                />
              )}

              {field === "usage" && (
                <OptionList
                  options={[
                    { value: "milk", label: t("animals.usage_types.milk") },
                    { value: "other", label: t("animals.usage_types.other") },
                  ]}
                  selected={usage}
                  onSelect={setUsage}
                />
              )}

              {(field === "name" || field === "color" || field === "notes") && (
                <TextInput
                  hideLabel
                  placeholder={titles[field]}
                  value={text}
                  onChangeText={setText}
                  autoFocus
                  // Notes: a text area like in the edit form
                  multiline={field === "notes"}
                  returnKeyType={field === "notes" ? "default" : undefined}
                  style={
                    field === "notes"
                      ? { textAlignVertical: "top", minHeight: 100 }
                      : undefined
                  }
                />
              )}

              {/* Date and reason together; the reason is optional, tapping it again clears it */}
              {field === "death" && (
                <>
                  <InlineDatePicker
                    label={t("animals.date_of_death")}
                    date={dateOfDeath}
                    onChange={setDateOfDeath}
                    maximumDate={new Date()}
                  />
                  <OptionList
                    options={[
                      { value: "died", label: t("animals.death_reasons.died") },
                      {
                        value: "slaughtered",
                        label: t("animals.death_reasons.slaughtered"),
                      },
                    ]}
                    selected={deathReason}
                    onSelect={(reason) =>
                      setDeathReason((current) =>
                        current === reason ? null : reason,
                      )
                    }
                  />
                </>
              )}

              {field === "herd" && (
                <>
                  <OptionList
                    options={[
                      { value: NO_HERD, label: t("animals.no_herd") },
                      ...(herds ?? []).map((herd) => ({
                        value: herd.id,
                        label: herd.name,
                      })),
                    ]}
                    selected={herdChoice}
                    onSelect={setHerdChoice}
                  />
                  {/* From when the change counts, only when the herd changes (as in the form) */}
                  {herdChanged && (
                    <InlineDatePicker
                      label={
                        herdChoice === NO_HERD
                          ? t("animals.herd_left_on")
                          : t("animals.herd_member_since")
                      }
                      date={herdEffectiveDate}
                      onChange={setHerdEffectiveDate}
                      minimumDate={earliestEffectiveDate ?? undefined}
                    />
                  )}
                  {currentHerdId && (
                    <ListItem
                      onPress={() => {
                        sheetRef.current?.dismiss();
                        onOpenHerd(currentHerdId);
                      }}
                    >
                      <ListItem.Content>
                        <ListItem.Title>
                          {t("animals.open_herd")}
                        </ListItem.Title>
                      </ListItem.Content>
                      <ListItem.Chevron />
                    </ListItem>
                  )}
                </>
              )}

              <Button
                title={t("buttons.save")}
                onPress={save}
                loading={updateAnimalMutation.isPending}
              />
              {/* Death: undo a recorded death (clears date and reason) */}
              {field === "death" && animal.dateOfDeath && (
                <Button
                  type="dangerGhost"
                  title={t("buttons.remove")}
                  onPress={() =>
                    updateAnimalMutation.mutate({
                      id: animal.id,
                      dateOfDeath: null,
                      deathReason: null,
                    })
                  }
                />
              )}
            </View>
          )}
        </BottomDrawerModal>
      </BottomSheetModalProvider>
    </Portal>
  );
}
