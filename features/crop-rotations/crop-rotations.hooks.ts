import { useApi } from "@/api/api";
import {
  CropRotation,
  CropRotationCreateInput,
  CropRotationCreateResult,
  CropRotationCreateManyByCropInput,
  CropRotationBatchByCropResult,
  CropRotationCreateManyByPlotInput,
  CropRotationBatchByPlotResult,
  CropRotationUpdateInput,
  CropRotationUpdateResult,
  CropRotationPlanInput,
  CropRotationPlanResult,
  DraftPlan,
  DraftPlanSummary,
  DraftPlanCreateInput,
  DraftPlanUpdateInput,
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
  enabled: boolean = true,
  options: { expand?: boolean; withRecurrences?: boolean } = {},
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropRotations.all(fromDate, toDate).queryKey,
    queryFn: () =>
      api.cropRotations.getCropRotations(fromDate, toDate, options),
    enabled,
  });
  return { cropRotations: data, ...rest };
}

export function useCreateCropRotationMutation(
  onSuccess?: (cropRotation: CropRotationCreateResult) => void,
  onError?: (error: Error) => void,
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

export function useCreateCropRotationsByCropMutation(
  onSuccess?: (cropRotations: CropRotationBatchByCropResult[]) => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (input: CropRotationCreateManyByCropInput) =>
      api.cropRotations.createCropRotationsByCrop(input),
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

export function useCreateCropRotationsByPlotMutation(
  onSuccess?: (cropRotations: CropRotationBatchByPlotResult[]) => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (input: CropRotationCreateManyByPlotInput) =>
      api.cropRotations.createCropRotationsByPlot(input),
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

export function useCropRotationsByPlotIdsQuery(
  plotIds: string[],
  fromDate: Date,
  toDate: Date,
  options: {
    onlyCurrent?: boolean;
    expand?: boolean;
    includeRecurrence?: boolean;
  } = {},
  enabled: boolean = true,
) {
  const api = useApi();
  const {
    onlyCurrent = false,
    expand = true,
    includeRecurrence = false,
  } = options;
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropRotations.byPlotIds(
      plotIds,
      onlyCurrent,
      expand,
      includeRecurrence,
    ).queryKey,
    queryFn: () =>
      api.cropRotations.getCropRotationsByPlotIds(plotIds, fromDate, toDate, {
        onlyCurrent,
        expand,
        includeRecurrence,
      }),
    enabled: enabled && plotIds.length > 0,
  });
  return { plotCropRotations: data, ...rest };
}

export function useUpdateCropRotationMutation(
  onSuccess?: (cropRotation: CropRotationUpdateResult) => void,
  onError?: (error: Error) => void,
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
  onError?: (error: Error) => void,
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

export function usePlanCropRotationsMutation(
  onSuccess?: (rotations: CropRotationPlanResult) => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (input: CropRotationPlanInput) =>
      api.cropRotations.planCropRotations(input),
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

export function useDraftPlansQuery() {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropRotations.draftPlans.queryKey,
    queryFn: () => api.cropRotations.getDraftPlans(),
  });
  return { draftPlans: data as DraftPlanSummary[] | undefined, ...rest };
}

export function useDraftPlanQuery(
  draftPlanId: string,
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropRotations.draftPlanById(draftPlanId).queryKey,
    queryFn: () => api.cropRotations.getDraftPlan(draftPlanId),
    enabled,
  });
  return { draftPlan: data as DraftPlan | undefined, ...rest };
}

export function useCreateDraftPlanMutation(
  onSuccess?: (plan: DraftPlan) => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (input: DraftPlanCreateInput) =>
      api.cropRotations.createDraftPlan(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropRotations.draftPlans.queryKey,
      });
      onSuccess && onSuccess(data);
    },
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
  });
}

export function useUpdateDraftPlanMutation(
  onSuccess?: (plan: DraftPlan) => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: ({
      draftPlanId,
      ...input
    }: DraftPlanUpdateInput & { draftPlanId: string }) =>
      api.cropRotations.updateDraftPlan(draftPlanId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropRotations.draftPlans.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropRotations.draftPlanById(data.id).queryKey,
      });
      onSuccess && onSuccess(data);
    },
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
  });
}

export function useDeleteDraftPlanMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: ({ draftPlanId }: { draftPlanId: string }) =>
      api.cropRotations.deleteDraftPlan(draftPlanId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropRotations.draftPlans.queryKey,
      });
      onSuccess && onSuccess();
    },
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
  });
}

export function useApplyDraftPlanMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: ({ draftPlanId }: { draftPlanId: string }) =>
      api.cropRotations.applyDraftPlan(draftPlanId),
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
