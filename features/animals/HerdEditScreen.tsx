import { OutdoorScheduleCreateInput } from "@/api/herds.api";
import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import { DatePicker } from "@/components/datepicker/DatePicker";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { toLocalDateString } from "@/utils/date";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatOutdoorScheduleSummary } from "./outdoor-schedule-summary";
import { usePermissions } from "@/features/user/users.hooks";
import { Alert, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/text/Text";
import { useTheme } from "styled-components/native";
import {
  useDeleteHerdMutation,
  useEarliestHerdChangeDateQuery,
  useHerdByIdQuery,
  useUpdateHerdMutation,
} from "./herds.hooks";
import { HerdEditScreenProps } from "./navigation/animals-routes";
import { useMeadowsQuery } from "./meadows.hooks";
import { OutdoorScheduleFormResult } from "./OutdoorScheduleFormScreen";
import { OutdoorScheduleTimeline } from "./timeline/OutdoorScheduleTimeline";
import { ChartViewSwitcher } from "@/components/charts/ChartViewSwitcher";
import { buildOutdoorTimelineData } from "./timeline/outdoor-timeline-utils";
import { hasScheduleOverlaps } from "./schedule-overlap-utils";

// Local schedule with a temp id for list keys
type LocalSchedule = OutdoorScheduleCreateInput & { tempId: string };

export function HerdEditScreen({ route, navigation }: HerdEditScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const locale = i18n.language;
  const herdId = route.params?.herdId!;
  const { herd } = useHerdByIdQuery(herdId);

  const [name, setName] = useState("");
  const [nameInitialized, setNameInitialized] = useState(false);

  // Local outdoor schedules state, initialized from herd data
  const [localSchedules, setLocalSchedules] = useState<LocalSchedule[]>([]);
  const [schedulesInitialized, setSchedulesInitialized] = useState(false);

  if (herd && !nameInitialized) {
    setName(herd.name);
    setNameInitialized(true);
  }
  if (herd && !schedulesInitialized) {
    setLocalSchedules(
      herd.outdoorSchedules.map((s) => ({
        startDate: s.startDate,
        endDate: s.endDate ?? null,
        type: s.type,
        meadowId: s.meadowId ?? null,
        notes: s.notes ?? null,
        recurrence: s.recurrence
          ? {
              frequency: s.recurrence.frequency,
              interval: s.recurrence.interval,
              byWeekday: s.recurrence.byWeekday ?? null,
              byMonthDay: s.recurrence.byMonthDay ?? null,
              until: s.recurrence.until ?? null,
              count: s.recurrence.count ?? null,
            }
          : null,
        tempId: s.id,
      })),
    );
    setSchedulesInitialized(true);
  }

  // Animal IDs: use route params (from SelectAnimals) or fall back to herd data
  const selectedAnimalIds =
    route.params?.animalIds ?? herd?.animals.map((a) => a.id) ?? [];

  // Date from which added/removed animals count as (no longer) in the herd
  // Asked for on save, so it isn't overlooked
  const [membershipChangeDate, setMembershipChangeDate] = useState(new Date());
  const [membershipDateModalVisible, setMembershipDateModalVisible] =
    useState(false);
  const membershipDateSheetRef = useRef<BottomSheetModal>(null);
  const membershipDateSnapPoints = useMemo(() => [320], []);
  useEffect(() => {
    if (membershipDateModalVisible) {
      membershipDateSheetRef.current?.present();
    } else {
      membershipDateSheetRef.current?.dismiss();
    }
  }, [membershipDateModalVisible]);

  const updateHerdMutation = useUpdateHerdMutation(
    () => navigation.goBack(),
    // Too early dates are prevented in the date sheet, so any failure is unexpected
    () => Alert.alert(t("common.error"), t("common.unknown_error")),
  );
  const deleteHerdMutation = useDeleteHerdMutation(() => navigation.goBack());

  // Archived included: existing schedules may still point to an archived meadow
  const { meadows } = useMeadowsQuery(true);

  // Handle returning from the outdoor schedule form
  const scheduleResult = route.params?.scheduleResult;
  const [lastScheduleResult, setLastScheduleResult] = useState<
    OutdoorScheduleFormResult | undefined
  >(undefined);
  if (scheduleResult && scheduleResult !== lastScheduleResult) {
    setLastScheduleResult(scheduleResult);
    if (scheduleResult.kind === "delete") {
      setLocalSchedules((prev) =>
        prev.filter((s) => s.tempId !== scheduleResult.scheduleId),
      );
    } else if (scheduleResult.scheduleId) {
      const { scheduleId, input } = scheduleResult;
      setLocalSchedules((prev) =>
        prev.map((s) =>
          s.tempId === scheduleId ? { ...input, tempId: s.tempId } : s,
        ),
      );
    } else {
      const { input } = scheduleResult;
      setLocalSchedules((prev) => [
        ...prev,
        { ...input, tempId: `temp-${Date.now()}` },
      ]);
    }
  }

  // Dirty check: name changed, animals changed, or schedules changed
  const initialAnimalIds = herd?.animals.map((a) => a.id) ?? [];
  const animalsChanged =
    selectedAnimalIds.length !== initialAnimalIds.length ||
    selectedAnimalIds.some((id: string) => !initialAnimalIds.includes(id));

  const schedulesChanged = useMemo(() => {
    if (!herd) return false;
    const initial = herd.outdoorSchedules;
    if (localSchedules.length !== initial.length) return true;
    return localSchedules.some((ls, i) => {
      const orig = initial[i];
      if (!orig) return true;
      // Dates by calendar day: edited schedules send date-only strings, saved ones
      // come back as timestamps
      const sameDay = (
        a: string | null | undefined,
        b: string | null | undefined,
      ) =>
        (a ? toLocalDateString(new Date(a)) : null) ===
        (b ? toLocalDateString(new Date(b)) : null);
      const normalizeRecurrence = (
        recurrence: LocalSchedule["recurrence"] | (typeof orig)["recurrence"],
      ) =>
        recurrence
          ? JSON.stringify({
              frequency: recurrence.frequency,
              interval: recurrence.interval,
              byWeekday: recurrence.byWeekday ?? null,
              byMonthDay: recurrence.byMonthDay ?? null,
              until: recurrence.until
                ? toLocalDateString(new Date(recurrence.until))
                : null,
              count: recurrence.count ?? null,
            })
          : null;
      return (
        !sameDay(ls.startDate, orig.startDate) ||
        !sameDay(ls.endDate, orig.endDate) ||
        ls.type !== orig.type ||
        (ls.meadowId ?? null) !== (orig.meadowId ?? null) ||
        normalizeRecurrence(ls.recurrence) !==
          normalizeRecurrence(orig.recurrence)
      );
    });
  }, [localSchedules, herd]);

  const isDirty =
    (herd != null && name !== herd.name) || animalsChanged || schedulesChanged;

  // Overlap detection
  const hasOverlaps = useMemo(
    () => hasScheduleOverlaps(localSchedules),
    [localSchedules],
  );

  function saveHerd(effectiveDate: Date | null) {
    const outdoorSchedules = localSchedules.map(
      ({ tempId: _, ...rest }) => rest,
    );
    updateHerdMutation.mutate({
      id: herdId,
      name,
      animalIds: selectedAnimalIds,
      outdoorSchedules,
      effectiveDate: effectiveDate ? toLocalDateString(effectiveDate) : null,
    });
  }

  function handleSave() {
    if (hasOverlaps) return;
    // Added or removed animals: first ask since when the change applies
    if (animalsChanged) {
      setMembershipChangeDate(new Date());
      setMembershipDateModalVisible(true);
      return;
    }
    saveHerd(null);
  }

  const addedAnimalCount = selectedAnimalIds.filter(
    (id: string) => !initialAnimalIds.includes(id),
  ).length;
  const removedAnimalCount = initialAnimalIds.filter(
    (id) => !selectedAnimalIds.includes(id),
  ).length;

  // The change can't take effect before any added or removed animal joined its current
  // herd, so the date sheet starts at the latest of those days
  const changedAnimalIds = [
    ...selectedAnimalIds.filter((id: string) => !initialAnimalIds.includes(id)),
    ...initialAnimalIds.filter((id) => !selectedAnimalIds.includes(id)),
  ];
  const {
    earliestEffectiveDate,
    isLoading: earliestEffectiveDateLoading,
    isError: earliestEffectiveDateFailed,
  } = useEarliestHerdChangeDateQuery(
    changedAnimalIds,
    membershipDateModalVisible,
  );
  const membershipChangeDateTooEarly =
    earliestEffectiveDate !== null &&
    toLocalDateString(membershipChangeDate) <
      toLocalDateString(earliestEffectiveDate);

  function handleDelete() {
    Alert.alert(
      t("animals.delete_herd_confirm", { name: herd?.name ?? "" }),
      t("animals.delete_herd_confirm_info"),
      [
        { text: t("buttons.cancel"), style: "cancel" },
        {
          text: t("buttons.delete"),
          style: "destructive",
          onPress: () => deleteHerdMutation.mutate(herdId),
        },
      ],
    );
  }

  function handleSelectAnimals() {
    navigation.navigate("SelectAnimals", {
      initialSelectedIds: selectedAnimalIds,
      previousScreen: "HerdEdit",
    });
  }

  function openScheduleModal(schedule?: LocalSchedule) {
    navigation.navigate("OutdoorScheduleForm", {
      previousScreen: "HerdEdit",
      canDelete: canWrite("animals"),
      schedule: schedule
        ? {
            id: schedule.tempId,
            startDate: schedule.startDate,
            endDate: schedule.endDate ?? null,
            type: schedule.type,
            meadowId: schedule.meadowId,
            notes: schedule.notes ?? null,
            recurrence: schedule.recurrence,
          }
        : undefined,
    });
  }

  // "overview": one row with all stays, "meadows": one row per meadow
  const [timelineView, setTimelineView] = useState<"overview" | "meadows">(
    "overview",
  );

  // Build timeline data from local schedules
  const timelineData = useMemo(() => {
    if (!herd) return null;
    const toTimelineSchedule = (s: LocalSchedule) => ({
      id: s.tempId,
      startDate: s.startDate,
      endDate: s.endDate ?? null,
      notes: s.notes ?? null,
      type: s.type,
      recurrence: s.recurrence
        ? {
            frequency: s.recurrence.frequency,
            interval: s.recurrence.interval,
            byWeekday: s.recurrence.byWeekday ?? null,
            byMonthDay: s.recurrence.byMonthDay ?? null,
            until: s.recurrence.until ?? null,
            count: s.recurrence.count ?? null,
          }
        : null,
    });

    if (timelineView === "overview") {
      return buildOutdoorTimelineData([
        {
          herdId: herd.id,
          herdName: herd.name,
          schedules: localSchedules.map(toTimelineSchedule),
        },
      ]);
    }

    // Group stays by meadow; stays without a meadow get their own row
    const schedulesByMeadow = new Map<string, LocalSchedule[]>();
    for (const schedule of localSchedules) {
      const key = schedule.meadowId ?? "_no_meadow";
      schedulesByMeadow.set(key, [
        ...(schedulesByMeadow.get(key) ?? []),
        schedule,
      ]);
    }
    const data = buildOutdoorTimelineData(
      [...schedulesByMeadow.entries()].map(([meadowId, schedules]) => ({
        herdId: meadowId,
        herdName:
          meadowId === "_no_meadow"
            ? t("animals.meadows.no_meadow")
            : (meadows?.find((m) => m.id === meadowId)?.name ?? "–"),
        schedules: schedules.map(toTimelineSchedule),
      })),
    );
    // Most recently used meadows on top
    const lastDay = (row: (typeof data.herds)[number]) =>
      Math.max(-1, ...row.bars.map((bar) => bar.endDay));
    data.herds.sort((a, b) => lastDay(b) - lastDay(a));
    return data;
  }, [localSchedules, herd, timelineView, meadows, t]);

  const animalsText = (() => {
    if (selectedAnimalIds.length === 0) return t("common.no_entries");
    return t("treatments.n_animals_selected", {
      count: selectedAnimalIds.length,
    });
  })();

  if (!herd) return null;

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          {hasOverlaps && (
            <Text
              style={{
                fontSize: 13,
                color: theme.colors.danger,
                textAlign: "center",
                marginBottom: theme.spacing.s,
              }}
            >
              {t("animals.schedule_overlap_warning")}
            </Text>
          )}
          <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
            {canWrite("animals") && (
              <Button
                style={{ flexGrow: 1 }}
                type="danger"
                title={t("buttons.delete")}
                onPress={handleDelete}
                disabled={
                  updateHerdMutation.isPending || deleteHerdMutation.isPending
                }
                loading={deleteHerdMutation.isPending}
              />
            )}
            {canWrite("animals") && (
              <Button
                style={{ flexGrow: 1 }}
                title={t("buttons.save")}
                onPress={handleSave}
                disabled={
                  !isDirty ||
                  hasOverlaps ||
                  updateHerdMutation.isPending ||
                  deleteHerdMutation.isPending
                }
                loading={updateHerdMutation.isPending}
              />
            )}
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={herd.name}
        keyboardAware
      >
        <H2>{herd.name}</H2>

        {/* Name input */}
        <View style={{ marginTop: theme.spacing.m }}>
          <TextInput
            label={t("animals.herd_name")}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Animals section */}
        <View style={{ marginTop: theme.spacing.l }}>
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: 10,
              padding: theme.spacing.m,
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.primary,
            }}
          >
            <Subtitle style={{ marginBottom: theme.spacing.xs }}>
              {t("animals.animals_in_herd")}
            </Subtitle>
            <ListItem
              style={{
                backgroundColor: theme.colors.gray4,
                borderRadius: 8,
                paddingVertical: 12,
              }}
              onPress={handleSelectAnimals}
            >
              <ListItem.Content>
                <ListItem.Title
                  style={{
                    color:
                      selectedAnimalIds.length === 0
                        ? theme.colors.gray2
                        : undefined,
                  }}
                >
                  {animalsText}
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          </View>
        </View>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("HerdParasiteOverview", { herdId })
          }
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: theme.spacing.xs,
            padding: 12,
            marginTop: theme.spacing.m,
            borderRadius: theme.radii.m,
            borderWidth: 1.5,
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.white,
          }}
        >
          <Ionicons name="bug-outline" size={18} color={theme.colors.primary} />
          <Subtitle
            style={{
              color: theme.colors.primary,
              fontWeight: "600",
              fontSize: 16,
            }}
          >
            {t("parasite_checks.parasite_control")}
          </Subtitle>
        </TouchableOpacity>

        {/* Outdoor schedules section */}
        <View style={{ marginTop: theme.spacing.l }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: theme.spacing.s,
            }}
          >
            <H3 style={{ flex: 1 }}>{t("animals.outdoor_schedules")}</H3>
            <IonIconButton
              icon="add"
              color="black"
              iconSize={25}
              type="accent"
              onPress={() => openScheduleModal()}
            />
          </View>
          {/* Outdoor schedule timeline */}
          {localSchedules.length > 0 && (
            <View style={{ marginBottom: theme.spacing.s }}>
              <ChartViewSwitcher
                value={timelineView}
                onChange={setTimelineView}
                options={[
                  {
                    key: "overview",
                    label: t("animals.timeline_view_overview"),
                  },
                  { key: "meadows", label: t("animals.meadows.meadows") },
                ]}
              />
            </View>
          )}
          {timelineData &&
            timelineData.herds.length > 0 &&
            timelineData.herds.some((row) => row.bars.length > 0) && (
              <View style={{ height: 200, marginBottom: theme.spacing.s }}>
                <OutdoorScheduleTimeline
                  timelineData={timelineData}
                  onBarPress={(scheduleId) => {
                    const schedule = localSchedules.find(
                      (s) => s.tempId === scheduleId,
                    );
                    if (schedule) openScheduleModal(schedule);
                  }}
                />
              </View>
            )}
          {localSchedules.length === 0 && (
            <Subtitle>{t("common.no_entries")}</Subtitle>
          )}
          {localSchedules.length > 0 && (
            <View
              style={{
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
            >
              {localSchedules.map((schedule) => (
                <ListItem
                  key={schedule.tempId}
                  style={{ paddingVertical: 5 }}
                  onPress={() => openScheduleModal(schedule)}
                >
                  <ListItem.Content>
                    <ListItem.Title>
                      {formatOutdoorScheduleSummary(
                        schedule,
                        t,
                        locale,
                        meadows?.find((m) => m.id === schedule.meadowId)?.name,
                      )}
                    </ListItem.Title>
                    {schedule.notes && (
                      <ListItem.Body>{schedule.notes}</ListItem.Body>
                    )}
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Since when do the added/removed animals count? */}
      <BottomSheetModalProvider>
        <BottomDrawerModal
          ref={membershipDateSheetRef}
          snapPoints={membershipDateSnapPoints}
          onClose={() => setMembershipDateModalVisible(false)}
        >
          <H3>{t("animals.herd_changes_apply_from")}</H3>
          <Subtitle style={{ marginTop: theme.spacing.xs }}>
            {t("animals.herd_changes_summary", {
              added: addedAnimalCount,
              removed: removedAnimalCount,
            })}
          </Subtitle>
          <View style={{ marginTop: theme.spacing.m }}>
            <DatePicker
              mode="date"
              locale={locale}
              label={t("animals.herd_changes_apply_from")}
              date={membershipChangeDate}
              clearable={false}
              minimumDate={earliestEffectiveDate ?? undefined}
              error={
                membershipChangeDateTooEarly
                  ? t("animals.herd_membership_date_too_early")
                  : earliestEffectiveDateFailed
                    ? t("common.unknown_error")
                    : undefined
              }
              onConfirm={(date) => {
                if (date) setMembershipChangeDate(date);
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: theme.spacing.s,
              marginTop: theme.spacing.l,
            }}
          >
            <Button
              style={{ flexGrow: 1 }}
              type="accent"
              title={t("buttons.cancel")}
              onPress={() => setMembershipDateModalVisible(false)}
            />
            <Button
              style={{ flexGrow: 1 }}
              title={t("buttons.save")}
              disabled={
                updateHerdMutation.isPending ||
                earliestEffectiveDateLoading ||
                earliestEffectiveDateFailed ||
                membershipChangeDateTooEarly
              }
              loading={
                updateHerdMutation.isPending || earliestEffectiveDateLoading
              }
              onPress={() => {
                setMembershipDateModalVisible(false);
                saveHerd(membershipChangeDate);
              }}
            />
          </View>
        </BottomDrawerModal>
      </BottomSheetModalProvider>
    </ContentView>
  );
}
