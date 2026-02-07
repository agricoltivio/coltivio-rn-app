import { useApi } from "@/api/api";
import {
  CropFamily,
  CropFamilyCreateInput,
  CropFamilyUpdateInput,
} from "@/api/crop-families.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCropFamiliesQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropFamilies.all.queryKey,
    queryFn: () => api.cropFamilies.getCropFamilies(),
    enabled,
  });
  return { cropFamilies: data, ...rest };
}

export function useCropFamilyByIdQuery(
  familyId: string,
  enabled: boolean = true
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropFamilies.byId(familyId).queryKey,
    queryFn: () => api.cropFamilies.getCropFamilyById(familyId),
    enabled,
  });
  return { cropFamily: data, ...rest };
}

export function useCreateCropFamilyMutation(
  onSuccess?: (cropFamily: CropFamily) => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (cropFamily: CropFamilyCreateInput) => {
      return api.cropFamilies.createCropFamily(cropFamily);
    },
    onSuccess: (cropFamily) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropFamilies._def,
      });
      onSuccess && onSuccess(cropFamily);
    },
    onError,
  });
}

export function useUpdateCropFamilyMutation(
  onSuccess?: (cropFamily: CropFamily) => void,
  onError?: (error: Error) => void
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...cropFamily
    }: CropFamilyUpdateInput & { id: string }) => {
      return api.cropFamilies.updateCropFamily(id, cropFamily);
    },
    onSuccess: (cropFamily) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropFamilies._def,
      });
      onSuccess && onSuccess(cropFamily);
    },
    onError,
  });
}

export function useDeleteCropFamilyMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (familyId: string) => {
      await api.cropFamilies.deleteCropFamily(familyId);
      return familyId;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropFamilies._def,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.cropFamilies.byId(id).queryKey,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
}

export function useIsCropFamilyInUseQuery(
  familyId: string,
  enabled: boolean = true
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropFamilies.inUse(familyId).queryKey,
    queryFn: () => api.cropFamilies.isCropFamilyInUse(familyId),
    enabled,
  });
  return { inUse: data, ...rest };
}
