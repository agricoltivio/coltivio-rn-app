import { OutdoorScheduleCreateInput } from "@/api/herds.api";
import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalsQuery } from "./animals.hooks";
import { useCreateHerdMutation, useCreateOutdoorScheduleMutation } from "./herds.hooks";
import { CreateHerdScreenProps } from "./navigation/animals-routes";
import { OutdoorScheduleEditModal } from "./OutdoorScheduleEditModal";
import { OutdoorScheduleTimeline } from "./timeline/OutdoorScheduleTimeline";
import { buildOutdoorTimelineData } from "./timeline/outdoor-timeline-utils";

interface CreateHerdFormValues {
  name: string;
}

// Local schedule with a temp id for list keys
type LocalSchedule = OutdoorScheduleCreateInput & { tempId: string };

export function CreateHerdScreen({
  route,
  navigation,
}: CreateHerdScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const locale = i18n.language;
  const previousScreen = route.params?.previousScreen;
  const { animals } = useAnimalsQuery(true);

  const [selectedAnimalIds, setSelectedAnimalIds] = useState<string[]>([]);

  // Handle returning from SelectAnimals
  const returnedAnimalIds = route.params?.animalIds;
  const [lastProcessedIds, setLastProcessedIds] = useState<string[] | null>(null);
  if (returnedAnimalIds && returnedAnimalIds !== lastProcessedIds) {
    setLastProcessedIds(returnedAnimalIds);
    setSelectedAnimalIds(returnedAnimalIds);
  }

  const selectedAnimals = animals?.filter((a) => selectedAnimalIds.includes(a.id)) ?? [];

  const animalsText = (() => {
    if (selectedAnimals.length === 0) return t("common.no_entries");
    if (selectedAnimals.length === 1) return selectedAnimals[0].name;
    return t("treatments.n_animals_selected", { count: selectedAnimals.length });
  })();

  // Local outdoor schedules state
  const [localSchedules, setLocalSchedules] = useState<LocalSchedule[]>([]);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<LocalSchedule | null>(null);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isDirty },
  } = useForm<CreateHerdFormValues>({
    defaultValues: { name: "" },
  });

  // Build timeline data from local schedules
  const timelineData = useMemo(() => {
    const herdName = getValues("name") || t("animals.new_herd");
    return buildOutdoorTimelineData([
      {
        herdId: "new",
        herdName,
        schedules: localSchedules.map((s) => ({
          id: s.tempId,
          startDate: s.startDate,
          endDate: s.endDate ?? null,
          notes: s.notes ?? null,
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
  }, [localSchedules, getValues, t]);

  // After herd creation, batch-create all outdoor schedules
  const [createdHerdId, setCreatedHerdId] = useState<string | null>(null);
  const [pendingSchedules, setPendingSchedules] = useState<OutdoorScheduleCreateInput[]>([]);

  const createScheduleMutation = useCreateOutdoorScheduleMutation(
    createdHerdId ?? "",
    () => {
      // Pop the next schedule off the pending queue
      setPendingSchedules((prev) => {
        const remaining = prev.slice(1);
        if (remaining.length > 0) {
          // Trigger next creation
          setTimeout(() => createScheduleMutation.mutate(remaining[0]), 0);
        } else {
          // All done, navigate away
          finishNavigation();
        }
        return remaining;
      });
    },
  );

  function finishNavigation() {
    if (previousScreen && createdHerdId) {
      navigation.popTo(
        previousScreen,
        { herdId: createdHerdId },
        { merge: true },
      );
    } else {
      navigation.goBack();
    }
  }

  const createHerdMutation = useCreateHerdMutation(
    (herd) => {
      if (localSchedules.length > 0) {
        // Batch-create schedules sequentially
        const schedulesToCreate: OutdoorScheduleCreateInput[] = localSchedules.map(
          ({ tempId: _, ...rest }) => rest,
        );
        setCreatedHerdId(herd.id);
        setPendingSchedules(schedulesToCreate);
        // Kick off first creation (useCreateOutdoorScheduleMutation needs herdId set first)
        setTimeout(() => createScheduleMutation.mutate(schedulesToCreate[0]), 0);
      } else {
        if (previousScreen) {
          navigation.popTo(
            previousScreen,
            { herdId: herd.id },
            { merge: true },
          );
        } else {
          navigation.goBack();
        }
      }
    },
    (error) => console.error(error),
  );

  function onSubmit(data: CreateHerdFormValues) {
    createHerdMutation.mutate({ name: data.name, animalIds: selectedAnimalIds });
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

  function openScheduleModal(schedule?: LocalSchedule) {
    setEditingSchedule(schedule ?? null);
    setScheduleModalVisible(true);
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || createHerdMutation.isPending}
            loading={createHerdMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("animals.new_herd")}
        keyboardAware
      >
        <H2>{t("animals.new_herd")}</H2>
        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.xs }}>
          <RHTextInput
            name="name"
            control={control}
            label={t("animals.herd_name")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.name?.message}
          />
        </View>

        {/* Animals section — hidden when creating from animal form */}
        {!previousScreen && (
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
                onPress={() =>
                  navigation.navigate("SelectAnimals", {
                    initialSelectedIds: selectedAnimalIds,
                    previousScreen: "CreateHerd",
                  })
                }
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
                    {animalsText}
                  </ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            </View>
          </View>
        )}

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
            <FlatList
              scrollEnabled={false}
              contentContainerStyle={{
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
              data={localSchedules}
              keyExtractor={(item) => item.tempId}
              renderItem={({ item }) => (
                <ListItem
                  style={{ paddingVertical: 5 }}
                  onPress={() => openScheduleModal(item)}
                >
                  <ListItem.Content>
                    <ListItem.Title>
                      {formatScheduleSummary(item)}
                    </ListItem.Title>
                    {item.notes && (
                      <ListItem.Body>{item.notes}</ListItem.Body>
                    )}
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
              )}
            />
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
