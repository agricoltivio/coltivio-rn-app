import { useApi } from "@/api/api";
import {
  ParasiteCheck,
  ParasiteCheckCreateInput,
  ParasiteCheckUpdateInput,
} from "@/api/parasite-checks.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useParasiteChecksQuery(herdId?: string) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.parasiteChecks.list(herdId).queryKey,
    queryFn: () => api.parasiteChecks.getParasiteChecks({ herdId }),
  });
  return { checks: data ?? [], ...rest };
}

export function useParasiteCheckByIdQuery(checkId: string, enabled = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.parasiteChecks.byId(checkId).queryKey,
    queryFn: () => api.parasiteChecks.getParasiteCheckById(checkId),
    enabled: enabled && !!checkId,
  });
  return { check: data, ...rest };
}

export function useAnimalParasiteHistoryQuery(animalId: string) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.parasiteChecks.animalHistory(animalId).queryKey,
    queryFn: () => api.parasiteChecks.getAnimalParasiteHistory(animalId),
  });
  return { history: data, ...rest };
}

export function useHerdParasiteOverviewQuery(herdId: string) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.parasiteChecks.herdOverview(herdId).queryKey,
    queryFn: () => api.parasiteChecks.getHerdParasiteOverview(herdId),
  });
  return { checks: data ?? [], ...rest };
}

// Checks show up in lists, histories, overviews and (via follow-up) tasks
function useInvalidateParasiteQueries() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.parasiteChecks._def });
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks._def });
  };
}

export function useCreateParasiteCheckMutation(
  onSuccess?: (check: ParasiteCheck) => void,
) {
  const api = useApi();
  const invalidate = useInvalidateParasiteQueries();
  return useMutation({
    mutationFn: (input: ParasiteCheckCreateInput) =>
      api.parasiteChecks.createParasiteCheck(input),
    onSuccess: (check) => {
      invalidate();
      onSuccess?.(check);
    },
  });
}

export function useUpdateParasiteCheckMutation(
  onSuccess?: (check: ParasiteCheck) => void,
) {
  const api = useApi();
  const invalidate = useInvalidateParasiteQueries();
  return useMutation({
    mutationFn: ({
      checkId,
      input,
    }: {
      checkId: string;
      input: ParasiteCheckUpdateInput;
    }) => api.parasiteChecks.updateParasiteCheck(checkId, input),
    onSuccess: (check) => {
      invalidate();
      onSuccess?.(check);
    },
  });
}

export function useDeleteParasiteCheckMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const api = useApi();
  const invalidate = useInvalidateParasiteQueries();
  return useMutation({
    mutationFn: (checkId: string) =>
      api.parasiteChecks.deleteParasiteCheck(checkId),
    onSuccess: (_, checkId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.parasiteChecks.byId(checkId).queryKey,
      });
      invalidate();
      onSuccess?.();
    },
  });
}
