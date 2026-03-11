import { StackScreenProps } from "@/navigation/rootStackTypes";

export type TasksStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
  TaskForm: { taskId?: string };
};

export type TaskListScreenProps = StackScreenProps<"TaskList">;
export type TaskDetailScreenProps = StackScreenProps<"TaskDetail">;
export type TaskFormScreenProps = StackScreenProps<"TaskForm">;
