import { useApi } from "@/api/api";
import {
  CropProtectionApplicationPreset,
  CropProtectionApplicationPresetCreateInput,
  CropProtectionApplicationPresetUpdateInput,
} from "@/api/cropProtectionApplicationPresets.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCropProtectionApplicationPresetsQuery(enabled = true) {
  const api = useApi();

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropProtectionApplicationPresets.all.queryKey,
    queryFn: () => api.cropProtectionApplicationPresets.getCropProtectionApplicationPresets(),
    enabled,
  });

  return { cropProtectionApplicationPresets: data, ...rest };
}

export function useCropProtectionApplicationPresetByIdQuery(presetId: string, enabled = true) {
  const api = useApi();

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropProtectionApplicationPresets.byId(presetId).queryKey,
    queryFn: () => api.cropProtectionApplicationPresets.getCropProtectionApplicationPresetById(presetId),
    enabled,
  });

  return { cropProtectionApplicationPreset: data, ...rest };
}

export function useCreateCropProtectionApplicationPresetMutation(
  onSuccess?: (preset: CropProtectionApplicationPreset) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();

  return useMutation({
    mutationKey: ["createCropProtectionApplicationPreset"],
    mutationFn: (preset: CropProtectionApplicationPresetCreateInput) => {
      return api.cropProtectionApplicationPresets.createCropProtectionApplicationPreset(preset);
    },
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (preset) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropProtectionApplicationPresets.all.queryKey,
        refetchType: "active",
      });
      queryClient.setQueryData(
        queryKeys.cropProtectionApplicationPresets.byId(preset.id).queryKey,
        () => preset,
      );
      onSuccess?.(preset);
    },
  });
}

export function useUpdateCropProtectionApplicationPresetMutation(
  onSuccess?: (preset: CropProtectionApplicationPreset) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...preset
    }: CropProtectionApplicationPresetUpdateInput & { id: string }) => {
      return api.cropProtectionApplicationPresets.updateCropProtectionApplicationPreset(id, preset);
    },
    onSuccess: (preset) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropProtectionApplicationPresets.all.queryKey,
      });
      queryClient.setQueryData(
        queryKeys.cropProtectionApplicationPresets.byId(preset.id).queryKey,
        () => preset,
      );
      onSuccess?.(preset);
    },
  });
}

export function useDeleteCropProtectionApplicationPresetMutation(onSuccess?: () => void) {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (presetId: string) => {
      await api.cropProtectionApplicationPresets.deleteCropProtectionApplicationPreset(presetId);
      return presetId;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropProtectionApplicationPresets.all.queryKey,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.cropProtectionApplicationPresets.byId(id).queryKey,
      });
      onSuccess?.();
    },
  });
}
