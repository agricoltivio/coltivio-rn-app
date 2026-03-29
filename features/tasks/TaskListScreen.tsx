import { Task } from "@/api/tasks.api";
import { FAB } from "@/components/buttons/FAB";
import { Chip } from "@/components/chips/Chip";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { H2 } from "@/theme/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Fuse from "fuse.js";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  ScrollView as RNScrollView,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { useTasksQuery } from "./tasks.hooks";
import { TaskListScreenProps } from "./navigation/tasks-routes";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import { useEffect } from "react";
import { TaskStatus } from "@/api/tasks.api";

export function TaskListScreen({ navigation }: TaskListScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [search, setSearch] = useState("");
  const [activeLabels, setActiveLabels] = useState<Set<string>>(new Set());
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [activeAssignees, setActiveAssignees] = useState<Set<string>>(
    new Set(),
  );

  const { localSettings } = useLocalSettings();
  const { tasks, isLoading } = useTasksQuery(status);

  useEffect(() => {
    if (!localSettings.tasksOnboardingCompleted) {
      navigation.navigate("TasksOnboarding");
    }
  }, []);

  const now = new Date();

  // Collect all unique labels across loaded tasks
  const availableLabels = useMemo(() => {
    const seen = new Set<string>();
    for (const task of tasks ?? []) {
      for (const label of task.labels) seen.add(label);
    }
    return Array.from(seen).sort();
  }, [tasks]);

  // Collect unique assignees (by id) across loaded tasks
  const availableAssignees = useMemo(() => {
    const seen = new Map<string, string>();
    for (const task of tasks ?? []) {
      if (task.assignee) {
        seen.set(
          task.assignee.id,
          task.assignee.fullName ?? task.assignee.email,
        );
      }
    }
    return Array.from(seen.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks]);

  const fuse = useMemo(
    () =>
      new Fuse(tasks ?? [], {
        keys: ["name", "description", "labels"],
        threshold: 0.35,
      }),
    [tasks],
  );

  const filteredTasks = useMemo(() => {
    let result = search
      ? fuse.search(search).map((r) => r.item)
      : (tasks ?? []);
    if (overdueOnly) {
      result = result.filter(
        (t) => t.dueDate != null && new Date(t.dueDate as string) < now,
      );
    }
    if (activeAssignees.size > 0) {
      result = result.filter(
        (t) => t.assignee != null && activeAssignees.has(t.assignee.id),
      );
    }
    if (activeLabels.size > 0) {
      result = result.filter((t) => t.labels.some((l) => activeLabels.has(l)));
    }
    // Pinned tasks float to the top, then sort by due date ascending, then alphabetically
    return [...result].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (a.dueDate != null && b.dueDate != null) {
        return (
          new Date(a.dueDate as string).getTime() -
          new Date(b.dueDate as string).getTime()
        );
      }
      if (a.dueDate != null) return -1;
      if (b.dueDate != null) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [search, fuse, tasks, activeLabels, activeAssignees, overdueOnly]);

  function toggleLabel(label: string) {
    setActiveLabels((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  function renderTask({ item }: { item: Task }) {
    const assigneeName = item.assignee?.fullName ?? item.assignee?.email;
    const hasChips =
      item.dueDate != null || assigneeName != null || item.labels.length > 0;
    return (
      <ListItem
        onPress={() => navigation.navigate("TaskDetail", { taskId: item.id })}
      >
        <ListItem.Content>
          <ListItem.Title>{item.name}</ListItem.Title>
          {hasChips && (
            <View
              style={{
                flexDirection: "row",
                gap: theme.spacing.xs,
                marginTop: theme.spacing.xs,
                overflow: "hidden",
              }}
            >
              {item.dueDate != null && (
                <Chip
                  small
                  label={new Date(item.dueDate as string).toLocaleDateString()}
                  bgColor={theme.colors.danger}
                  textColor={theme.colors.white}
                />
              )}
              {assigneeName != null && (
                <Chip
                  small
                  label={assigneeName}
                  bgColor={theme.colors.blue}
                  textColor={theme.colors.white}
                />
              )}
              {item.labels.slice(0, 2).map((label) => (
                <Chip small key={label} label={label} />
              ))}
              {item.labels.length > 2 && (
                <Chip small label={`+${item.labels.length - 2}`} />
              )}
            </View>
          )}
        </ListItem.Content>
        {item.pinned && (
          <View style={{ justifyContent: "center", alignItems: "center", width: 28 }}>
            <MaterialCommunityIcons
              name="pin"
              size={16}
              color={theme.colors.gray3}
            />
          </View>
        )}
        <ListItem.Chevron />
      </ListItem>
    );
  }

  return (
    <ContentView headerVisible>
      <H2>{t("tasks.tasks")}</H2>

      <View style={{ marginTop: theme.spacing.m }}>
        <TextInput
          hideLabel
          placeholder={t("forms.placeholders.search")}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Status + label filter chips */}
      <RNScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: theme.spacing.s, flexGrow: 0 }}
        contentContainerStyle={{
          gap: theme.spacing.xs,
          paddingVertical: theme.spacing.xs,
        }}
      >
        {(["todo", "done"] as TaskStatus[]).map((s) => (
          <Chip
            key={s}
            label={
              s === "todo" ? t("tasks.status_todo") : t("tasks.status_done")
            }
            active={status === s}
            onPress={() => setStatus(s)}
          />
        ))}
        <Chip
          label={t("tasks.overdue")}
          active={overdueOnly}
          onPress={() => setOverdueOnly((prev) => !prev)}
        />
        {availableAssignees.map(({ id, name }) => (
          <Chip
            key={id}
            label={name}
            active={activeAssignees.has(id)}
            bgColor={activeAssignees.has(id) ? theme.colors.blue : undefined}
            textColor={activeAssignees.has(id) ? theme.colors.white : undefined}
            onPress={() =>
              setActiveAssignees((prev) => {
                const next = new Set(prev);
                next.has(id) ? next.delete(id) : next.add(id);
                return next;
              })
            }
          />
        ))}
        {availableLabels.map((label) => (
          <Chip
            key={label}
            label={label}
            active={activeLabels.has(label)}
            onPress={() => toggleLabel(label)}
          />
        ))}
      </RNScrollView>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      ) : (
        <View style={{ flex: 1, marginTop: theme.spacing.m }}>
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            renderItem={renderTask}
            contentContainerStyle={{
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
              overflow: "hidden",
            }}
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
