import { useApi } from "@/api/api";
import {
  HerdCreateInput,
  HerdCreateResponse,
  HerdUpdateInput,
  HerdUpdateResponse,
  OutdoorScheduleCreateInput,
  OutdoorScheduleCreateResponse,
  OutdoorScheduleUpdateInput,
  OutdoorScheduleUpdateResponse,
} from "@/api/herds.api";
import { queryKeys } from "@/cache/query-keys";
import { parseDateOnly } from "@/utils/date";
import { useInvalidateOutdoorQueries } from "./meadows.hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useHerdsQuery() {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.herds.all.queryKey,
    queryFn: () => api.herds.getHerds(),
  });
  return { herds: data, ...rest };
}

export function useHerdByIdQuery(herdId: string, enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.herds.byId(herdId).queryKey,
    queryFn: () => api.herds.getHerdById(herdId),
    enabled,
  });
  return { herd: data, ...rest };
}

export function useCreateHerdMutation(
  onSuccess?: (herd: HerdCreateResponse) => void,
  onError?: (error: Error) => void,
) {
  const invalidateOutdoorQueries = useInvalidateOutdoorQueries();
  const api = useApi();
  return useMutation({
    mutationFn: (input: HerdCreateInput) => api.herds.createHerd(input),
    onSuccess: (herd) => {
      invalidateOutdoorQueries();
      onSuccess && onSuccess(herd);
    },
    onError,
  });
}

export function useUpdateHerdMutation(
  onSuccess?: (herd: HerdUpdateResponse) => void,
  onError?: (error: Error) => void,
) {
  const invalidateOutdoorQueries = useInvalidateOutdoorQueries();
  const api = useApi();
  return useMutation({
    mutationFn: ({ id, ...input }: HerdUpdateInput & { id: string }) =>
      api.herds.updateHerd(id, input),
    onSuccess: (herd) => {
      invalidateOutdoorQueries();
      onSuccess && onSuccess(herd);
    },
    onError,
  });
}

export function useDeleteHerdMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const invalidateOutdoorQueries = useInvalidateOutdoorQueries();
  const api = useApi();
  return useMutation({
    mutationFn: async (herdId: string) => {
      await api.herds.deleteHerd(herdId);
      return herdId;
    },
    onSuccess: (id) => {
      invalidateOutdoorQueries();
      queryClient.removeQueries({
        queryKey: queryKeys.herds.byId(id).queryKey,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
}

export function useOutdoorSchedulesQuery(
  herdId: string,
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.herds.outdoorSchedules(herdId).queryKey,
    queryFn: () => api.herds.getOutdoorSchedules(herdId),
    enabled,
  });
  return { outdoorSchedules: data, ...rest };
}

export function useCreateOutdoorScheduleMutation(
  herdId: string,
  onSuccess?: (schedule: OutdoorScheduleCreateResponse) => void,
  onError?: (error: Error) => void,
) {
  const invalidateOutdoorQueries = useInvalidateOutdoorQueries();
  const api = useApi();
  return useMutation({
    mutationFn: (input: OutdoorScheduleCreateInput) =>
      api.herds.createOutdoorSchedule(herdId, input),
    onSuccess: (schedule) => {
      invalidateOutdoorQueries();
      onSuccess && onSuccess(schedule);
    },
    onError,
  });
}

export function useUpdateOutdoorScheduleMutation(
  onSuccess?: (schedule: OutdoorScheduleUpdateResponse) => void,
  onError?: (error: Error) => void,
) {
  const invalidateOutdoorQueries = useInvalidateOutdoorQueries();
  const api = useApi();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: OutdoorScheduleUpdateInput & { id: string }) =>
      api.herds.updateOutdoorSchedule(id, input),
    onSuccess: (schedule) => {
      invalidateOutdoorQueries();
      onSuccess && onSuccess(schedule);
    },
    onError,
  });
}

export function useDeleteOutdoorScheduleMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const invalidateOutdoorQueries = useInvalidateOutdoorQueries();
  const api = useApi();
  return useMutation({
    mutationFn: async (outdoorScheduleId: string) => {
      await api.herds.deleteOutdoorSchedule(outdoorScheduleId);
      return outdoorScheduleId;
    },
    onSuccess: () => {
      invalidateOutdoorQueries();
      onSuccess && onSuccess();
    },
    onError,
  });
}

// First day a herd change can take effect for all these animals together: the latest of
// their days (each animal's current membership start). Earlier effective dates are
// rejected by the API. null: no limit, or nothing to check.
export function useEarliestHerdChangeDateQuery(
  animalIds: string[],
  enabled: boolean = true,
) {
  const api = useApi();
  const sortedAnimalIds = [...animalIds].sort();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.herds.earliestChangeDates(sortedAnimalIds).queryKey,
    queryFn: () => api.herds.getEarliestHerdChangeDates(sortedAnimalIds),
    enabled: enabled && sortedAnimalIds.length > 0,
  });
  const latestDay = (data ?? [])
    .map((entry) => entry.earliestDate?.slice(0, 10) ?? null)
    .filter((day): day is string => day !== null)
    .sort()
    .at(-1);
  return {
    earliestEffectiveDate: latestDay ? parseDateOnly(latestDay) : null,
    ...rest,
  };
}
