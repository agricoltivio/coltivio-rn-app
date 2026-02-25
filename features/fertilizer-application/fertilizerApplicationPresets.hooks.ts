import { useApi } from "@/api/api";
import {
  FertilizerApplicationPreset,
  FertilizerApplicationPresetCreateInput,
  FertilizerApplicationPresetUpdateInput,
} from "@/api/fertilizerApplicationPresets.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFertilizerApplicationPresetsQuery(enabled = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.fertilizerApplicationPresets.all.queryKey,
    queryFn: () => api.fertilizerApplicationPresets.getFertilizerApplicationPresets(),
    enabled,
  });
  return { fertilizerApplicationPresets: data, ...rest };
}

export function useCreateFertilizerApplicationPresetMutation(
  onSuccess?: (preset: FertilizerApplicationPreset) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (preset: FertilizerApplicationPresetCreateInput) =>
      api.fertilizerApplicationPresets.createFertilizerApplicationPreset(preset),
    onSuccess: (preset) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fertilizerApplicationPresets.all.queryKey,
      });
      onSuccess?.(preset);
    },
  });
}

export function useUpdateFertilizerApplicationPresetMutation(
  onSuccess?: (preset: FertilizerApplicationPreset) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...preset }: FertilizerApplicationPresetUpdateInput & { id: string }) =>
      api.fertilizerApplicationPresets.updateFertilizerApplicationPreset(id, preset),
    onSuccess: (preset) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fertilizerApplicationPresets.all.queryKey,
      });
      onSuccess?.(preset);
    },
  });
}

export function useDeleteFertilizerApplicationPresetMutation(onSuccess?: () => void) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (presetId: string) => {
      await api.fertilizerApplicationPresets.deleteFertilizerApplicationPreset(presetId);
      return presetId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fertilizerApplicationPresets.all.queryKey,
      });
      onSuccess?.();
    },
  });
}
