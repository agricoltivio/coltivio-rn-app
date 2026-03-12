import { useApi } from "@/api/api";
import { TaskCreateInput, TaskStatus, TaskUpdateInput } from "@/api/tasks.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useTasksQuery(status?: TaskStatus) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.tasks.list(status).queryKey,
    queryFn: () => api.tasks.getTasks(status),
  });
  return { tasks: data ?? [], ...rest };
}

export function useTaskDetailQuery(taskId: string) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.tasks.byId(taskId).queryKey,
    queryFn: () => api.tasks.getTaskById(taskId),
  });
  return { task: data, ...rest };
}

export function useCreateTaskMutation(onSuccess?: (id: string) => void) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (body: TaskCreateInput) => api.tasks.createTask(body),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks._def });
      onSuccess?.(task.id);
    },
  });
}

export function useUpdateTaskMutation(taskId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (body: TaskUpdateInput) => api.tasks.updateTask(taskId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks._def });
      onSuccess?.();
    },
  });
}

export function useDeleteTaskMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (taskId: string) => api.tasks.deleteTask(taskId),
    onSuccess: (_, taskId) => {
      queryClient.removeQueries({ queryKey: queryKeys.tasks.byId(taskId).queryKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks._def });
      onSuccess?.();
    },
  });
}

export function useSetTaskStatusMutation(taskId: string) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (status: TaskStatus) => api.tasks.setTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks._def });
    },
  });
}

export function useToggleChecklistItemMutation(taskId: string) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: ({ itemId, done }: { itemId: string; done: boolean }) =>
      api.tasks.toggleChecklistItem(taskId, itemId, done),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byId(taskId).queryKey });
    },
  });
}

export function useFarmUsersQuery() {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.users.all.queryKey,
    queryFn: () => api.users.getFarmUsers(),
  });
  return { users: data ?? [], ...rest };
}
