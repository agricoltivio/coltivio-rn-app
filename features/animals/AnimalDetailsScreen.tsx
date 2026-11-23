import { Button } from "@/components/buttons/Button";
import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useAnimalByIdQuery,
  useDeleteAnimalMutation,
  useUpdateAnimalMutation,
} from "./animals.hooks";
import { usePermissions } from "@/features/user/users.hooks";
import { AnimalDetailsScreenProps } from "./navigation/animals-routes";
import {
  formatLocalizedDate,
  parseDateOnly,
  toLocalDateString,
} from "@/utils/date";
import { Switch } from "@/components/inputs/Switch";
import { useAnimalHeatsQuery, useAnimalWeightsQuery } from "./breeding.hooks";
import { AnimalWeightChartDrawer } from "./AnimalWeightField";
import { AnimalWeightDrawer } from "./AnimalWeightDrawer";
import { useAvailableEarTagsQuery } from "./earTags.hooks";
import { SelectSearchModal } from "@/components/select/Select";
import {
  AnimalQuickEditField,
  AnimalQuickEditSheet,
} from "./AnimalQuickEditSheet";
import { useAnimalParasiteHistoryQuery } from "./parasite-checks.hooks";

// "No ear tag" entry of the ear tag picker (removes the tag)
const NO_EAR_TAG = "__none__";

