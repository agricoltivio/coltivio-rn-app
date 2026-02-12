import { OutdoorSchedule } from "@/api/herds.api";
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
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useDeleteHerdMutation,
  useHerdByIdQuery,
  useUpdateHerdMutation,
  useCreateOutdoorScheduleMutation,
  useUpdateOutdoorScheduleMutation,
  useDeleteOutdoorScheduleMutation,
} from "./herds.hooks";
import { HerdEditScreenProps } from "./navigation/animals-routes";
import { OutdoorScheduleEditModal } from "./OutdoorScheduleEditModal";
import { OutdoorScheduleTimeline } from "./timeline/OutdoorScheduleTimeline";
import { buildSingleHerdTimelineData } from "./timeline/outdoor-timeline-utils";

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
  if (herd && !nameInitialized) {
    setName(herd.name);
    setNameInitialized(true);
  }

  // Animal IDs: use route params (from SelectAnimals) or fall back to herd data
  const selectedAnimalIds =
    route.params?.animalIds ??
    herd?.animals.map((a) => a.id) ??
    [];

  const updateHerdMutation = useUpdateHerdMutation(() => navigation.goBack());
  const deleteHerdMutation = useDeleteHerdMutation(() => navigation.goBack());

  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<OutdoorSchedule | null>(null);

  const createScheduleMutation = useCreateOutdoorScheduleMutation(
    herdId,
    () => setScheduleModalVisible(false),
  );
  const updateScheduleMutation = useUpdateOutdoorScheduleMutation(() =>
    setScheduleModalVisible(false),
  );
  const deleteScheduleMutation = useDeleteOutdoorScheduleMutation(() =>
    setScheduleModalVisible(false),
  );

  // Dirty check: name changed or animals changed from initial
  const initialAnimalIds = herd?.animals.map((a) => a.id) ?? [];
  const animalsChanged =
    selectedAnimalIds.length !== initialAnimalIds.length ||
    selectedAnimalIds.some((id: string) => !initialAnimalIds.includes(id));
  const isDirty = (herd != null && name !== herd.name) || animalsChanged;

  function handleSave() {
    updateHerdMutation.mutate({
      id: herdId,
      name,
      animalIds: selectedAnimalIds,
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

  function openScheduleModal(schedule?: OutdoorSchedule) {
    setEditingSchedule(schedule ?? null);
    setScheduleModalVisible(true);
  }

  function formatScheduleSummary(schedule: OutdoorSchedule): string {
    const start = formatLocalizedDate(new Date(schedule.startDate), locale);
    const end = schedule.endDate
      ? formatLocalizedDate(new Date(schedule.endDate), locale)
      : "–";
    let summary = `${start} - ${end}`;
    if (schedule.recurrence) {
      const freq = t(
        `animals.frequency_types.${schedule.recurrence.frequency}` as const,
      );
      summary += ` (${freq})`;
    }
    return summary;
  }

  const timelineData = useMemo(
    () =>
      herd
        ? buildSingleHerdTimelineData(herd.id, herd.name, herd.outdoorSchedules)
        : null,
    [herd],
  );

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
                  const schedule = herd!.outdoorSchedules.find(
                    (s) => s.id === scheduleId,
                  );
                  if (schedule) openScheduleModal(schedule);
                }}
              />
            </View>
          )}
          {herd.outdoorSchedules.length === 0 && (
            <Subtitle>{t("common.no_entries")}</Subtitle>
          )}
          {herd.outdoorSchedules.length > 0 && (
            <View
              style={{
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
            >
              {herd.outdoorSchedules.map((schedule) => (
                <ListItem
                  key={schedule.id}
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
        schedule={editingSchedule}
        onSave={(input) => {
          if (editingSchedule) {
            updateScheduleMutation.mutate({ id: editingSchedule.id, ...input });
          } else {
            createScheduleMutation.mutate(input);
          }
        }}
        onDelete={(scheduleId) => {
          deleteScheduleMutation.mutate(scheduleId);
        }}
        onClose={() => setScheduleModalVisible(false)}
      />
    </ContentView>
  );
}
