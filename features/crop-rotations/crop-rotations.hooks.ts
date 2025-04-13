import { useApi } from "@/api/api";
import {
  CropRotation,
  CropRotationCreateInput,
  CropRotationCreateManyInput,
  CropRotationUpdateInput,
} from "@/api/crop-rotations.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCropRotationQuery(rotationId: string) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropRotations.byId(rotationId).queryKey,
    queryFn: () => api.cropRotations.getCropRotationById(rotationId),
  });
  return { cropRotation: data, ...rest };
}

export function useCropRotationsQuery(
  fromDate?: Date,
  toDate?: Date,
  enabled: boolean = true
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropRotations.all(fromDate, toDate).queryKey,
    queryFn: () => api.cropRotations.getCropRotations(fromDate, toDate),
    enabled,
  });
  return { cropRotations: data, ...rest };
}

export function useCreateCropRotationMutation(
  onSuccess?: (cropRotation: CropRotation) => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (input: CropRotationCreateInput) =>
      api.cropRotations.createCropRotation(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropRotations._def,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.plots._def,
      });
      onSuccess && onSuccess(data);
    },
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
  });
}

export function useCreateCropRotationsMutation(
  onSuccess?: (cropRotations: CropRotation[]) => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (input: CropRotationCreateManyInput) =>
      api.cropRotations.createCropRotations(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropRotations._def,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.plots._def,
      });
      onSuccess && onSuccess(data);
    },
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
  });
}

export function useUpdateCropRotationMutation(
  onSuccess?: (cropRotation: CropRotation) => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: ({
      rotationId,
      ...input
    }: CropRotationUpdateInput & { rotationId: string }) =>
      api.cropRotations.updateCropRotation(rotationId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropRotations._def,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.plots._def,
      });
      onSuccess && onSuccess(data);
    },
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
  });
}

export function useDeleteCropRotationMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ rotationId }: { rotationId: string }) => {
      await api.cropRotations.deleteCropRotation(rotationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropRotations._def,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.plots._def,
      });
      onSuccess && onSuccess();
    },
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
  });
}

export function useCropRotationYearsQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropRotations.years.queryKey,
    queryFn: () => api.cropRotations.getCropRotationYears(),
    enabled,
  });
  return { cropRotationYears: data, ...rest };
}
