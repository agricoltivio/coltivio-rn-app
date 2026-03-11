import { TaskDetail } from "@/api/tasks.api";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, FlatList, Pressable, View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useDeleteTaskMutation,
  useSetTaskStatusMutation,
  useTaskDetailQuery,
  useToggleChecklistItemMutation,
} from "./tasks.hooks";
import { TaskDetailScreenProps } from "./navigation/tasks-routes";

const RECURRENCE_FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Wöchentlich",
  monthly: "Monatlich",
  yearly: "Jährlich",
};


export function TaskDetailScreen({ route, navigation }: TaskDetailScreenProps) {
  const { t } = useTranslation();

  // Build link type label map at render time using typed translation keys
  const linkTypeLabels: Record<TaskDetail["links"][number]["linkType"], string> = {
    animal: t("tasks.link_types.animal"),
    plot: t("tasks.link_types.plot"),
    wiki_entry: t("tasks.link_types.wiki_entry"),
    herd: t("tasks.link_types.herd"),
    contact: t("tasks.link_types.contact"),
    order: t("tasks.link_types.order"),
    treatment: t("tasks.link_types.treatment"),
  };
  const theme = useTheme();
  const { taskId } = route.params;

  const { task, isLoading } = useTaskDetailQuery(taskId);
  const setStatusMutation = useSetTaskStatusMutation(taskId);
  const toggleChecklistMutation = useToggleChecklistItemMutation(taskId);
  const deleteMutation = useDeleteTaskMutation(() => navigation.goBack());

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
          <Pressable onPress={() => navigation.navigate("TaskForm", { taskId })}>
            <Ionicons name="pencil-outline" size={24} color={theme.colors.primary} />
          </Pressable>
          <Pressable onPress={onDeletePress}>
            <Ionicons name="trash-outline" size={24} color={theme.colors.danger} />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, task]);

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
    setStatusMutation.mutate(nextStatus);
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
    <ContentView headerVisible>
      <ScrollView>
        <H2>{task.name}</H2>

        {/* Status toggle */}
        <Pressable
          onPress={onToggleStatus}
          style={{
            marginTop: theme.spacing.m,
            backgroundColor: task.status === "done" ? theme.colors.gray5 : theme.colors.primary,
            borderRadius: theme.radii.m,
            paddingVertical: theme.spacing.s,
            paddingHorizontal: theme.spacing.m,
            alignSelf: "flex-start",
          }}
        >
          <Subtitle style={{ color: task.status === "done" ? theme.colors.text : theme.colors.white }}>
            {task.status === "done" ? t("tasks.reopen") : t("tasks.mark_done")}
          </Subtitle>
        </Pressable>

        {/* Description */}
        {task.description != null && (
          <View style={{ marginTop: theme.spacing.m }}>
            <Subtitle style={{ color: theme.colors.gray2, marginBottom: theme.spacing.xxs }}>
              {t("forms.labels.description")}
            </Subtitle>
            <Subtitle>{task.description}</Subtitle>
          </View>
        )}

        {/* Due date */}
        {task.dueDate != null && (
          <Row label={t("tasks.due_date")}>
            <Subtitle>{new Date(task.dueDate as string).toLocaleDateString()}</Subtitle>
          </Row>
        )}

        {/* Assignee */}
        {task.assignee != null && (
          <Row label={t("tasks.assignee")}>
            <Subtitle>{task.assignee.fullName ?? task.assignee.email}</Subtitle>
          </Row>
        )}

        {/* Labels */}
        {task.labels.length > 0 && (
          <View style={{ marginTop: theme.spacing.m }}>
            <Subtitle style={{ color: theme.colors.gray2, marginBottom: theme.spacing.xs }}>
              {t("tasks.labels")}
            </Subtitle>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
              {task.labels.map((label) => (
                <LabelChip key={label} label={label} theme={theme} />
              ))}
            </View>
          </View>
        )}

        {/* Recurrence */}
        {task.recurrence != null && (
          <Row label={t("tasks.recurrence")}>
            <Subtitle>
              {RECURRENCE_FREQUENCY_LABELS[task.recurrence.frequency] ?? task.recurrence.frequency}
              {task.recurrence.interval > 1 ? `, alle ${task.recurrence.interval}` : ""}
            </Subtitle>
          </Row>
        )}

        {/* Checklist */}
        {task.checklistItems.length > 0 && (
          <View style={{ marginTop: theme.spacing.m }}>
            <Subtitle style={{ color: theme.colors.gray2, marginBottom: theme.spacing.xs }}>
              {t("tasks.checklist")}
            </Subtitle>
            {task.checklistItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={() =>
                  toggleChecklistMutation.mutate({ itemId: item.id, done: !item.done })
                }
                style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.s, paddingVertical: theme.spacing.xs }}
              >
                <Ionicons
                  name={item.done ? "checkbox" : "square-outline"}
                  size={22}
                  color={item.done ? theme.colors.primary : theme.colors.gray3}
                />
                <View>
                  <Subtitle style={item.done ? { textDecorationLine: "line-through", color: theme.colors.gray3 } : undefined}>
                    {item.name}
                  </Subtitle>
                  {item.dueDate != null && (
                    <Subtitle style={{ fontSize: 11, color: theme.colors.gray2 }}>
                      {new Date(item.dueDate as string).toLocaleDateString()}
                    </Subtitle>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Links */}
        {task.links.length > 0 && (
          <View style={{ marginTop: theme.spacing.m }}>
            <Subtitle style={{ color: theme.colors.gray2, marginBottom: theme.spacing.xs }}>
              {t("tasks.links")}
            </Subtitle>
            {task.links.map((link) => (
              <View
                key={link.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: theme.spacing.s,
                  paddingVertical: theme.spacing.xs,
                }}
              >
                <View
                  style={{
                    backgroundColor: theme.colors.gray5,
                    borderRadius: theme.radii.s,
                    paddingHorizontal: theme.spacing.xs,
                    paddingVertical: 2,
                  }}
                >
                  <Subtitle style={{ fontSize: 11 }}>{linkTypeLabels[link.linkType]}</Subtitle>
                </View>
                <Subtitle>{link.displayName ?? link.linkedId}</Subtitle>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ContentView>
  );
}

type RowProps = { label: string; children: React.ReactNode };
function Row({ label, children }: RowProps) {
  const theme = useTheme();
  return (
    <View style={{ marginTop: theme.spacing.m }}>
      <Subtitle style={{ color: theme.colors.gray2, marginBottom: theme.spacing.xxs }}>{label}</Subtitle>
      {children}
    </View>
  );
}

type LabelChipProps = { label: string; theme: ReturnType<typeof useTheme> };
function LabelChip({ label, theme }: LabelChipProps) {
  return (
    <View
      style={{
        backgroundColor: theme.colors.gray5,
        borderRadius: theme.radii.s,
        paddingHorizontal: theme.spacing.s,
        paddingVertical: 2,
      }}
    >
      <Subtitle style={{ fontSize: 12 }}>{label}</Subtitle>
    </View>
  );
}
