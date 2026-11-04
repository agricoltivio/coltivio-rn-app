import { useApi } from "@/api/api";
import {
  SowingBatchCreateInput,
  SowingPreset,
  SowingPresetCreateInput,
  SowingPresetUpdateInput,
  SowingUpdateInput,
} from "@/api/sowings.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useSowingsQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.sowings.all.queryKey,
    queryFn: () => api.sowings.getSowings(),
    enabled,
  });
  return { sowings: data, ...rest };
}

export function useSowingQuery(sowingId: string) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.sowings.byId(sowingId).queryKey,
    queryFn: () => api.sowings.getSowingById(sowingId),
  });
  return { sowing: data, ...rest };
}

export function useSowingsOfPlotQuery(plotId: string) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.sowings.byPlotId(plotId).queryKey,
    queryFn: () => api.sowings.getPlotSowings(plotId),
  });
  return { sowings: data, ...rest };
}

export function useSowingUnitsQuery() {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.sowings.units.queryKey,
    queryFn: () => api.sowings.getSowingUnits(),
    staleTime: Infinity,
  });
  return { sowingUnits: data, ...rest };
}

export function useCreateSowingsMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (sowings: SowingBatchCreateInput) =>
      api.sowings.createSowings(sowings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sowings._def });
      queryClient.invalidateQueries({ queryKey: queryKeys.fieldEvents._def });
      queryClient.invalidateQueries({ queryKey: queryKeys.seeds._def });
      onSuccess?.();
    },
  });
}

export function useUpdateSowingMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: ({
      sowingId,
      input,
    }: {
      sowingId: string;
      input: SowingUpdateInput;
    }) => api.sowings.updateSowing(sowingId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sowings._def });
      queryClient.invalidateQueries({ queryKey: queryKeys.fieldEvents._def });
      onSuccess?.();
    },
  });
}

export function useDeleteSowingMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (sowingId: string) => api.sowings.deleteSowing(sowingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sowings._def });
      queryClient.invalidateQueries({ queryKey: queryKeys.fieldEvents._def });
      queryClient.invalidateQueries({ queryKey: queryKeys.seeds._def });
      onSuccess?.();
    },
  });
}

export function useSowingPresetsQuery() {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.sowings.presets.queryKey,
    queryFn: () => api.sowings.getSowingPresets(),
  });
  return { sowingPresets: data, ...rest };
}

export function useCreateSowingPresetMutation(
  onSuccess?: (preset: SowingPreset) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (preset: SowingPresetCreateInput) =>
      api.sowings.createSowingPreset(preset),
    onSuccess: (preset) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sowings.presets.queryKey,
      });
      onSuccess?.(preset);
    },
  });
}

export function useUpdateSowingPresetMutation() {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: ({ id, ...preset }: SowingPresetUpdateInput & { id: string }) =>
      api.sowings.updateSowingPreset(id, preset),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sowings.presets.queryKey,
      });
    },
  });
}

export function useDeleteSowingPresetMutation() {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (presetId: string) => api.sowings.deleteSowingPreset(presetId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sowings.presets.queryKey,
      });
    },
  });
}