export function AnimalDetailsScreen({
  route,
  navigation,
}: AnimalDetailsScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const animalId = route.params.animalId;
  const { animal } = useAnimalByIdQuery(animalId);
  const { weights } = useAnimalWeightsQuery(animalId);
  const isFemale = animal?.sex === "female";
  const { heats } = useAnimalHeatsQuery(animalId, isFemale);
  const { history: parasiteHistory } = useAnimalParasiteHistoryQuery(animalId);

  const deleteAnimalMutation = useDeleteAnimalMutation(() =>
    navigation.goBack(),
  );

  // Drawer with the weight timeline chart
  const weightChartSheetRef = useRef<BottomSheetModal>(null);
  // Ear tag picker (search list), only loads the free tags once opened
  const [earTagPickerVisible, setEarTagPickerVisible] = useState(false);
  const { availableEarTags } = useAvailableEarTagsQuery(earTagPickerVisible);
  const updateEarTagMutation = useUpdateAnimalMutation();
  // Weight drawer: correct the current weight or add an entry
  const weightSheetRef = useRef<BottomSheetModal>(null);
  // Sheet to edit a single field of the animal
  const quickEditSheetRef = useRef<BottomSheetModal>(null);
  const [quickEditField, setQuickEditField] =
    useState<AnimalQuickEditField | null>(null);
  // Opened once the field is set: the sheet sizes itself to its content, which only exists
  // then. Closing resets the field, so the same field can be opened again.
  useEffect(() => {
    if (quickEditField) quickEditSheetRef.current?.present();
  }, [quickEditField]);
  const updateRegisteredMutation = useUpdateAnimalMutation();

  // Combine children from both mother and father relationships
  const children = useMemo(() => {
    if (!animal) return [];
    return [
      ...(animal.childrenAsMother ?? []),
      ...(animal.childrenAsFather ?? []),
    ];
  }, [animal]);

  function onDelete() {
    deleteAnimalMutation.mutate(animalId);
  }

  if (!animal) {
    return null;
  }

  // Summaries of the sections
  const lastMatedHeat = (heats ?? [])
    .filter((heat) => heat.mated)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  // One line each: the expected birth if it is still ahead, otherwise the last mating. The API
  // keeps the expected birth after the birth happened, so a past one would be last season's.
  const todayDateString = toLocalDateString(new Date());
  const upcomingExpectedBirthDate =
    lastMatedHeat?.expectedBirthDate &&
    lastMatedHeat.expectedBirthDate.slice(0, 10) >= todayDateString
      ? lastMatedHeat.expectedBirthDate
      : null;
  const heatsSummary = upcomingExpectedBirthDate
    ? `${t("breeding.expected_birth")}: ${formatLocalizedDate(
        parseDateOnly(upcomingExpectedBirthDate),
        locale,
      )}`
    : lastMatedHeat
      ? t("breeding.last_mated", {
          date: formatLocalizedDate(parseDateOnly(lastMatedHeat.date), locale),
        })
      : t("breeding.n_heats", { count: heats?.length ?? 0 });
  const treatmentsSummary = t("treatments.n_treatments", {
    count: animal.treatments.length,
  });
  const parasiteChecks = parasiteHistory?.checks ?? [];
  const latestParasiteCheck = [...parasiteChecks].sort((a, b) =>
    b.date.localeCompare(a.date),
  )[0];
  const parasiteSummary = [
    t("parasite_checks.n_checks", { count: parasiteChecks.length }),
    latestParasiteCheck
      ? t("common.last_value", {
          value: formatLocalizedDate(
            parseDateOnly(latestParasiteCheck.date),
            locale,
          ),
        })
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const currentHerd = animal.herd;

  // Quick edit: tapping an editable field opens a sheet with just that field
  const quickEditOnPress = (field: AnimalQuickEditField) =>
    canWrite("animals") ? () => setQuickEditField(field) : undefined;
  const quickEditIcon = canWrite("animals") ? (
    <Ionicons
      name="create-outline"
      size={20}
      color={theme.colors.gray2}
      style={{ alignSelf: "center", marginRight: theme.spacing.s }}
    />
  ) : null;

  const formattedDateOfBirth = animal.dateOfBirth
    ? new Date(animal.dateOfBirth).toLocaleDateString()
    : "-";

  const formattedDateOfDeath = animal.dateOfDeath
    ? new Date(animal.dateOfDeath).toLocaleDateString()
    : null;

  return (
    <ContentView
      headerVisible
      footerComponent={
        canWrite("animals") ? (
          <BottomActionContainer>
            <View
              style={{
                flexDirection: "row",
                gap: theme.spacing.s,
              }}
            >
              <Button
                style={{ flexGrow: 1 }}
                type="danger"
                title={t("buttons.delete")}
                onPress={onDelete}
                disabled={deleteAnimalMutation.isPending}
                loading={deleteAnimalMutation.isPending}
              />
              <Button
                style={{ flexGrow: 1 }}
                title={t("buttons.edit")}
                onPress={() => navigation.navigate("EditAnimal", { animalId })}
              />
            </View>
          </BottomActionContainer>
        ) : undefined
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={animal.name}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <H2>{animal.name}</H2>
          <MaterialCommunityIconButton
            type="accent"
            icon="sitemap"
            iconSize={22}
            color={theme.colors.primary}
            onPress={() =>
              navigation.navigate("FamilyTree", {
                animalType: animal.type,
                focusedAnimalId: animal.id,
              })
            }
          />
        </View>

        {/* Basic info */}
        <View
          style={{
            marginTop: theme.spacing.m,
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: theme.colors.white,
          }}
        >
          <ListItem
            style={{ paddingVertical: 5 }}
            onPress={quickEditOnPress("name")}
          >
            <ListItem.Content>
              <ListItem.Title>{t("forms.labels.name")}</ListItem.Title>
              <ListItem.Body>{animal.name}</ListItem.Body>
            </ListItem.Content>
            {quickEditIcon}
          </ListItem>
          <ListItem
            style={{ paddingVertical: 5 }}
            onPress={quickEditOnPress("type")}
          >
            <ListItem.Content>
              <ListItem.Title>{t("forms.labels.type")}</ListItem.Title>
              <ListItem.Body>
                {t(`animals.animal_types.${animal.type}`)}
              </ListItem.Body>
            </ListItem.Content>
            {quickEditIcon}
          </ListItem>
          <ListItem
            style={{ paddingVertical: 5 }}
            onPress={
              canWrite("animals")
                ? () => setEarTagPickerVisible(true)
                : undefined
            }
          >
            <ListItem.Content>
              <ListItem.Title>{t("ear_tags.ear_tag")}</ListItem.Title>
              <ListItem.Body>
                {animal.earTag?.number ?? t("ear_tags.no_ear_tag")}
              </ListItem.Body>
            </ListItem.Content>
            {quickEditIcon}
          </ListItem>
          <ListItem
            style={{ paddingVertical: 5 }}
            onPress={quickEditOnPress("sex")}
          >
            <ListItem.Content>
              <ListItem.Title>{t("forms.labels.sex")}</ListItem.Title>
              <ListItem.Body>{t(`animals.sex.${animal.sex}`)}</ListItem.Body>
            </ListItem.Content>
            {quickEditIcon}
          </ListItem>
          <ListItem
            style={{ paddingVertical: 5 }}
            onPress={quickEditOnPress("dateOfBirth")}
          >
            <ListItem.Content>
              <ListItem.Title>{t("animals.date_of_birth")}</ListItem.Title>
              <ListItem.Body>{formattedDateOfBirth}</ListItem.Body>
            </ListItem.Content>
            {quickEditIcon}
          </ListItem>
          <ListItem style={{ paddingVertical: 5 }}>
            <ListItem.Content>
              <ListItem.Title>{t("animals.registered")}</ListItem.Title>
            </ListItem.Content>
            <Switch
              value={animal.registered}
              disabled={!canWrite("animals")}
              onChange={() =>
                updateRegisteredMutation.mutate({
                  id: animalId,
                  registered: !animal.registered,
                })
              }
            />
          </ListItem>
          <ListItem
            style={{ paddingVertical: 5 }}
            onPress={quickEditOnPress("usage")}
          >
            <ListItem.Content>
              <ListItem.Title>{t("animals.usage")}</ListItem.Title>
              <ListItem.Body>
                {t(`animals.usage_types.${animal.usage}`)}
              </ListItem.Body>
            </ListItem.Content>
            {quickEditIcon}
          </ListItem>
          {/* Weight: the weight drawer of the edit form (edit the current entry or add one) */}
          <ListItem
            style={{ paddingVertical: 5 }}
            onPress={
              canWrite("animals")
                ? () => weightSheetRef.current?.present()
                : undefined
            }
          >
            <ListItem.Content>
              <ListItem.Title>{t("breeding.weight")}</ListItem.Title>
              <ListItem.Body>
                {animal.latestWeight
                  ? `${animal.latestWeight.weightKg} kg (${formatLocalizedDate(
                      parseDateOnly(animal.latestWeight.date),
                      locale,
                    )})`
                  : t("breeding.no_weight")}
              </ListItem.Body>
            </ListItem.Content>
            {(weights?.length ?? 0) >= 2 && (
              // ListItem stretches its children to the row height, centering keeps the button square
              <View
                style={{
                  justifyContent: "center",
                  paddingRight: theme.spacing.m,
                }}
              >
                <MaterialCommunityIconButton
                  type="accent"
                  icon="chart-line"
                  iconSize={20}
                  color={theme.colors.primary}
                  onPress={() => weightChartSheetRef.current?.present()}
                />
              </View>
            )}
            {quickEditIcon}
          </ListItem>
          {/* Empty color / notes only with write access, so they can be added */}
          {(animal.color || canWrite("animals")) && (
            <ListItem
              style={{ paddingVertical: 5 }}
              onPress={quickEditOnPress("color")}
            >
              <ListItem.Content>
                <ListItem.Title>{t("animals.color")}</ListItem.Title>
                <ListItem.Body>{animal.color || "–"}</ListItem.Body>
              </ListItem.Content>
              {quickEditIcon}
            </ListItem>
          )}
          {(animal.notes || canWrite("animals")) && (
            <ListItem
              style={{ paddingVertical: 5 }}
              onPress={quickEditOnPress("notes")}
            >
              <ListItem.Content>
                <ListItem.Title>{t("animals.notes")}</ListItem.Title>
                <ListItem.Body>{animal.notes || "–"}</ListItem.Body>
              </ListItem.Content>
              {quickEditIcon}
            </ListItem>
          )}
          {animal.customOutdoorJournalCategories.length > 0 && (
            <ListItem
              style={{ paddingVertical: 5 }}
              onPress={() =>
                navigation.navigate("ManageAnimalCategories", {
                  animalId: animal.id,
                })
              }
            >
              <ListItem.Content>
                <ListItem.Title>
                  {t("animals.custom_animal_category")}
                </ListItem.Title>
                <ListItem.Body>
                  {(() => {
                    const today = new Date();
                    const active = animal.customOutdoorJournalCategories.find(
                      (entry) => {
                        const start = new Date(entry.startDate);
                        const end = entry.endDate
                          ? new Date(entry.endDate)
                          : null;
                        return start <= today && (!end || end >= today);
                      },
                    );
                    return active
                      ? active.category
                      : t("animals.no_active_category");
                  })()}
                </ListItem.Body>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          )}
          {/* Herd: quick edit (herd and from when) with write access, otherwise opens the herd */}
          {(animal.herd || canWrite("animals")) && (
            <ListItem
              style={{ paddingVertical: 5 }}
              onPress={
                canWrite("animals")
                  ? quickEditOnPress("herd")
                  : currentHerd
                    ? () =>
                        navigation.navigate("HerdEdit", {
                          herdId: currentHerd.id,
                        })
                    : undefined
              }
            >
              <ListItem.Content>
                <ListItem.Title>{t("animals.herd")}</ListItem.Title>
                <ListItem.Body>{animal.herd?.name ?? "–"}</ListItem.Body>
              </ListItem.Content>
              {canWrite("animals") ? quickEditIcon : <ListItem.Chevron />}
            </ListItem>
          )}
          {/* Death: date and reason in one row and one quick edit; shown empty only with write access */}
          {(formattedDateOfDeath || canWrite("animals")) && (
            <ListItem
              style={{ paddingVertical: 5 }}
              onPress={quickEditOnPress("death")}
            >
              <ListItem.Content>
                <ListItem.Title>{t("animals.date_of_death")}</ListItem.Title>
                <ListItem.Body>
                  {formattedDateOfDeath
                    ? [
                        formattedDateOfDeath,
                        animal.deathReason
                          ? t(`animals.death_reasons.${animal.deathReason}`)
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : "–"}
                </ListItem.Body>
              </ListItem.Content>
              {quickEditIcon}
            </ListItem>
          )}
        </View>

        {/* Mother */}
        {animal.mother && (
          <View style={{ marginTop: theme.spacing.l }}>
            <H3>{t("animals.mother")}</H3>
            <View
              style={{
                marginTop: theme.spacing.s,
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
            >
              <ListItem
                style={{ paddingVertical: 5 }}
                onPress={() =>
                  navigation.push("AnimalDetails", {
                    animalId: animal.mother!.id,
                  })
                }
              >
                <ListItem.Content>
                  <ListItem.Title>{animal.mother.name}</ListItem.Title>
                  {animal.mother.earTag && (
                    <ListItem.Body>{animal.mother.earTag.number}</ListItem.Body>
                  )}
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            </View>
          </View>
        )}

        {/* Father */}
        {animal.father && (
          <View style={{ marginTop: theme.spacing.l }}>
            <H3>{t("animals.father")}</H3>
            <View
              style={{
                marginTop: theme.spacing.s,
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
            >
              <ListItem
                style={{ paddingVertical: 5 }}
                onPress={() =>
                  navigation.push("AnimalDetails", {
                    animalId: animal.father!.id,
                  })
                }
              >
                <ListItem.Content>
                  <ListItem.Title>{animal.father.name}</ListItem.Title>
                  {animal.father.earTag && (
                    <ListItem.Body>{animal.father.earTag.number}</ListItem.Body>
                  )}
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            </View>
          </View>
        )}

        {/* Sections, each opening its own screen, with a one-line summary */}
        <View
          style={{
            marginTop: theme.spacing.l,
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: theme.colors.white,
          }}
        >
          {isFemale && (
            <ListItem
              style={{ paddingVertical: 5 }}
              onPress={() => navigation.navigate("AnimalHeats", { animalId })}
            >
              <Ionicons
                name="heart-outline"
                size={20}
                color={theme.colors.primary}
                style={{ alignSelf: "center", marginLeft: theme.spacing.s }}
              />
              <ListItem.Content>
                <ListItem.Title>{t("breeding.heats")}</ListItem.Title>
                <ListItem.Body numberOfLines={1}>{heatsSummary}</ListItem.Body>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          )}
          <ListItem
            style={{ paddingVertical: 5 }}
            onPress={() => navigation.navigate("AnimalOffspring", { animalId })}
          >
            <Ionicons
              name="git-branch-outline"
              size={20}
              color={theme.colors.primary}
              style={{ alignSelf: "center", marginLeft: theme.spacing.s }}
            />
            <ListItem.Content>
              <ListItem.Title>{t("animals.children")}</ListItem.Title>
              <ListItem.Body numberOfLines={1}>
                {t("animals.n_offspring", { count: children.length })}
              </ListItem.Body>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <ListItem
            style={{ paddingVertical: 5 }}
            onPress={() =>
              navigation.navigate("AnimalTreatments", { animalId })
            }
          >
            <Ionicons
              name="medkit-outline"
              size={20}
              color={theme.colors.primary}
              style={{ alignSelf: "center", marginLeft: theme.spacing.s }}
            />
            <ListItem.Content>
              <ListItem.Title>{t("treatments.treatments")}</ListItem.Title>
              <ListItem.Body numberOfLines={1}>
                {treatmentsSummary}
              </ListItem.Body>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <ListItem
            style={{ paddingVertical: 5 }}
            onPress={() =>
              navigation.navigate("AnimalParasiteHistory", { animalId })
            }
          >
            <Ionicons
              name="bug-outline"
              size={20}
              color={theme.colors.primary}
              style={{ alignSelf: "center", marginLeft: theme.spacing.s }}
            />
            <ListItem.Content>
              <ListItem.Title>
                {t("parasite_checks.parasite_history")}
              </ListItem.Title>
              <ListItem.Body numberOfLines={1}>{parasiteSummary}</ListItem.Body>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <ListItem
            style={{ paddingVertical: 5 }}
            onPress={() => navigation.navigate("AnimalJournal", { animalId })}
          >
            <Ionicons
              name="book-outline"
              size={20}
              color={theme.colors.primary}
              style={{ alignSelf: "center", marginLeft: theme.spacing.s }}
            />
            <ListItem.Content>
              <ListItem.Title>{t("animals.journal")}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        </View>
      </ScrollView>

      {/* Ear tag: the same search list as in the edit form, saved on pick */}
      <SelectSearchModal
        visible={earTagPickerVisible}
        title={t("ear_tags.ear_tag")}
        value={animal.earTagId ?? NO_EAR_TAG}
        data={[
          { label: t("ear_tags.no_ear_tag"), value: NO_EAR_TAG },
          ...(animal.earTag
            ? [{ label: animal.earTag.number, value: animal.earTag.id }]
            : []),
          ...(availableEarTags ?? []).map((earTag) => ({
            label: earTag.number,
            value: earTag.id,
          })),
        ]}
        onSelect={(earTagId) => {
          setEarTagPickerVisible(false);
          if (earTagId === (animal.earTagId ?? NO_EAR_TAG)) return;
          updateEarTagMutation.mutate({
            id: animalId,
            earTagId: earTagId === NO_EAR_TAG ? null : earTagId,
          });
        }}
        onClose={() => setEarTagPickerVisible(false)}
      />

      <AnimalQuickEditSheet
        sheetRef={quickEditSheetRef}
        field={quickEditField}
        animal={{
          ...animal,
          offspringIds: children.map((child) => child.id),
          hasParents: !!animal.motherId || !!animal.fatherId,
        }}
        onClose={() => setQuickEditField(null)}
        onOpenHerd={(herdId) => navigation.navigate("HerdEdit", { herdId })}
      />

      <AnimalWeightDrawer
        sheetRef={weightSheetRef}
        animalId={animalId}
        currentWeight={
          animal.latestWeight
            ? {
                id: animal.latestWeight.id,
                date: parseDateOnly(animal.latestWeight.date),
                weightKg: animal.latestWeight.weightKg,
              }
            : null
        }
      />

      <AnimalWeightChartDrawer
        sheetRef={weightChartSheetRef}
        animalId={animalId}
        // Tapping an entry opens it for editing, with write access
        canEdit={canWrite("animals")}
      />
    </ContentView>
  );
}
