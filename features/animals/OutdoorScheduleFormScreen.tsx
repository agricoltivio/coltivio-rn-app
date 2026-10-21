import { toLocalDateString } from "@/utils/date";
import {
  OutdoorScheduleCreateInput,
  OutdoorScheduleType,
} from "@/api/herds.api";
import { IonIconButton } from "@/components/buttons/IconButton";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHSelect } from "@/components/select/RHSelect";
import { H2, Label, Subtitle } from "@/theme/Typography";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useMeadowsQuery } from "./meadows.hooks";
import { OutdoorScheduleFormScreenProps } from "./navigation/animals-routes";

type ScheduleRecurrence = OutdoorScheduleCreateInput["recurrence"];
type Weekday = NonNullable<
  NonNullable<NonNullable<ScheduleRecurrence>["byWeekday"]>[number]
>;

export type ScheduleEditData = {
  id: string;
  startDate: string;
  endDate: string | null;
  type: OutdoorScheduleType;
  meadowId: string | null | undefined;
  // Not editable in the form, carried through so saving keeps it
  notes: string | null;
  recurrence: ScheduleRecurrence;
};

// Handed back to the herd screen via route params when tapping "Fertig" or
// "Entfernen". Nothing is saved here; the herd screen saves it with the herd.
export type OutdoorScheduleFormResult =
  | {
      kind: "save";
      scheduleId: string | null;
      input: OutdoorScheduleCreateInput;
    }
  | { kind: "delete"; scheduleId: string };

// "monthly" is no longer offered, but existing monthly schedules stay editable
type RepeatMode = "none" | "weekly" | "monthly" | "yearly";

type ScheduleFormValues = {
  type: OutdoorScheduleType;
  meadowId: string | null;
  repeat: RepeatMode;
  weekdays: Weekday[];
  startDate: Date;
  endDate: Date | null;
  untilDate: Date | null;
};

const ALL_WEEKDAYS: Weekday[] = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
// getDay() index (0 = Sunday) for each weekday code
const WEEKDAY_JS_INDEX: Record<Weekday, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

