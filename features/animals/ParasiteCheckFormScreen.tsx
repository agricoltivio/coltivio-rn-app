import { ApiError } from "@/api/api";
import {
  ParasiteCheckCreateInput,
  ParasiteCheckMethod,
} from "@/api/parasite-checks.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { DatePicker } from "@/components/datepicker/DatePicker";
import { Switch } from "@/components/inputs/Switch";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { Select } from "@/components/select/Select";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Subtitle } from "@/theme/Typography";
import {
  formatLocalizedDate,
  parseDateOnly,
  toLocalDateString,
} from "@/utils/date";
import { addDays } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalsQuery } from "./animals.hooks";
import { useHerdsQuery } from "./herds.hooks";
import { ParasiteCheckFormScreenProps } from "./navigation/animals-routes";
import { animalDisplayName, FamachaScorePicker } from "./ParasiteCharts";
import {
  filledResults,
  hasDuplicateParasiteType,
  useParasiteSampleDraftStore,
} from "./parasite-sample-draft.store";
import {
  useCreateParasiteCheckMutation,
  useParasiteCheckByIdQuery,
  useParasiteChecksQuery,
  useUpdateParasiteCheckMutation,
} from "./parasite-checks.hooks";
import { useTreatmentsQuery } from "./treatments.hooks";

const DEFAULT_RECHECK_DAYS = 14;

const METHODS: ParasiteCheckMethod[] = ["fecal_egg_count", "famacha"];

type AnimalRow = { animalId: string; famachaScore: number | null };

// Keeps scores of animals that stay selected, adds new animals unscored
function mergeAnimalRows(rows: AnimalRow[], animalIds: string[]): AnimalRow[] {
  const rowsById = new Map(rows.map((row) => [row.animalId, row]));
  return [...new Set(animalIds)].map(
    (animalId) => rowsById.get(animalId) ?? { animalId, famachaScore: null },
  );
}

