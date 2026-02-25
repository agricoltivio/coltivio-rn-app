import { OutdoorScheduleCreateInput } from "@/api/herds.api";
import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useDeleteHerdMutation,
  useHerdByIdQuery,
  useUpdateHerdMutation,
} from "./herds.hooks";
import { HerdEditScreenProps } from "./navigation/animals-routes";
import { OutdoorScheduleEditModal } from "./OutdoorScheduleEditModal";
import { OutdoorScheduleTimeline } from "./timeline/OutdoorScheduleTimeline";
import { buildOutdoorTimelineData } from "./timeline/outdoor-timeline-utils";
import { hasScheduleOverlaps } from "./schedule-overlap-utils";

// Local schedule with a temp id for list keys
type LocalSchedule = OutdoorScheduleCreateInput & { tempId: string };

export function HerdEditScreen({
  route,
  navigation,
}: HerdEditScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
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
        notes: s.notes ?? null,
        recurrence: s.recurrence
          ? {
              frequency: s.recurrence.frequency,
              interval: s.recurrence.interval,
              until: s.recurrence.until ?? null,
            }
          : null,
        tempId: s.id,
      })),
    );
    setSchedulesInitialized(true);
  }

  // Animal IDs: use route params (from SelectAnimals) or fall back to herd data
  const selectedAnimalIds =
    route.params?.animalIds ??
    herd?.animals.map((a) => a.id) ??
    [];

  const updateHerdMutation = useUpdateHerdMutation(() => navigation.goBack());
  const deleteHerdMutation = useDeleteHerdMutation(() => navigation.goBack());

  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<LocalSchedule | null>(null);

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
      return (
        ls.startDate !== orig.startDate ||
        (ls.endDate ?? null) !== (orig.endDate ?? null) ||
        ls.type !== orig.type ||
        JSON.stringify(ls.recurrence) !== JSON.stringify(orig.recurrence)
      );
    });
  }, [localSchedules, herd]);

  const isDirty = (herd != null && name !== herd.name) || animalsChanged || schedulesChanged;

  // Overlap detection
  const hasOverlaps = useMemo(
    () => hasScheduleOverlaps(localSchedules),
    [localSchedules],
  );

  function handleSave() {
    if (hasOverlaps) return;
    const outdoorSchedules = localSchedules.map(
      ({ tempId: _, ...rest }) => rest,
    );
    updateHerdMutation.mutate({
      id: herdId,
      name,
      animalIds: selectedAnimalIds,
      outdoorSchedules,
    });
  }

  function handleDelete() {
    deleteHerdMutation.mutate(herdId);
  }

  function handleSelectAnimals() {
    navigation.navigate("SelectAnimals", {
      initialSelectedIds: selectedAnimalIds,
      previousScreen: "HerdEdit",
    });
  }

  function openScheduleModal(schedule?: LocalSchedule) {
    setEditingSchedule(schedule ?? null);
    setScheduleModalVisible(true);
  }

  function formatScheduleSummary(schedule: LocalSchedule): string {
    const typeLabel = t(`animals.outdoor_types.${schedule.type}` as const);
    const start = formatLocalizedDate(new Date(schedule.startDate), locale);
    const end = schedule.endDate
      ? formatLocalizedDate(new Date(schedule.endDate), locale)
      : "–";
    let summary = `${typeLabel}: ${start} - ${end}`;
    if (schedule.recurrence) {
      const freq = t(
        `animals.frequency_types.${schedule.recurrence.frequency}` as const,
      );
      summary += ` (${freq})`;
    }
    return summary;
  }

  // Build timeline data from local schedules
  const timelineData = useMemo(() => {
    if (!herd) return null;
    return buildOutdoorTimelineData([
      {
        herdId: herd.id,
        herdName: herd.name,
        schedules: localSchedules.map((s) => ({
          id: s.tempId,
          startDate: s.startDate,
          endDate: s.endDate ?? null,
          notes: s.notes ?? null,
          type: s.type,
          recurrence: s.recurrence
            ? {
                frequency: s.recurrence.frequency,
                interval: s.recurrence.interval,
                until: s.recurrence.until ?? null,
              }
            : null,
        })),
      },
    ]);
  }, [localSchedules, herd]);

  const animalsText = (() => {
    if (selectedAnimalIds.length === 0) return t("common.no_entries");
    return t("treatments.n_animals_selected", { count: selectedAnimalIds.length });
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
          <View
            style={{ flexDirection: "row", gap: theme.spacing.s }}
          >
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
          {timelineData && timelineData.herds.length > 0 && timelineData.herds[0].bars.length > 0 && (
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
                      {formatScheduleSummary(schedule)}
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

      <OutdoorScheduleEditModal
        visible={scheduleModalVisible}
        schedule={
          editingSchedule
            ? {
                id: editingSchedule.tempId,
                startDate: editingSchedule.startDate,
                endDate: editingSchedule.endDate ?? null,
                type: editingSchedule.type,
                recurrence: editingSchedule.recurrence,
              }
            : null
        }
        onSave={(input) => {
          if (editingSchedule) {
            setLocalSchedules((prev) =>
              prev.map((s) =>
                s.tempId === editingSchedule.tempId
                  ? { ...input, tempId: s.tempId }
                  : s,
              ),
            );
          } else {
            setLocalSchedules((prev) => [
              ...prev,
              { ...input, tempId: `temp-${Date.now()}` },
            ]);
          }
          setScheduleModalVisible(false);
        }}
        onDelete={(scheduleId) => {
          setLocalSchedules((prev) =>
            prev.filter((s) => s.tempId !== scheduleId),
          );
          setScheduleModalVisible(false);
        }}
        onClose={() => setScheduleModalVisible(false)}
      />
    </ContentView>
  );
}
