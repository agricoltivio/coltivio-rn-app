import { Task } from "@/api/tasks.api";
import { Card } from "@/components/card/Card";
import { Chip } from "@/components/chips/Chip";
import { getDueDateColor } from "@/features/tasks/task-due-date";
import { useAssigneeColor } from "@/features/tasks/task-assignee-color";
import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import { Switch } from "@/components/inputs/Switch";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import { useUserQuery } from "@/features/user/users.hooks";
import { H2, Label, Subtitle } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useRef } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Text } from "@/components/text/Text";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components/native";
import { useTasksQuery } from "../tasks/tasks.hooks";
import { RootStackParamList } from "@/navigation/rootStackTypes";

const TASK_COUNT_OPTIONS = [3, 5, 7, 10];

export function UpcomingTasksTile() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { tasks, isLoading } = useTasksQuery("todo");
  const { user } = useUserQuery();
  const { localSettings } = useLocalSettings();
  const settingsSheetRef = useRef<BottomSheetModal>(null);

  const upcomingTasks = useMemo(() => {
    const visibleTasks = tasks.filter((task) => {
      if (task.assignee == null) {
        return localSettings.upcomingTasksShowUnassigned;
      }
      if (task.assignee.id === user?.id) {
        return localSettings.upcomingTasksShowMine;
      }
      return localSettings.upcomingTasksShowOthers;
    });
    const tasksWithDueDate = visibleTasks
      .filter((task) => task.dueDate != null)
      .sort(
        (a, b) =>
          new Date(a.dueDate as string).getTime() -
          new Date(b.dueDate as string).getTime(),
      );
    // Fall back to the first tasks without a due date if none have one
    if (tasksWithDueDate.length === 0) {
      return visibleTasks.slice(0, localSettings.upcomingTasksCount);
    }
    return tasksWithDueDate.slice(0, localSettings.upcomingTasksCount);
  }, [
    tasks,
    user?.id,
    localSettings.upcomingTasksCount,
    localSettings.upcomingTasksShowMine,
    localSettings.upcomingTasksShowUnassigned,
    localSettings.upcomingTasksShowOthers,
  ]);

  // Built from all loaded tasks, not just the visible rows, so a user's initials don't change
  // when the tile settings or the shown tasks change
  const assigneeInitials = useMemo(() => {
    const assigneeNames = new Map<string, string>();
    for (const task of tasks) {
      if (task.assignee) {
        assigneeNames.set(
          task.assignee.id,
          (task.assignee.fullName ?? task.assignee.email).trim(),
        );
      }
    }
    const firstLetterCounts = new Map<string, number>();
    for (const name of assigneeNames.values()) {
      const firstLetter = name.charAt(0).toUpperCase();
      firstLetterCounts.set(
        firstLetter,
        (firstLetterCounts.get(firstLetter) ?? 0) + 1,
      );
    }
    const initialsByAssigneeId = new Map<string, string>();
    for (const [assigneeId, name] of assigneeNames) {
      const firstLetter = name.charAt(0).toUpperCase();
      if (firstLetterCounts.get(firstLetter) === 1) {
        initialsByAssigneeId.set(assigneeId, firstLetter);
        continue;
      }
      // Another assignee starts with the same letter: first + last name initial ("CB"),
      // or the first two letters for single-word names ("Cu")
      const nameParts = name.split(/\s+/);
      const lastNamePart = nameParts[nameParts.length - 1];
      initialsByAssigneeId.set(
        assigneeId,
        nameParts.length > 1
          ? firstLetter + lastNamePart.charAt(0).toUpperCase()
          : firstLetter + name.charAt(1),
      );
    }
    return initialsByAssigneeId;
  }, [tasks]);

  // Every row reserves the widest visible initials chip, so the dates line up even when
  // rows are unassigned or mix one- and two-letter initials
  const assigneeSlotWidth = Math.max(
    0,
    ...upcomingTasks.map((task) => {
      const initials = task.assignee
        ? assigneeInitials.get(task.assignee.id)
        : undefined;
      return initials != null ? getInitialsChipWidth(initials) : 0;
    }),
  );

  return (
    // Pressing the card background navigates to task list
    <Pressable onPress={() => navigation.navigate("TaskList")}>
      <Card style={{ marginTop: theme.spacing.m, padding: 0 }}>
        <View
          style={{
            padding: theme.spacing.m,
            paddingBottom:
              upcomingTasks.length > 0 ? theme.spacing.xs : theme.spacing.m,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Subtitle
              style={{ flex: 1, fontWeight: "700", color: theme.colors.text }}
            >
              {t("home.upcoming_tasks")}
            </Subtitle>
            <Pressable
              onPress={() => settingsSheetRef.current?.present()}
              hitSlop={10}
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color={theme.colors.gray2}
              />
            </Pressable>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator
            style={{ marginBottom: theme.spacing.m }}
            size="small"
          />
        ) : upcomingTasks.length === 0 ? (
          <Subtitle
            style={{
              paddingHorizontal: theme.spacing.m,
              paddingBottom: theme.spacing.m,
              color: theme.colors.gray3,
            }}
          >
            {t("home.no_upcoming_tasks")}
          </Subtitle>
        ) : (
          upcomingTasks.map((task) => (
            <TaskRow
              assigneeSlotWidth={assigneeSlotWidth}
              key={task.id}
              task={task}
              assigneeInitials={
                task.assignee
                  ? assigneeInitials.get(task.assignee.id)
                  : undefined
              }
              onPress={() =>
                navigation.navigate("TaskDetail", { taskId: task.id })
              }
            />
          ))
        )}
      </Card>
      <UpcomingTasksSettingsSheet ref={settingsSheetRef} />
    </Pressable>
  );
}

