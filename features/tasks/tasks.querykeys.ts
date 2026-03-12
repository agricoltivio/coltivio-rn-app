import { createQueryKeys } from "@lukemorales/query-key-factory";
import { TaskStatus } from "@/api/tasks.api";

export const tasksQueryKeys = createQueryKeys("tasks", {
  list: (status?: TaskStatus) => [status],
  byId: (taskId: string) => [taskId],
});
