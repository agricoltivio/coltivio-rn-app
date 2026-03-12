import { Stack } from "@/navigation/stack";
import { DefaultTheme } from "styled-components/native";
import { TaskListScreen } from "../TaskListScreen";
import { TaskDetailScreen } from "../TaskDetailScreen";
import { TaskFormScreen } from "../TaskFormScreen";

export function renderTasksStack(_theme: DefaultTheme, _navigation: unknown) {
  return [
    <Stack.Screen
      key="task-list"
      name="TaskList"
      options={{ title: "" }}
      component={TaskListScreen}
    />,
    <Stack.Screen
      key="task-detail"
      name="TaskDetail"
      options={{ title: "" }}
      component={TaskDetailScreen}
    />,
    <Stack.Screen
      key="task-form"
      name="TaskForm"
      options={{ title: "" }}
      component={TaskFormScreen}
    />,
  ];
}
