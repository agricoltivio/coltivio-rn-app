import { useApi } from "@/api/api";
import {
  TillagePreset,
  TillagePresetCreateInput,
  TillagePresetUpdateInput,
} from "@/api/tillagePresets.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useTillagePresetsQuery(enabled = true) {
  const api = useApi();

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.tillagePresets.all.queryKey,
    queryFn: () => api.tillagePresets.getTillagePresets(),
    enabled,
  });

  return { tillagePresets: data, ...rest };
}

export function useTillagePresetByIdQuery(presetId: string, enabled = true) {
  const api = useApi();

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.tillagePresets.byId(presetId).queryKey,
    queryFn: () => api.tillagePresets.getTillagePresetById(presetId),
    enabled,
  });

  return { tillagePreset: data, ...rest };
}

export function useCreateTillagePresetMutation(
  onSuccess?: (preset: TillagePreset) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();

  return useMutation({
    mutationKey: ["createTillagePreset"],
    mutationFn: (preset: TillagePresetCreateInput) => {
      return api.tillagePresets.createTillagePreset(preset);
    },
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (preset) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tillagePresets.all.queryKey,
        refetchType: "active",
      });
      queryClient.setQueryData(
        queryKeys.tillagePresets.byId(preset.id).queryKey,
        () => preset,
      );
      onSuccess?.(preset);
    },
  });
}

export function useUpdateTillagePresetMutation(
  onSuccess?: (preset: TillagePreset) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...preset
    }: TillagePresetUpdateInput & { id: string }) => {
      return api.tillagePresets.updateTillagePreset(id, preset);
    },
    onSuccess: (preset) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tillagePresets.all.queryKey,
      });
      queryClient.setQueryData(
        queryKeys.tillagePresets.byId(preset.id).queryKey,
        () => preset,
      );
      onSuccess?.(preset);
    },
  });
}

export function useDeleteTillagePresetMutation(onSuccess?: () => void) {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (presetId: string) => {
      await api.tillagePresets.deleteTillagePreset(presetId);
      return presetId;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tillagePresets.all.queryKey,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.tillagePresets.byId(id).queryKey,
      });
      onSuccess?.();
    },
  });
}
