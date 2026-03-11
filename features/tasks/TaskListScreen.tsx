import { Task } from "@/api/tasks.api";
import { FAB } from "@/components/buttons/FAB";
import { Chip } from "@/components/chips/Chip";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { H2, Subtitle } from "@/theme/Typography";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useTasksQuery } from "./tasks.hooks";
import { TaskListScreenProps } from "./navigation/tasks-routes";
import { TaskStatus } from "@/api/tasks.api";

export function TaskListScreen({ navigation }: TaskListScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [status, setStatus] = useState<TaskStatus>("todo");

  const { tasks, isLoading } = useTasksQuery(status);

  function renderTask({ item }: { item: Task }) {
    const assigneeName = item.assignee?.fullName ?? item.assignee?.email;
    return (
      <ListItem onPress={() => navigation.navigate("TaskDetail", { taskId: item.id })}>
        <ListItem.Content>
          <ListItem.Title>{item.name}</ListItem.Title>
          <View style={{ flexDirection: "row", gap: theme.spacing.xs, flexWrap: "wrap", marginTop: theme.spacing.xxs }}>
            {item.dueDate != null && (
              <Subtitle style={{ color: theme.colors.gray2 }}>
                {new Date(item.dueDate as string).toLocaleDateString()}
              </Subtitle>
            )}
            {assigneeName != null && (
              <Subtitle style={{ color: theme.colors.gray2 }}>{assigneeName}</Subtitle>
            )}
            {item.labels.map((label) => (
              <View
                key={label}
                style={{
                  backgroundColor: theme.colors.gray5,
                  borderRadius: theme.radii.s,
                  paddingHorizontal: theme.spacing.xs,
                  paddingVertical: 2,
                }}
              >
                <Subtitle style={{ fontSize: 11 }}>{label}</Subtitle>
              </View>
            ))}
          </View>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    );
  }

  return (
    <ContentView headerVisible>
      <H2>{t("tasks.tasks")}</H2>

      {/* Status filter chips */}
      <View style={{ flexDirection: "row", gap: theme.spacing.s, marginTop: theme.spacing.m, marginBottom: theme.spacing.s }}>
        {(["todo", "done"] as TaskStatus[]).map((s) => (
          <Chip
            key={s}
            label={s === "todo" ? t("tasks.status_todo") : t("tasks.status_done")}
            active={status === s}
            onPress={() => setStatus(s)}
          />
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={renderTask}
            contentContainerStyle={{ borderTopRightRadius: 10, borderTopLeftRadius: 10, overflow: "hidden" }}
            ListEmptyComponent={
              <ListItem.Body style={{ marginTop: theme.spacing.l }}>
                {t("tasks.no_tasks")}
              </ListItem.Body>
            }
          />
        </View>
      )}

      <FAB
        icon={{ name: "add", color: "white" }}
        onPress={() => navigation.navigate("TaskForm", {})}
      />
    </ContentView>
  );
}
