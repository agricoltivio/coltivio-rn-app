import { StackScreenProps } from "@/navigation/rootStackTypes";

export type TasksStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
  TaskForm: { taskId?: string };
  TasksOnboarding: undefined;
};

export type TaskListScreenProps = StackScreenProps<"TaskList">;
export type TaskDetailScreenProps = StackScreenProps<"TaskDetail">;
export type TaskFormScreenProps = StackScreenProps<"TaskForm">;
export type TasksOnboardingScreenProps = StackScreenProps<"TasksOnboarding">;