export function ParasiteCheckFormScreen({
  route,
  navigation,
}: ParasiteCheckFormScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const params = route.params ?? {};
  const checkId = params.checkId;
  const isEditing = !!checkId;

  const { check: existingCheck } = useParasiteCheckByIdQuery(
    checkId ?? "",
    isEditing,
  );
  const { animals } = useAnimalsQuery();
  const { herds } = useHerdsQuery();
  const { treatments } = useTreatmentsQuery();
  const { checks: allChecks } = useParasiteChecksQuery();

  const [method, setMethod] = useState<ParasiteCheckMethod>(
    params.method ?? "fecal_egg_count",
  );
  const [date, setDate] = useState<Date>(new Date());
  const [herdId, setHerdId] = useState<string>(params.herdId ?? "");
  const [animalRows, setAnimalRows] = useState<AnimalRow[]>([]);
  const sampleDraft = useParasiteSampleDraftStore();
  const [notes, setNotes] = useState("");
  const [treatmentId, setTreatmentId] = useState("");
  const [previousCheckId, setPreviousCheckId] = useState(
    params.previousCheckId ?? "",
  );
  const [followUpEnabled, setFollowUpEnabled] = useState(false);
  const [followUpDate, setFollowUpDate] = useState<Date>(
    addDays(new Date(), DEFAULT_RECHECK_DAYS),
  );

  // Re-check date follows the check date until the user picks one
  const followUpDateTouched = useRef(false);
  useEffect(() => {
    if (followUpDateTouched.current) return;
    setFollowUpDate(addDays(date, DEFAULT_RECHECK_DAYS));
  }, [date]);

  // Lab results are edited on separate screens and shared via the draft store
  const resetSampleDraft = useParasiteSampleDraftStore((state) => state.reset);
  useEffect(() => {
    resetSampleDraft();
  }, [resetSampleDraft]);

  // Edit mode: fill the form once the check is loaded
  const initializedFromCheck = useRef(false);
  useEffect(() => {
    if (!existingCheck || initializedFromCheck.current) return;
    initializedFromCheck.current = true;
    setMethod(existingCheck.method);
    setDate(parseDateOnly(existingCheck.date));
    setHerdId(existingCheck.herdId ?? "");
    setAnimalRows(
      existingCheck.animals.map((checkAnimal) => ({
        animalId: checkAnimal.animalId,
        famachaScore: checkAnimal.famachaScore,
      })),
    );
    useParasiteSampleDraftStore.getState().initFromCheck(existingCheck);
    setNotes(existingCheck.notes ?? "");
    setTreatmentId(existingCheck.treatmentId ?? "");
    setPreviousCheckId(existingCheck.previousCheckId ?? "");
  }, [existingCheck]);

  // A re-check repeats its base check: method, herd and animals are taken over
  // and fixed. Animals that died before the re-check date are left out.
  const baseCheck = previousCheckId
    ? allChecks.find((otherCheck) => otherCheck.id === previousCheckId)
    : undefined;
  useEffect(() => {
    // Editing keeps the stored animals; only base checks that fit are offered there
    if (isEditing) return;
    // Wait for the animals, otherwise every animal would count as unavailable
    if (!baseCheck || !animals) return;
    setMethod(baseCheck.method);
    setHerdId(baseCheck.herdId ?? "");
    // Left out: animals that died before the re-check date or left the herd
    const availableAnimalIds = baseCheck.animals
      .map((baseAnimal) => baseAnimal.animalId)
      .filter((animalId) => {
        const animal = animals.find((farmAnimal) => farmAnimal.id === animalId);
        return (
          animal !== undefined &&
          (!animal.dateOfDeath || parseDateOnly(animal.dateOfDeath) > date) &&
          (!baseCheck.herdId || animal.herdId === baseCheck.herdId)
        );
      });
    setAnimalRows((rows) => mergeAnimalRows(rows, availableAnimalIds));
  }, [isEditing, baseCheck, animals, date]);

  // A base check with re-checks keeps its herd and animals (method is fixed when editing anyway)
  const isLockedBaseCheck = (existingCheck?.rechecks.length ?? 0) > 0;

  // Started for a herd (e.g. from the herd overview): prefill its living animals once loaded
  const prefilledFromHerd = useRef(false);
  useEffect(() => {
    if (isEditing || prefilledFromHerd.current) return;
    if (!params.herdId || params.previousCheckId || params.animalIds) return;
    if (!animals) return;
    prefilledFromHerd.current = true;
    const herdAnimalIds = animals
      .filter(
        (animal) => animal.herdId === params.herdId && !animal.dateOfDeath,
      )
      .map((animal) => animal.id);
    setAnimalRows((rows) => mergeAnimalRows(rows, herdAnimalIds));
  }, [
    isEditing,
    params.herdId,
    params.previousCheckId,
    params.animalIds,
    animals,
  ]);

  // Animals picked in the SelectAnimals modal (or passed in for a re-check)
  const animalIdsParam = params.animalIds;
  useEffect(() => {
    if (!animalIdsParam) return;
    setAnimalRows((rows) => mergeAnimalRows(rows, animalIdsParam));
  }, [animalIdsParam]);

  const animalsById = useMemo(
    () => new Map((animals ?? []).map((animal) => [animal.id, animal])),
    [animals],
  );

  function animalLabel(animalId: string) {
    const animal = animalsById.get(animalId);
    if (!animal) return "…";
    return animalDisplayName(animal.name, animal.earTag?.number);
  }

  function handleHerdChange(newHerdId: string) {
    setHerdId(newHerdId);
    if (!newHerdId) return;
    // Prefill with the herd's living animals, can be adjusted afterwards
    const herdAnimalIds = (animals ?? [])
      .filter((animal) => animal.herdId === newHerdId && !animal.dateOfDeath)
      .map((animal) => animal.id);
    setAnimalRows((rows) => mergeAnimalRows(rows, herdAnimalIds));
  }

  function openSelectAnimals() {
    navigation.navigate("SelectAnimals", {
      initialSelectedIds: animalRows.map((row) => row.animalId),
      previousScreen: "ParasiteCheckForm",
    });
  }

  function setScore(animalId: string, famachaScore: number | null) {
    setAnimalRows((rows) =>
      rows.map((row) =>
        row.animalId === animalId ? { ...row, famachaScore } : row,
      ),
    );
  }

  const herdOptions = useMemo(
    () => [
      { label: t("forms.labels.none"), value: "" },
      ...(herds ?? []).map((herd) => ({ label: herd.name, value: herd.id })),
    ],
    [herds, t],
  );

  const treatmentOptions = useMemo(
    () => [
      { label: t("forms.labels.none"), value: "" },
      ...[...(treatments ?? [])]
        .sort(
          (a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
        )
        .map((treatment) => ({
          label: `${treatment.name} · ${formatLocalizedDate(parseDateOnly(treatment.startDate), locale)}`,
          value: treatment.id,
        })),
    ],
    [treatments, t, locale],
  );

  // Only earlier checks can be the "before" of a re-check
  const previousCheckOptions = useMemo(
    () => [
      { label: t("forms.labels.none"), value: "" },
      ...allChecks
        // Re-checks always point to a base check, never to another re-check
        .filter(
          (otherCheck) =>
            otherCheck.id !== checkId &&
            otherCheck.previousCheckId === null &&
            parseDateOnly(otherCheck.date) <= date &&
            // When editing, only base checks the stored check already fits, so
            // nothing gets overwritten or dropped
            (!isEditing ||
              (otherCheck.method === method &&
                (otherCheck.herdId ?? "") === herdId &&
                animalRows.every((row) =>
                  otherCheck.animals.some(
                    (baseAnimal) => baseAnimal.animalId === row.animalId,
                  ),
                ))),
        )
        .map((otherCheck) => ({
          label: [
            t(`parasite_checks.methods.${otherCheck.method}`),
            formatLocalizedDate(parseDateOnly(otherCheck.date), locale),
            otherCheck.herd?.name,
          ]
            .filter(Boolean)
            .join(" · "),
          value: otherCheck.id,
        })),
    ],
    [
      allChecks,
      checkId,
      date,
      isEditing,
      method,
      herdId,
      animalRows,
      t,
      locale,
    ],
  );

  function showError(error: Error) {
    Alert.alert(
      t("common.error"),
      error instanceof ApiError ? error.message : t("common.unknown_error"),
    );
  }

  const createMutation = useCreateParasiteCheckMutation((createdCheck) =>
    navigation.replace("ParasiteCheckDetail", { checkId: createdCheck.id }),
  );
  const updateMutation = useUpdateParasiteCheckMutation(() =>
    navigation.goBack(),
  );
  const isSaving = createMutation.isPending || updateMutation.isPending;

  function onSubmit() {
    // Pooled: one sample for all animals. Individual: one sample per animal with results.
    const checkAnimalIds = animalRows.map((row) => row.animalId);
    const fecSamples =
      method !== "fecal_egg_count"
        ? []
        : sampleDraft.mode === "pooled"
          ? filledResults(sampleDraft.pooledResults).length > 0
            ? [
                {
                  label: sampleDraft.pooledLabel || null,
                  animalIds: checkAnimalIds,
                  results: filledResults(sampleDraft.pooledResults),
                },
              ]
            : []
          : checkAnimalIds.flatMap((animalId) => {
              const results = filledResults(
                sampleDraft.individualResults[animalId],
              );
              return results.length > 0
                ? [{ label: null, animalIds: [animalId], results }]
                : [];
            });

    const body: Omit<ParasiteCheckCreateInput, "followUp"> = {
      date: toLocalDateString(date),
      method,
      herdId: herdId || null,
      // Always sent explicitly so the user's selection wins over herd resolution
      animals: animalRows.map((row) => ({
        animalId: row.animalId,
        famachaScore: method === "famacha" ? row.famachaScore : null,
      })),
      fecSamples,
      labName:
        method === "fecal_egg_count" ? sampleDraft.labName || null : null,
      notes: notes || null,
      treatmentId: treatmentId || null,
      previousCheckId: previousCheckId || null,
    };

    if (isEditing) {
      updateMutation.mutate({ checkId, input: body }, { onError: showError });
    } else {
      createMutation.mutate(
        {
          ...body,
          followUp: followUpEnabled
            ? { dueDate: toLocalDateString(followUpDate) }
            : undefined,
        },
        { onError: showError },
      );
    }
  }

  // Duplicate parasite types in a sample are rejected by the API
  const relevantResultLists =
    method !== "fecal_egg_count"
      ? []
      : sampleDraft.mode === "pooled"
        ? [sampleDraft.pooledResults]
        : animalRows.map((row) => sampleDraft.individualResults[row.animalId]);
  const hasInvalidResults = relevantResultLists.some(hasDuplicateParasiteType);
  const recordedAnimalCount = animalRows.filter(
    (row) =>
      filledResults(sampleDraft.individualResults[row.animalId]).length > 0,
  ).length;
  const resultsSummary =
    sampleDraft.mode === "pooled"
      ? filledResults(sampleDraft.pooledResults).length > 0
        ? t("parasite_checks.results_status_pooled", {
            count: filledResults(sampleDraft.pooledResults).length,
          })
        : t("parasite_checks.results_status_none")
      : recordedAnimalCount > 0
        ? t("parasite_checks.results_status_individual", {
            recorded: recordedAnimalCount,
            total: animalRows.length,
          })
        : t("parasite_checks.results_status_none");

  const canSave = animalRows.length > 0 && !hasInvalidResults && !isSaving;

  const title = isEditing
    ? t("parasite_checks.edit_check")
    : t("parasite_checks.new_check");

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={onSubmit}
            disabled={!canSave}
            loading={isSaving}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={title} keyboardAware>
        <H2>{title}</H2>

        {/* Method toggle */}
        <View
          style={{
            flexDirection: "row",
            marginTop: theme.spacing.m,
            backgroundColor: theme.colors.white,
            borderRadius: 10,
            padding: 4,
          }}
        >
          {METHODS.map((methodOption) => (
            <TouchableOpacity
              key={methodOption}
              disabled={isEditing || !!baseCheck}
              onPress={() => setMethod(methodOption)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: "center",
                backgroundColor:
                  method === methodOption ? theme.colors.primary : undefined,
              }}
            >
              <Subtitle
                style={{
                  color:
                    method === methodOption
                      ? theme.colors.white
                      : theme.colors.gray1,
                  fontWeight: "600",
                }}
              >
                {t(`parasite_checks.methods.${methodOption}`)}
              </Subtitle>
            </TouchableOpacity>
          ))}
        </View>

        {baseCheck && (
          <Subtitle
            style={{
              color: theme.colors.gray2,
              fontSize: 13,
              marginTop: theme.spacing.s,
            }}
          >
            {t("parasite_checks.recheck_locked_info")}
          </Subtitle>
        )}

        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.xs }}>
          <DatePicker
            mode="date"
            locale={locale}
            label={t("forms.labels.date")}
            date={date}
            clearable={false}
            onConfirm={(pickedDate) => pickedDate && setDate(pickedDate)}
          />
          <Select
            label={t("parasite_checks.herd_optional")}
            disabled={!!baseCheck || isLockedBaseCheck}
            value={herdId}
            data={herdOptions}
            onChange={handleHerdChange}
          />
        </View>

        {/* Animals (fixed for re-checks) */}
        {baseCheck || isLockedBaseCheck ? (
          <Subtitle style={{ marginTop: theme.spacing.m }}>
            {t("treatments.n_animals_selected", { count: animalRows.length })}
          </Subtitle>
        ) : (
          <View
            style={{
              marginTop: theme.spacing.m,
              backgroundColor: theme.colors.white,
              borderRadius: 10,
              padding: theme.spacing.m,
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.primary,
            }}
          >
            <Subtitle style={{ marginBottom: theme.spacing.xs }}>
              {t("treatments.select_animals")}
            </Subtitle>
            <ListItem
              style={{
                backgroundColor: theme.colors.gray4,
                borderRadius: 8,
                paddingVertical: 12,
              }}
              onPress={openSelectAnimals}
            >
              <ListItem.Content>
                <ListItem.Title
                  style={{
                    color:
                      animalRows.length === 0 ? theme.colors.gray2 : undefined,
                  }}
                >
                  {animalRows.length === 0
                    ? t("treatments.no_animals_selected")
                    : t("treatments.n_animals_selected", {
                        count: animalRows.length,
                      })}
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          </View>
        )}

        {/* FAMACHA scores per animal */}
        {method === "famacha" && animalRows.length > 0 && (
          <View style={{ marginTop: theme.spacing.l }}>
            <H3>{t("parasite_checks.famacha_scores")}</H3>
            <Subtitle
              style={{ color: theme.colors.gray2, marginTop: 4, fontSize: 13 }}
            >
              {t("parasite_checks.famacha_scores_info")}
            </Subtitle>
            <View
              style={{
                marginTop: theme.spacing.s,
                backgroundColor: theme.colors.white,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {animalRows.map((row, index) => (
                <View
                  key={row.animalId}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: theme.spacing.m,
                    paddingVertical: 10,
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderTopColor: theme.colors.gray4,
                    gap: theme.spacing.s,
                  }}
                >
                  <Subtitle style={{ flex: 1 }} numberOfLines={1}>
                    {animalLabel(row.animalId)}
                  </Subtitle>
                  <FamachaScorePicker
                    value={row.famachaScore}
                    onChange={(score) => setScore(row.animalId, score)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Lab results, recorded on a separate screen */}
        {method === "fecal_egg_count" && (
          <View style={{ marginTop: theme.spacing.l }}>
            <H3>{t("parasite_checks.samples")}</H3>
            <View
              style={{
                marginTop: theme.spacing.s,
                backgroundColor: theme.colors.white,
                borderRadius: 10,
                padding: theme.spacing.m,
                gap: theme.spacing.s,
              }}
            >
              <Subtitle
                style={{
                  color: hasInvalidResults
                    ? theme.colors.danger
                    : theme.colors.gray1,
                }}
              >
                {hasInvalidResults
                  ? t("parasite_checks.duplicate_parasite_type")
                  : resultsSummary}
              </Subtitle>
              <Button
                type="secondary"
                title={t("parasite_checks.record_results")}
                disabled={animalRows.length === 0}
                onPress={() =>
                  navigation.navigate("ParasiteSamples", {
                    animalIds: animalRows.map((row) => row.animalId),
                  })
                }
              />
            </View>
          </View>
        )}

        {/* Context: action taken and comparison */}
        <View style={{ marginTop: theme.spacing.l, gap: theme.spacing.xs }}>
          <Select
            label={t("parasite_checks.treatment_optional")}
            value={treatmentId}
            data={treatmentOptions}
            enableSearch
            onChange={setTreatmentId}
          />
          {/* A base check with re-checks cannot become a re-check itself */}
          {!existingCheck?.rechecks.length && (
            <Select
              label={t("parasite_checks.previous_check_optional")}
              value={previousCheckId}
              data={previousCheckOptions}
              onChange={setPreviousCheckId}
            />
          )}
          <TextInput
            label={t("common.notes")}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        {/* Re-check reminder (create only) */}
        {!isEditing && (
          <View
            style={{
              marginTop: theme.spacing.l,
              marginBottom: theme.spacing.l,
              gap: theme.spacing.xs,
            }}
          >
            <Switch
              label={t("parasite_checks.create_follow_up_task")}
              value={followUpEnabled}
              onChange={(event) => setFollowUpEnabled(event.nativeEvent.value)}
            />
            {followUpEnabled && (
              <DatePicker
                mode="date"
                locale={locale}
                label={t("parasite_checks.follow_up_date")}
                date={followUpDate}
                clearable={false}
                minimumDate={date}
                onConfirm={(pickedDate) => {
                  if (!pickedDate) return;
                  followUpDateTouched.current = true;
                  setFollowUpDate(pickedDate);
                }}
              />
            )}
          </View>
        )}
      </ScrollView>
    </ContentView>
  );
}
