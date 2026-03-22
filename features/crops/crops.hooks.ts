import { useApi } from "@/api/api";
import { Crop, CropCreateInput, CropUpdateInput } from "@/api/crops.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCropsQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.crops.all.queryKey,
    queryFn: () => api.crops.getCrops(),
    enabled,
  });
  return { crops: data, ...rest };
}

export function useCropByIdQuery(cropId: string, enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.crops.byId(cropId).queryKey,
    queryFn: () => api.crops.getCropById(cropId),
    enabled,
  });
  return { crop: data, ...rest };
}

export function useCreateCropMutation(
  onSuccess?: (crop: Crop) => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (crop: CropCreateInput) => {
      return api.crops.createCrop(crop);
    },
    onSuccess: (crop) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.crops._def,
      });
      onSuccess && onSuccess(crop);
    },
    onError,
  });
}

export function useUpdateCropMutation(
  onSuccess?: (crop: Crop) => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...crop }: CropUpdateInput & { id: string }) => {
      return api.crops.updateCrop(id, crop);
    },
    onSuccess: (crop) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.crops._def,
      });
      onSuccess && onSuccess(crop);
    },
    onError,
  });
}

export function useDeleteCropMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cropId: string) => {
      await api.crops.deleteCrop(cropId);
      return cropId;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.crops._def,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.crops.byId(id).queryKey,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
}

export function useIsCropInUseQuery(cropId: string, enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.crops.inUse(cropId).queryKey,
    queryFn: () => api.crops.isCropInUse(cropId),
    enabled,
  });
  return { inUse: data, ...rest };
}
