import { useApi } from "@/api/api";
import {
  Meadow,
  MeadowCreateInput,
  MeadowUpdateInput,
} from "@/api/meadows.api";
import { queryKeys } from "@/cache/query-keys";
import {
  OUTDOOR_HISTORY_FROM_DATE,
  OUTDOOR_HISTORY_TO_DATE,
} from "./meadow-usage-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Active meadows only, unless includeArchived is set
export function useMeadowsQuery(includeArchived: boolean = false) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: includeArchived
      ? queryKeys.meadows.allIncludingArchived.queryKey
      : queryKeys.meadows.all.queryKey,
    queryFn: () => api.meadows.getMeadows(includeArchived),
  });
  return { meadows: data, ...rest };
}

export function useMeadowByIdQuery(meadowId: string, enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.meadows.byId(meadowId).queryKey,
    queryFn: () => api.meadows.getMeadowById(meadowId),
    enabled,
  });
  return { meadow: data, ...rest };
}

export function useMeadowUsageQuery(meadowId: string, enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.meadows.usage(
      meadowId,
      OUTDOOR_HISTORY_FROM_DATE,
      OUTDOOR_HISTORY_TO_DATE,
    ).queryKey,
    queryFn: () =>
      api.meadows.getMeadowUsage(
        meadowId,
        OUTDOOR_HISTORY_FROM_DATE,
        OUTDOOR_HISTORY_TO_DATE,
      ),
    enabled,
  });
  return { usage: data, ...rest };
}

// Meadow name/size is embedded in herd schedules and the outdoor journal, and
// meadow usage and the journal are derived from herd schedules, so any meadow,
// herd or schedule change invalidates all three
export function useInvalidateOutdoorQueries() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.meadows._def });
    queryClient.invalidateQueries({ queryKey: queryKeys.herds._def });
    queryClient.invalidateQueries({ queryKey: queryKeys.outdoorJournal._def });
  };
}

export function useCreateMeadowMutation(
  onSuccess?: (meadow: Meadow) => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const invalidate = useInvalidateOutdoorQueries();
  return useMutation({
    mutationFn: (input: MeadowCreateInput) => api.meadows.createMeadow(input),
    onSuccess: (meadow) => {
      invalidate();
      onSuccess && onSuccess(meadow);
    },
    onError,
  });
}

export function useUpdateMeadowMutation(
  onSuccess?: (meadow: Meadow) => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const invalidate = useInvalidateOutdoorQueries();
  return useMutation({
    mutationFn: ({ id, ...input }: MeadowUpdateInput & { id: string }) =>
      api.meadows.updateMeadow(id, input),
    onSuccess: (meadow) => {
      invalidate();
      onSuccess && onSuccess(meadow);
    },
    onError,
  });
}

export function useDeleteMeadowMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  const invalidate = useInvalidateOutdoorQueries();
  return useMutation({
    mutationFn: async (meadowId: string) => {
      await api.meadows.deleteMeadow(meadowId);
      return meadowId;
    },
    onSuccess: (meadowId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.meadows.byId(meadowId).queryKey,
      });
      invalidate();
      onSuccess && onSuccess();
    },
    onError,
  });
}
