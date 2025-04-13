import { useApi } from "@/api/api";
import {
  CropProtectionEquipment,
  CropProtectionEquipmentCreateInput,
  CropProtectionEquipmentUpdateInput,
} from "@/api/cropProtectionEquipments.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCropProtectionEquipmentsQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropProtectionEquipments.all.queryKey,
    queryFn: () => api.cropProtectionEquipments.getCropProtectionEquipments(),
    enabled,
  });
  return { cropProtectionEquipments: data, ...rest };
}

export function useCropProtectionEquipmentByIdQuery(
  cropProtectionEquipmentId: string,
  enabled: boolean = true
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropProtectionEquipments.byId(cropProtectionEquipmentId)
      .queryKey,
    queryFn: () =>
      api.cropProtectionEquipments.getCropProtectionEquipmentById(
        cropProtectionEquipmentId
      ),
    enabled,
  });
  return { cropProtectionEquipment: data, ...rest };
}

export function useCreateCropProtectionEquipmentMutation(
  onSuccess?: (cropProtectionEquipment: CropProtectionEquipment) => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (
      cropProtectionEquipment: CropProtectionEquipmentCreateInput
    ) => {
      return api.cropProtectionEquipments.createCropProtectionEquipment(
        cropProtectionEquipment
      );
    },
    onSuccess: (cropProtectionEquipment) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropProtectionEquipments._def,
      });
      onSuccess && onSuccess(cropProtectionEquipment);
    },
    onError,
  });
}

export function useUpdateCropProtectionEquipmentMutation(
  onSuccess?: (cropProtectionEquipment: CropProtectionEquipment) => void,
  onError?: (error: Error) => void
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...cropProtectionEquipment
    }: CropProtectionEquipmentUpdateInput & { id: string }) => {
      return api.cropProtectionEquipments.updateCropProtectionEquipment(
        id,
        cropProtectionEquipment
      );
    },
    onSuccess: (cropProtectionEquipment) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropProtectionEquipments._def,
      });
      onSuccess && onSuccess(cropProtectionEquipment);
    },
    onError,
  });
}

export function useDeleteCropProtectionEquipmentMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cropProtectionEquipmentId: string) => {
      await api.cropProtectionEquipments.deleteCropProtectionEquipment(
        cropProtectionEquipmentId
      );
      return cropProtectionEquipmentId;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropProtectionEquipments._def,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.cropProtectionEquipments.byId(id).queryKey,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
}
