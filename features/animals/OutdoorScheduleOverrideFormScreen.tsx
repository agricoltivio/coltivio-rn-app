import { ApiError } from "@/api/api";
import { OutdoorScheduleType } from "@/api/herds.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { parseDateOnly, toLocalDateString } from "@/utils/date";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useCreateOutdoorScheduleOverrideMutation,
  useDeleteOutdoorScheduleOverrideMutation,
  useUpdateOutdoorScheduleOverrideMutation,
} from "./herds.hooks";
import { useMeadowsQuery } from "./meadows.hooks";
import { usePermissions } from "@/features/user/users.hooks";
import { OutdoorScheduleOverrideFormScreenProps } from "./navigation/animals-routes";

type OverrideFormValues = {
  type: OutdoorScheduleType;
  meadowId: string | null;
  startDate: Date;
  endDate: Date;
  notes: string;
};

// An override (exception) for a herd: a date range in which it did something else than
// its schedules say, e.g. two days in the stable. Saved right away, unlike schedules,
// which are saved together with the herd.
export function OutdoorScheduleOverrideFormScreen({
  route,
  navigation,
}: OutdoorScheduleOverrideFormScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { herdId, override } = route.params;
  const { canWrite } = usePermissions();
  const canEdit = canWrite("animals");
  // Archived included so an existing override on an archived meadow keeps it selectable
  const { meadows } = useMeadowsQuery(true);

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<OverrideFormValues>({
    defaultValues: {
      type: override?.type ?? "stable",
      meadowId: override?.meadowId ?? null,
      startDate: override ? parseDateOnly(override.startDate) : new Date(),
      endDate: override ? parseDateOnly(override.endDate) : new Date(),
      notes: override?.notes ?? "",
    },
  });
  const type = watch("type");
  const startDate = watch("startDate");

  // Moving the start past the end moves the end along (one day), instead of an error
  useEffect(() => {
    if (
      toLocalDateString(getValues("endDate")) < toLocalDateString(startDate)
    ) {
      setValue("endDate", startDate);
    }
  }, [startDate, getValues, setValue]);

  function onSaveError(error: Error) {
    const message =
      error instanceof ApiError &&
      error.code === "outdoor_schedule_override_overlap"
        ? t("animals.outdoor_override_overlap")
        : t("errors.unexpected_retry");
    Alert.alert(t("common.error"), message);
  }

  const createMutation = useCreateOutdoorScheduleOverrideMutation(
    herdId,
    () => navigation.goBack(),
    onSaveError,
  );
  const updateMutation = useUpdateOutdoorScheduleOverrideMutation(
    () => navigation.goBack(),
    onSaveError,
  );
  const deleteMutation = useDeleteOutdoorScheduleOverrideMutation(() =>
    navigation.goBack(),
  );
  const isSaving = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: OverrideFormValues) {
    const input = {
      type: values.type,
      // Stable time is inside, it has no meadow
      meadowId: values.type === "stable" ? null : values.meadowId,
      startDate: toLocalDateString(values.startDate),
      endDate: toLocalDateString(values.endDate),
      notes: values.notes.trim() || null,
    };
    if (override) {
      updateMutation.mutate({ id: override.id, ...input });
    } else {
      createMutation.mutate(input);
    }
  }

  const title = override
    ? t("animals.edit_outdoor_override")
    : t("animals.new_outdoor_override");

  return (
    <ContentView
      footerComponent={
        canEdit && (
          <BottomActionContainer>
            <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
              {override && (
                <Button
                  style={{ flexGrow: 1 }}
                  type="dangerGhost"
                  title={t("buttons.delete")}
                  loading={deleteMutation.isPending}
                  onPress={() => deleteMutation.mutate(override.id)}
                />
              )}
              <Button
                style={{ flexGrow: 1 }}
                title={t("buttons.save")}
                loading={isSaving}
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </BottomActionContainer>
        )
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={title}>
        <H2>{title}</H2>
        <Subtitle style={{ marginTop: theme.spacing.xs }}>
          {t("animals.outdoor_overrides_hint")}
        </Subtitle>

        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.m }}>
          <RHSelect
            name="type"
            control={control}
            label={t("animals.outdoor_type")}
            data={[
              { label: t("animals.outdoor_types.stable"), value: "stable" },
              { label: t("animals.outdoor_types.pasture"), value: "pasture" },
              {
                label: t("animals.outdoor_types.exercise_yard"),
                value: "exercise_yard",
              },
            ]}
          />

          {type !== "stable" && (
            <RHSelect
              name="meadowId"
              control={control}
              clearable
              label={t("animals.meadows.meadow")}
              optional
              placeholder={t("animals.meadows.no_meadow")}
              data={(meadows ?? [])
                // Archived meadows only when this override already uses one
                .filter(
                  (meadow) =>
                    meadow.archivedAt === null ||
                    meadow.id === override?.meadowId,
                )
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((meadow) => ({ label: meadow.name, value: meadow.id }))}
            />
          )}

          <RHDatePicker
            name="startDate"
            control={control}
            mode="date"
            label={t("animals.start_date")}
            clearable={false}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.startDate?.message}
          />

          {/* Inclusive: the same day as the start for a single day */}
          <RHDatePicker
            name="endDate"
            control={control}
            mode="date"
            label={t("animals.end_date")}
            clearable={false}
            minimumDate={startDate}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
              validate: (value) =>
                !(value instanceof Date) ||
                toLocalDateString(value) >= toLocalDateString(startDate) ||
                t("animals.end_date_before_start"),
            }}
            error={errors.endDate?.message}
          />

          <RHTextAreaInput
            name="notes"
            control={control}
            label={t("animals.notes")}
            optional
            error={errors.notes?.message}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
