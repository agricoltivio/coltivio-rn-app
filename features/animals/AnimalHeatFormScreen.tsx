import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { resolveHeatOutcomes } from "./heat-outcomes";
import { RHSwitch } from "@/components/inputs/RHSwitch";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { ListItem } from "@/components/list/ListItem";
import { Body, H2, Subtitle } from "@/theme/Typography";
import {
  formatLocalizedDate,
  parseDateOnly,
  toLocalDateString,
} from "@/utils/date";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalByIdQuery, useAnimalsQuery } from "./animals.hooks";
import {
  useAnimalHeatsQuery,
  useCreateAnimalHeatMutation,
  useCreateAnimalHeatsBatchMutation,
  useDeleteAnimalHeatMutation,
  useGestationSettingsQuery,
  useUpdateAnimalHeatMutation,
} from "./breeding.hooks";
import { AnimalHeatFormScreenProps } from "./navigation/animals-routes";

type HeatFormValues = {
  date: Date;
  mated: boolean;
  sireId?: string | null;
  sireName?: string;
  notes?: string;
};

export function AnimalHeatFormScreen({
  route,
  navigation,
}: AnimalHeatFormScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const {
    animalId: fixedAnimalId,
    heatId,
    animalIds: pickedAnimalIds,
  } = route.params;
  const isEditMode = !!heatId;
  // Opened from the breeding calendar: the animals are picked here, the heat is created for all of them
  const picksAnimals = !fixedAnimalId;
  const selectedAnimalIds = fixedAnimalId
    ? [fixedAnimalId]
    : (pickedAnimalIds ?? []);
  // Outcome preview and heat history only for a single animal
  const singleAnimalId =
    selectedAnimalIds.length === 1 ? selectedAnimalIds[0] : undefined;
  const { animal } = useAnimalByIdQuery(singleAnimalId ?? "", !!singleAnimalId);
  // All animals, so a sire that died since the mating can still be shown
  const { animals } = useAnimalsQuery(false);
  const selectedAnimals = (animals ?? []).filter((candidate) =>
    selectedAnimalIds.includes(candidate.id),
  );
  // The picker only allows one type, so the first animal's type is the type of all
  const animalType = animal?.type ?? selectedAnimals[0]?.type;
  const { heats } = useAnimalHeatsQuery(singleAnimalId ?? "", !!singleAnimalId);
  const { gestationSettings } = useGestationSettingsQuery();
  const existingHeat = heats?.find((heat) => heat.id === heatId);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<HeatFormValues>({
    defaultValues: { date: new Date(), mated: false },
    values: existingHeat
      ? {
          date: parseDateOnly(existingHeat.date),
          mated: existingHeat.mated,
          sireId: existingHeat.sireId,
          sireName: existingHeat.sireName ?? undefined,
          notes: existingHeat.notes ?? undefined,
        }
      : undefined,
  });
  const heatDate = useWatch({ control, name: "date" });
  const mated = useWatch({ control, name: "mated" });

  // Living males of the same type are offered as sire, plus the saved sire if it died since
  const sireSelectData = useMemo(
    () =>
      (animals ?? [])
        .filter(
          (candidate) =>
            candidate.sex === "male" &&
            candidate.type === animalType &&
            !selectedAnimalIds.includes(candidate.id) &&
            (candidate.dateOfDeath == null ||
              candidate.id === existingHeat?.sireId),
        )
        .map((candidate) => ({
          label: `${
            candidate.earTag?.number
              ? `${candidate.earTag.number} - ${candidate.name}`
              : candidate.name
          }${candidate.dateOfDeath ? " †" : ""}`,
          value: candidate.id,
        })),
    [animals, animalType, selectedAnimalIds, existingHeat?.sireId],
  );

  const gestationDays = gestationSettings?.find(
    (setting) => setting.animalType === animalType,
  )?.gestationDays;
  // Unchanged existing heats show the server's outcome, edited or new ones are previewed with the server's
  // rule (heat-outcomes.ts) against the animal's other heats
  const heatUnchanged =
    existingHeat != null &&
    heatDate != null &&
    existingHeat.date.slice(0, 10) === toLocalDateString(heatDate) &&
    existingHeat.mated === mated;
  let expectedBirthDate: Date | null = null;
  let conceptionFailed = false;
  if (heatUnchanged) {
    expectedBirthDate = existingHeat.expectedBirthDate
      ? parseDateOnly(existingHeat.expectedBirthDate)
      : null;
    conceptionFailed = existingHeat.conceptionFailed ?? false;
  } else if (mated && heatDate && gestationDays && singleAnimalId) {
    const previewHeatId = heatId ?? "preview";
    const previewOutcome = resolveHeatOutcomes(
      [
        ...(heats ?? [])
          .filter((heat) => heat.id !== heatId)
          .map((heat) => ({
            id: heat.id,
            date: parseDateOnly(heat.date),
            mated: heat.mated,
          })),
        { id: previewHeatId, date: heatDate, mated },
      ],
      gestationDays,
    ).get(previewHeatId);
    expectedBirthDate = previewOutcome?.expectedBirthDate ?? null;
    conceptionFailed = previewOutcome?.conceptionFailed ?? false;
  }

  const createMutation = useCreateAnimalHeatMutation(() => navigation.goBack());
  const createBatchMutation = useCreateAnimalHeatsBatchMutation(() =>
    navigation.goBack(),
  );
  const updateMutation = useUpdateAnimalHeatMutation(() => navigation.goBack());
  const deleteMutation = useDeleteAnimalHeatMutation(() => navigation.goBack());

  // The screen stays open on failure, tell the user instead of doing nothing
  function showError() {
    Alert.alert(t("common.error"), t("common.unknown_error"));
  }

  function onSubmit(values: HeatFormValues) {
    const input = {
      date: toLocalDateString(values.date),
      mated: values.mated,
      sireId: values.mated ? (values.sireId ?? null) : null,
      sireName: values.mated ? values.sireName || null : null,
      notes: values.notes || null,
    };
    if (heatId) {
      updateMutation.mutate({ heatId, input }, { onError: showError });
    } else if (picksAnimals) {
      if (selectedAnimalIds.length === 0) {
        Alert.alert(t("treatments.no_animals_selected"));
        return;
      }
      createBatchMutation.mutate(
        { animalIds: selectedAnimalIds, ...input },
        { onError: showError },
      );
    } else if (fixedAnimalId) {
      createMutation.mutate(
        { animalId: fixedAnimalId, input },
        { onError: showError },
      );
    }
  }

  function onDelete() {
    if (!heatId) return;
    Alert.alert(t("breeding.delete_heat"), undefined, [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("buttons.delete"),
        style: "destructive",
        onPress: () => deleteMutation.mutate(heatId),
      },
    ]);
  }

  function openSelectAnimals() {
    navigation.navigate("SelectAnimals", {
      initialSelectedIds: selectedAnimalIds,
      previousScreen: "AnimalHeatForm",
      singleAnimalType: true,
      onlyFemale: true,
    });
  }

  const selectedAnimalsText =
    selectedAnimals.length === 0
      ? t("treatments.no_animals_selected")
      : selectedAnimals.length === 1
        ? selectedAnimals[0].earTag?.number
          ? `${selectedAnimals[0].earTag.number} - ${selectedAnimals[0].name}`
          : selectedAnimals[0].name
        : t("treatments.n_animals_selected", { count: selectedAnimals.length });

  const isBusy =
    createMutation.isPending ||
    createBatchMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;
  const title = isEditMode ? t("breeding.edit_heat") : t("breeding.add_heat");

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
            {isEditMode && (
              <Button
                style={{ flexGrow: 1 }}
                type="danger"
                title={t("buttons.delete")}
                onPress={onDelete}
                disabled={isBusy}
              />
            )}
            <Button
              style={{ flexGrow: 1 }}
              title={t("buttons.save")}
              onPress={handleSubmit(onSubmit)}
              disabled={isBusy}
              loading={
                createMutation.isPending ||
                createBatchMutation.isPending ||
                updateMutation.isPending
              }
            />
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={title} keyboardAware>
        <H2>{title}</H2>
        {picksAnimals && (
          <View style={{ marginTop: theme.spacing.m }}>
            <Subtitle style={{ marginBottom: theme.spacing.xs }}>
              {t("treatments.select_animals")}
            </Subtitle>
            <ListItem
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 8,
                paddingVertical: 12,
              }}
              onPress={openSelectAnimals}
            >
              <ListItem.Content>
                <ListItem.Title
                  style={{
                    color:
                      selectedAnimals.length === 0
                        ? theme.colors.gray2
                        : undefined,
                  }}
                >
                  {selectedAnimalsText}
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          </View>
        )}
        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.xs }}>
          <RHDatePicker
            name="date"
            control={control}
            label={t("breeding.heat_date", {
              heat: animalType
                ? t(`breeding.heat_by_type.${animalType}`)
                : t("breeding.heat"),
            })}
            mode="date"
            clearable={false}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.date?.message}
          />
          <RHSwitch
            style={{ marginVertical: theme.spacing.m }}
            label={t("breeding.mated")}
            control={control}
            name="mated"
          />
          {mated && (
            <>
              <RHSelect
                name="sireId"
                control={control}
                label={t("breeding.sire_optional")}
                data={sireSelectData}
                enableSearch
                clearable
              />
              <RHTextInput
                name="sireName"
                control={control}
                label={t("breeding.sire_external_optional")}
              />
              {conceptionFailed && (
                <Body
                  style={{
                    marginTop: theme.spacing.s,
                    color: theme.colors.gray2,
                  }}
                >
                  {t("breeding.conception_failed")}
                </Body>
              )}
              {expectedBirthDate && (
                <View
                  style={{
                    marginTop: theme.spacing.s,
                    padding: theme.spacing.m,
                    borderRadius: 10,
                    backgroundColor: theme.colors.white,
                    borderLeftWidth: 4,
                    borderLeftColor: theme.colors.primary,
                  }}
                >
                  <Body>
                    {t("breeding.expected_birth")}:{" "}
                    {formatLocalizedDate(expectedBirthDate, i18n.language)}
                  </Body>
                </View>
              )}
            </>
          )}
          <RHTextAreaInput
            name="notes"
            control={control}
            label={t("breeding.notes_optional")}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
