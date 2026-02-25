import { useApi } from "@/api/api";
import {
  HarvestPreset,
  HarvestPresetCreateInput,
  HarvestPresetUpdateInput,
} from "@/api/harvestPresets.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useHarvestPresetsQuery(enabled = true) {
  const api = useApi();

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.harvestPresets.all.queryKey,
    queryFn: () => api.harvestPresets.getHarvestPresets(),
    enabled,
  });

  return { harvestPresets: data, ...rest };
}

export function useHarvestPresetByIdQuery(presetId: string, enabled = true) {
  const api = useApi();

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.harvestPresets.byId(presetId).queryKey,
    queryFn: () => api.harvestPresets.getHarvestPresetById(presetId),
    enabled,
  });

  return { harvestPreset: data, ...rest };
}

export function useCreateHarvestPresetMutation(
  onSuccess?: (preset: HarvestPreset) => void
) {
  const queryClient = useQueryClient();
  const api = useApi();

  return useMutation({
    mutationKey: ["createHarvestPreset"],
    mutationFn: (preset: HarvestPresetCreateInput) => {
      return api.harvestPresets.createHarvestPreset(preset);
    },
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (preset) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.harvestPresets.all.queryKey,
        refetchType: "active",
      });
      queryClient.setQueryData(
        queryKeys.harvestPresets.byId(preset.id).queryKey,
        () => preset
      );
      onSuccess?.(preset);
    },
  });
}

export function useUpdateHarvestPresetMutation(
  onSuccess?: (preset: HarvestPreset) => void
) {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...preset
    }: HarvestPresetUpdateInput & { id: string }) => {
      return api.harvestPresets.updateHarvestPreset(id, preset);
    },
    onSuccess: (preset) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.harvestPresets.all.queryKey,
      });
      queryClient.setQueryData(
        queryKeys.harvestPresets.byId(preset.id).queryKey,
        () => preset
      );
      onSuccess?.(preset);
    },
  });
}

export function useDeleteHarvestPresetMutation(onSuccess?: () => void) {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (presetId: string) => {
      await api.harvestPresets.deleteHarvestPreset(presetId);
      return presetId;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.harvestPresets.all.queryKey,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.harvestPresets.byId(id).queryKey,
      });
      onSuccess?.();
    },
  });
}