// Settings are stored locally per device, like the other home screen tile settings
function UpcomingTasksSettingsSheet({
  ref,
}: {
  ref: React.RefObject<BottomSheetModal | null>;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { localSettings, updateLocalSettings } = useLocalSettings();

  return (
    // Portal so the sheet isn't clipped by the home screen card it's declared in
    <Portal>
      <BottomSheetModalProvider>
        <BottomDrawerModal ref={ref}>
          <H2>{t("home.upcoming_tasks_settings.title")}</H2>
          <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.m }}>
            <View style={{ gap: theme.spacing.s }}>
              <Label>{t("home.upcoming_tasks_settings.count")}</Label>
              <View style={{ flexDirection: "row", gap: theme.spacing.xs }}>
                {TASK_COUNT_OPTIONS.map((count) => (
                  <Chip
                    key={count}
                    label={String(count)}
                    active={localSettings.upcomingTasksCount === count}
                    onPress={() =>
                      updateLocalSettings("upcomingTasksCount", count)
                    }
                  />
                ))}
              </View>
            </View>
            <Switch
              label={t("home.upcoming_tasks_settings.show_mine")}
              value={localSettings.upcomingTasksShowMine}
              onChange={(event) =>
                updateLocalSettings(
                  "upcomingTasksShowMine",
                  event.nativeEvent.value,
                )
              }
            />
            <Switch
              label={t("home.upcoming_tasks_settings.show_unassigned")}
              value={localSettings.upcomingTasksShowUnassigned}
              onChange={(event) =>
                updateLocalSettings(
                  "upcomingTasksShowUnassigned",
                  event.nativeEvent.value,
                )
              }
            />
            <Switch
              label={t("home.upcoming_tasks_settings.show_others")}
              value={localSettings.upcomingTasksShowOthers}
              onChange={(event) =>
                updateLocalSettings(
                  "upcomingTasksShowOthers",
                  event.nativeEvent.value,
                )
              }
            />
          </View>
        </BottomDrawerModal>
      </BottomSheetModalProvider>
    </Portal>
  );
}

// Same size for every initial, wide enough for "W" / "WM"
function getInitialsChipWidth(initials: string) {
  return initials.length === 1 ? 26 : 34;
}

// Compact row for the home screen: assignee as initials, due date without the year
function TaskRow({
  task,
  assigneeInitials,
  assigneeSlotWidth,
  onPress,
}: {
  task: Task;
  assigneeInitials?: string;
  assigneeSlotWidth: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  const getAssigneeColor = useAssigneeColor();

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray4,
        paddingLeft: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        gap: theme.spacing.xs,
      }}
    >
      {/* Title shrinks to fit, never wraps */}
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: "500",
          color: theme.colors.text,
        }}
      >
        {task.name}
      </Text>

      {/* Due date right-aligned */}
      <View
        style={{ flexDirection: "row", gap: theme.spacing.xxs, flexShrink: 0 }}
      >
        {task.dueDate != null && (
          <Chip
            small
            label={new Date(task.dueDate as string).toLocaleDateString(
              undefined,
              { day: "2-digit", month: "2-digit", year: "2-digit" },
            )}
            outlineColor={getDueDateColor(task.dueDate as string, theme)}
          />
        )}
      </View>

      {/* Assignee last; the slot stays when unassigned so the date column lines up */}
      {assigneeSlotWidth > 0 && (
        <View style={{ width: assigneeSlotWidth }}>
          {assigneeInitials != null && task.assignee != null && (
            <Chip
              small
              label={assigneeInitials}
              width={getInitialsChipWidth(assigneeInitials)}
              outlineColor={getAssigneeColor(task.assignee.id)}
            />
          )}
        </View>
      )}

      {/* Chevron */}
      <View style={{ width: 30, alignItems: "center" }}>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.gray3} />
      </View>
    </Pressable>
  );
}
