import { Task } from "@/api/tasks.api";
import { Card } from "@/components/card/Card";
import { Chip } from "@/components/chips/Chip";
import { getDueDateColor } from "@/features/tasks/task-due-date";
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
              key={task.id}
              task={task}
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

function TaskRow({ task, onPress }: { task: Task; onPress: () => void }) {
  const theme = useTheme();
  const assigneeName = task.assignee?.fullName ?? task.assignee?.email;

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

      {/* Chips right-aligned: assignee first, then due date */}
      <View
        style={{ flexDirection: "row", gap: theme.spacing.xxs, flexShrink: 0 }}
      >
        {assigneeName != null && (
          <Chip small label={assigneeName} outlineColor={theme.colors.blue} />
        )}
        {task.dueDate != null && (
          <Chip
            small
            label={new Date(task.dueDate as string).toLocaleDateString()}
            outlineColor={getDueDateColor(task.dueDate as string, theme)}
          />
        )}
      </View>

      {/* Chevron */}
      <View style={{ width: 30, alignItems: "center" }}>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.gray3} />
      </View>
    </Pressable>
  );
}