export function OutdoorScheduleFormScreen({
  route,
  navigation,
}: OutdoorScheduleFormScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  // Archived included so an existing schedule on an archived meadow keeps it selectable
  const { meadows } = useMeadowsQuery(true);
  const { schedule, canDelete, previousScreen } = route.params;
  const initialRecurrence = schedule?.recurrence ?? null;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    defaultValues: {
      type: schedule?.type ?? "pasture",
      meadowId: schedule?.meadowId ?? null,
      repeat: initialRecurrence?.frequency ?? "none",
      // Weekly schedules saved without weekdays repeat on the start date's weekday
      weekdays:
        initialRecurrence?.byWeekday && initialRecurrence.byWeekday.length > 0
          ? initialRecurrence.byWeekday
          : initialRecurrence?.frequency === "weekly" && schedule
            ? ALL_WEEKDAYS.filter(
                (weekday) =>
                  WEEKDAY_JS_INDEX[weekday] ===
                  new Date(schedule.startDate).getDay(),
              )
            : ALL_WEEKDAYS,
      startDate: schedule ? new Date(schedule.startDate) : new Date(),
      endDate:
        schedule?.endDate && initialRecurrence?.frequency !== "weekly"
          ? new Date(schedule.endDate)
          : null,
      untilDate: initialRecurrence?.until
        ? new Date(initialRecurrence.until)
        : null,
    },
  });
  const repeat = watch("repeat");
  const startDate = watch("startDate");

  // Returning from creating a meadow: select it
  const createdMeadowId = route.params.createdMeadowId;
  useEffect(() => {
    if (createdMeadowId) setValue("meadowId", createdMeadowId);
  }, [createdMeadowId, setValue]);

  // Localized weekday initials, e.g. "M", "D" — 2024-01-01 is a Monday
  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
    return ALL_WEEKDAYS.map((weekday, index) => ({
      weekday,
      label: formatter.format(new Date(2024, 0, 1 + index)),
    }));
  }, [locale]);

  const repeatOptions = [
    { label: t("animals.schedule_repeat.none"), value: "none" },
    { label: t("animals.frequency_types.weekly"), value: "weekly" },
    ...(initialRecurrence?.frequency === "monthly"
      ? [{ label: t("animals.frequency_types.monthly"), value: "monthly" }]
      : []),
    { label: t("animals.frequency_types.yearly"), value: "yearly" },
  ];

  function onSubmit(values: ScheduleFormValues) {
    const until = values.untilDate ? toLocalDateString(values.untilDate) : null;
    // Keep the interval of an edited schedule, the form doesn't change it
    const interval = initialRecurrence?.interval ?? 1;

    let endDate: string | null;
    let recurrence: ScheduleRecurrence;
    if (values.repeat === "weekly") {
      // Each selected weekday is a one-day stay, repeated every week
      endDate = toLocalDateString(values.startDate);
      recurrence = {
        frequency: "weekly",
        interval,
        byWeekday: ALL_WEEKDAYS.filter((weekday) =>
          values.weekdays.includes(weekday),
        ),
        until,
      };
    } else if (values.repeat === "none") {
      endDate = values.endDate ? toLocalDateString(values.endDate) : null;
      recurrence = null;
    } else {
      endDate = values.endDate ? toLocalDateString(values.endDate) : null;
      recurrence = {
        frequency: values.repeat,
        interval,
        byMonthDay: initialRecurrence?.byMonthDay ?? null,
        until,
      };
    }

    returnResult({
      kind: "save",
      scheduleId: schedule?.id ?? null,
      input: {
        startDate: toLocalDateString(values.startDate),
        endDate,
        type: values.type,
        meadowId: values.meadowId,
        notes: schedule?.notes ?? null,
        recurrence,
      },
    });
  }

  function returnResult(scheduleResult: OutdoorScheduleFormResult) {
    navigation.popTo(previousScreen, { scheduleResult }, { merge: true });
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
            {schedule && canDelete && (
              <Button
                style={{ flexGrow: 1 }}
                type="dangerGhost"
                title={t("buttons.remove")}
                onPress={() =>
                  returnResult({ kind: "delete", scheduleId: schedule.id })
                }
              />
            )}
            <Button
              style={{ flexGrow: 1 }}
              title={t("buttons.finish")}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={
          schedule
            ? t("animals.edit_outdoor_schedule")
            : t("animals.new_outdoor_schedule")
        }
      >
        <H2>
          {schedule
            ? t("animals.edit_outdoor_schedule")
            : t("animals.new_outdoor_schedule")}
        </H2>

        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.m }}>
          <RHSelect
            name="type"
            control={control}
            label={t("animals.outdoor_type")}
            data={[
              { label: t("animals.outdoor_types.pasture"), value: "pasture" },
              {
                label: t("animals.outdoor_types.exercise_yard"),
                value: "exercise_yard",
              },
            ]}
          />

          {/* Meadow (optional) */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.xs,
            }}
          >
            <View style={{ flex: 1 }}>
              <RHSelect
                name="meadowId"
                control={control}
                clearable
                label={t("animals.meadows.meadow_optional")}
                placeholder={t("animals.meadows.no_meadow")}
                data={(meadows ?? [])
                  // Archived meadows only when this schedule already uses one
                  .filter(
                    (meadow) =>
                      meadow.archivedAt === null ||
                      meadow.id === schedule?.meadowId,
                  )
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((meadow) => ({ label: meadow.name, value: meadow.id }))}
              />
            </View>
            <IonIconButton
              icon="add"
              color="black"
              iconSize={25}
              type="accent"
              onPress={() =>
                navigation.navigate("PlotsMap", {
                  meadowAction: { type: "create" },
                })
              }
            />
          </View>

          {/* Repeat — decides which date fields follow */}
          <RHSelect
            name="repeat"
            control={control}
            label={t("animals.recurrence")}
            data={repeatOptions}
          />

          {/* Weekly: the herd is out on the selected weekdays of every week */}
          {repeat === "weekly" && (
            <View>
              <Label style={{ marginBottom: theme.spacing.xs }}>
                {t("animals.schedule_repeat.weekdays")}
              </Label>
              <Controller
                control={control}
                name="weekdays"
                rules={{
                  validate: (value) =>
                    value.length > 0 ||
                    t("animals.schedule_repeat.weekdays_required"),
                }}
                render={({ field: { value: selectedWeekdays, onChange } }) => {
                  const value = selectedWeekdays ?? [];
                  return (
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: theme.spacing.xs,
                      }}
                    >
                      {weekdayLabels.map(({ weekday, label }) => {
                        const isSelected = value.includes(weekday);
                        return (
                          <TouchableOpacity
                            key={weekday}
                            onPress={() =>
                              onChange(
                                isSelected
                                  ? value.filter((d) => d !== weekday)
                                  : [...value, weekday],
                              )
                            }
                            style={{
                              width: 40,
                              height: 40,
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 8,
                              borderWidth: 1,
                              backgroundColor: isSelected
                                ? theme.colors.primary
                                : theme.colors.white,
                              borderColor: isSelected
                                ? theme.colors.primary
                                : theme.colors.gray3,
                            }}
                          >
                            <Subtitle
                              style={{
                                fontSize: 15,
                                fontWeight: "600",
                                color: isSelected
                                  ? theme.colors.white
                                  : theme.colors.gray1,
                              }}
                            >
                              {label}
                            </Subtitle>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  );
                }}
              />
              {errors.weekdays?.message && (
                <Subtitle
                  style={{
                    color: theme.colors.danger,
                    marginTop: theme.spacing.xs,
                  }}
                >
                  {errors.weekdays.message}
                </Subtitle>
              )}
            </View>
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

          {/* End date: the stay itself (none) or the yearly season; weekly stays are single days */}
          {repeat !== "weekly" && (
            <RHDatePicker
              name="endDate"
              control={control}
              mode="date"
              label={
                repeat === "none"
                  ? t("animals.end_date_optional")
                  : t("animals.end_date")
              }
              minimumDate={startDate}
              rules={{
                validate: (value) => {
                  if (!value) {
                    return repeat === "none" || t("forms.validation.required");
                  }
                  // Whole days: startDate carries the time of day it was picked
                  return (
                    !(value instanceof Date) ||
                    toLocalDateString(value) >= toLocalDateString(startDate) ||
                    t("animals.end_date_before_start")
                  );
                },
              }}
              error={errors.endDate?.message}
            />
          )}

          {/* Until: when the repetition stops */}
          {repeat !== "none" && (
            <RHDatePicker
              name="untilDate"
              control={control}
              mode="date"
              label={t("animals.schedule_repeat.until_optional")}
              minimumDate={startDate}
              rules={{
                validate: (value) =>
                  !(value instanceof Date) ||
                  toLocalDateString(value) >= toLocalDateString(startDate) ||
                  t("animals.end_date_before_start"),
              }}
              error={errors.untilDate?.message}
            />
          )}
        </View>
      </ScrollView>
    </ContentView>
  );
}
