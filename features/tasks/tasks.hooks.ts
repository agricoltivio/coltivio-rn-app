import { useApi } from "@/api/api";
import {
  Task,
  TaskCreateInput,
  TaskDetail,
  TaskStatus,
  TaskUpdateInput,
} from "@/api/tasks.api";
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
      queryClient.removeQueries({
        queryKey: queryKeys.tasks.byId(taskId).queryKey,
      });
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
    onMutate: async () => {
      // Cancel in-flight refetches so they don't overwrite the optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks._def });
      // Snapshot all task list caches for rollback
      const previousData = queryClient.getQueriesData<Task[]>({
        queryKey: queryKeys.tasks._def,
      });
      // Optimistically remove the task from all list caches
      queryClient.setQueriesData<Task[]>(
        { queryKey: queryKeys.tasks._def },
        (old) =>
          Array.isArray(old) ? old.filter((t) => t.id !== taskId) : old,
      );
      return { previousData };
    },
    onError: (_err, _vars, context) => {
      context?.previousData.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks._def });
    },
  });
}

export function useTogglePinMutation(taskId: string) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (pinned: boolean) => api.tasks.updateTask(taskId, { pinned }),
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
    onMutate: async ({ itemId, done }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.tasks.byId(taskId).queryKey,
      });
      const previousTask = queryClient.getQueryData<TaskDetail>(
        queryKeys.tasks.byId(taskId).queryKey,
      );
      queryClient.setQueryData<TaskDetail>(
        queryKeys.tasks.byId(taskId).queryKey,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            checklistItems: old.checklistItems.map((item) =>
              item.id === itemId ? { ...item, done } : item,
            ),
          };
        },
      );
      return { previousTask };
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byId(taskId).queryKey,
      });
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(
          queryKeys.tasks.byId(taskId).queryKey,
          context.previousTask,
        );
      }
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
