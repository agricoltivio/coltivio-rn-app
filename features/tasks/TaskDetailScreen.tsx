import { ContentView } from "@/components/containers/ContentView";
import { Chip } from "@/components/chips/Chip";
import { Card } from "@/components/card/Card";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import {
  IonIconButton,
  MaterialCommunityIconButton,
} from "@/components/buttons/IconButton";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView as RNScrollView,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import {
  useDeleteTaskMutation,
  useSetTaskStatusMutation,
  useTaskDetailQuery,
  useToggleChecklistItemMutation,
  useTogglePinMutation,
} from "./tasks.hooks";
import { TaskDetailScreenProps } from "./navigation/tasks-routes";
import { usePermissions } from "@/features/user/users.hooks";

function recurrenceSummary(
  value: { frequency: string; interval: number },
  t: (key: string) => string,
): string {
  const n = value.interval;
  const unitSingular: Record<string, string> = {
    weekly: t("animals.week"),
    monthly: t("animals.month"),
    yearly: t("animals.year"),
  };
  const unitPlural: Record<string, string> = {
    weekly: t("animals.weeks"),
    monthly: t("animals.months"),
    yearly: t("animals.years"),
  };
  const unit =
    n === 1
      ? (unitSingular[value.frequency] ?? value.frequency)
      : (unitPlural[value.frequency] ?? value.frequency);
  return `${t("animals.every")} ${n} ${unit}`;
}

function SectionCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  return (
    <Card style={{ marginTop: theme.spacing.m }}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Subtitle style={{ color: theme.colors.gray2 }}>{label}</Subtitle>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={theme.colors.gray2}
        />
      </Pressable>
      {open && <View style={{ marginTop: theme.spacing.s }}>{children}</View>}
    </Card>
  );
}

export function TaskDetailScreen({ route, navigation }: TaskDetailScreenProps) {
  const { t } = useTranslation();
  const { canWrite } = usePermissions();
  const theme = useTheme();
  const { taskId } = route.params;

  const { task, isLoading } = useTaskDetailQuery(taskId);

  const setStatusMutation = useSetTaskStatusMutation(taskId);
  const toggleChecklistMutation = useToggleChecklistItemMutation(taskId);
  const deleteMutation = useDeleteTaskMutation(() => navigation.goBack());
  const togglePinMutation = useTogglePinMutation(taskId);

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerRight: () => null });
  }, [navigation]);

  function onDeletePress() {
    Alert.alert(t("tasks.delete_confirm"), t("tasks.delete_confirm_message"), [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("buttons.delete"),
        style: "destructive",
        onPress: () => deleteMutation.mutate(taskId),
      },
    ]);
  }

  function onToggleStatus() {
    if (!task) return;
    const nextStatus = task.status === "todo" ? "done" : "todo";
    setStatusMutation.mutate(nextStatus, {
      onSuccess: () => {
        if (nextStatus === "done") navigation.goBack();
      },
    });
  }

  if (isLoading) {
    return (
      <ContentView headerVisible>
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      </ContentView>
    );
  }

  if (!task) {
    return (
      <ContentView headerVisible>
        <Subtitle>{t("common.no_entries")}</Subtitle>
      </ContentView>
    );
  }

  return (
    <>
      <ContentView headerVisible>
        <ScrollView>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.xs,
            }}
          >
            <H2 style={{ flex: 1 }}>{task.name}</H2>
            {canWrite("tasks") && (
              <MaterialCommunityIconButton
                icon={task.pinned ? "pin" : "pin-outline"}
                type={task.pinned ? "primary" : "accent"}
                color={task.pinned ? "white" : theme.colors.primary}
                onPress={() => togglePinMutation.mutate(!task.pinned)}
              />
            )}
            {canWrite("tasks") && (
              <IonIconButton
                icon={
                  task.status === "done"
                    ? "checkmark-circle"
                    : "checkmark-circle-outline"
                }
                type={task.status === "done" ? "success" : "accent"}
                color={task.status === "done" ? "white" : theme.colors.success}
                loading={setStatusMutation.isPending}
                onPress={onToggleStatus}
              />
            )}
            {canWrite("tasks") && (
              <>
                <IonIconButton
                  icon="create-outline"
                  type="accent"
                  color={theme.colors.primary}
                  onPress={() => navigation.navigate("TaskForm", { taskId })}
                />
                <IonIconButton
                  icon="trash-outline"
                  type="danger"
                  onPress={onDeletePress}
                />
              </>
            )}
          </View>

          {/* Status + due date + assignee + labels as chips */}
          {(task.status === "done" ||
            task.dueDate != null ||
            task.assignee != null ||
            task.labels.length > 0) && (
            <RNScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: theme.spacing.s }}
              contentContainerStyle={{
                gap: theme.spacing.xs,
                paddingVertical: theme.spacing.xs,
              }}
            >
              {task.status === "done" && (
                <Chip
                  label={t("tasks.status_done")}
                  bgColor={theme.colors.success}
                  textColor={theme.colors.white}
                />
              )}
              {task.dueDate != null && (
                <Chip
                  label={new Date(task.dueDate as string).toLocaleDateString()}
                  bgColor={theme.colors.danger}
                  textColor={theme.colors.white}
                />
              )}
              {task.assignee != null && (
                <Chip
                  label={task.assignee.fullName ?? task.assignee.email}
                  bgColor={theme.colors.blue}
                  textColor={theme.colors.white}
                />
              )}
              {task.labels.map((label) => (
                <Chip key={label} label={label} />
              ))}
            </RNScrollView>
          )}

          {/* Description */}
          {task.description != null && (
            <SectionCard label={t("forms.labels.description")}>
              <Subtitle>{task.description}</Subtitle>
            </SectionCard>
          )}

          {/* Recurrence */}
          {task.recurrence != null && (
            <SectionCard label={t("tasks.recurrence")}>
              <Subtitle>
                {recurrenceSummary(task.recurrence, (k) => t(k))}
              </Subtitle>
            </SectionCard>
          )}

          {/* Checklist */}
          {task.checklistItems.length > 0 && (
            <SectionCard label={t("tasks.checklist")}>
              {[...task.checklistItems]
                .sort((a, b) => a.position - b.position)
                .map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={
                      canWrite("tasks")
                        ? () =>
                            toggleChecklistMutation.mutate({
                              itemId: item.id,
                              done: !item.done,
                            })
                        : undefined
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: theme.spacing.s,
                      paddingVertical: theme.spacing.xs,
                    }}
                  >
                    <Ionicons
                      name={item.done ? "checkbox" : "square-outline"}
                      size={22}
                      color={
                        item.done ? theme.colors.primary : theme.colors.gray3
                      }
                    />
                    <View>
                      <Subtitle
                        style={
                          item.done
                            ? {
                                textDecorationLine: "line-through",
                                color: theme.colors.gray3,
                              }
                            : undefined
                        }
                      >
                        {item.name}
                      </Subtitle>
                      {item.dueDate != null && (
                        <Subtitle
                          style={{ fontSize: 11, color: theme.colors.gray2 }}
                        >
                          {new Date(
                            item.dueDate as string,
                          ).toLocaleDateString()}
                        </Subtitle>
                      )}
                    </View>
                  </Pressable>
                ))}
            </SectionCard>
          )}
        </ScrollView>
      </ContentView>
    </>
  );
}
