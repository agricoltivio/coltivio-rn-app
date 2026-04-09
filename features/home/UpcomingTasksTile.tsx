import { Task } from "@/api/tasks.api";
import { Card } from "@/components/card/Card";
import { Chip } from "@/components/chips/Chip";
import { Subtitle } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components/native";
import { useTasksQuery } from "../tasks/tasks.hooks";
import { RootStackParamList } from "@/navigation/rootStackTypes";

const MAX_TASKS = 3;

export function UpcomingTasksTile() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { tasks, isLoading } = useTasksQuery("todo");

  const upcomingTasks = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + 3);
    cutoff.setHours(23, 59, 59, 999);
    return tasks
      .filter(
        (task) =>
          task.dueDate != null && new Date(task.dueDate as string) <= cutoff,
      )
      .sort(
        (a, b) =>
          new Date(a.dueDate as string).getTime() -
          new Date(b.dueDate as string).getTime(),
      )
      .slice(0, MAX_TASKS);
  }, [tasks]);

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
          <Subtitle style={{ fontWeight: "700", color: theme.colors.text }}>
            {t("home.upcoming_tasks")}
          </Subtitle>
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
    </Pressable>
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
          <Chip
            small
            label={assigneeName}
            bgColor={theme.colors.blue}
            textColor={theme.colors.white}
          />
        )}
        {task.dueDate != null && (
          <Chip
            small
            label={new Date(task.dueDate as string).toLocaleDateString()}
            bgColor={theme.colors.danger}
            textColor={theme.colors.white}
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
