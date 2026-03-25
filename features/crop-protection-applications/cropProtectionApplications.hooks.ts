import { useApi } from "@/api/api";
import {
  CropProtectionApplication,
  CropProtectionApplicationCreateInput,
  CropProtectionApplicationsBatchCreateInput,
} from "@/api/cropProtectionApplications.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCropProtectionApplicationsQuery(
  fromDate?: Date,
  toDate?: Date,
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropProtectionApplications.all.queryKey,
    queryFn: () =>
      api.cropProtectionApplications.getCropProtectionApplications(
        fromDate,
        toDate,
      ),
    enabled,
  });
  return { cropProtectionApplications: data, ...rest };
}

export function useCropProtectionApplicationsForPlotQuery(
  plotId: string,
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropProtectionApplications.byPlotId(plotId).queryKey,
    queryFn: () =>
      api.cropProtectionApplications.getCropProtectionApplicationsForPlot(
        plotId,
      ),
    enabled,
  });
  return { cropProtectionApplications: data, ...rest };
}

export function useCropProtectionApplicationQuery(
  cropProtectionApplicationId: string,
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropProtectionApplications.byId(
      cropProtectionApplicationId,
    ).queryKey,
    queryFn: () =>
      api.cropProtectionApplications.getCropProtectionApplicationById(
        cropProtectionApplicationId,
      ),
    enabled,
  });
  return { cropProtectionApplication: data, ...rest };
}

export function useCropProtectionApplicationYearsQuery(
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropProtectionApplications.years.queryKey,
    queryFn: () =>
      api.cropProtectionApplications.getCropProtectionApplicationYears(),
    enabled,
  });
  return { cropProtectionApplicationYears: data, ...rest };
}

export function useCreateCropProtectionApplicationsMutation(
  onSuccess?: (cropProtectionApplications: CropProtectionApplication[]) => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  const createCropProtectionApplicationMutation = useMutation({
    mutationFn: (
      cropProtectionApplications: CropProtectionApplicationsBatchCreateInput,
    ) => {
      return api.cropProtectionApplications.createCropProtectionApplications(
        cropProtectionApplications,
      );
    },
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
    onSuccess: (cropProtectionApplication) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropProtectionApplications._def,
      });
      onSuccess && onSuccess(cropProtectionApplication);
    },
  });
  return createCropProtectionApplicationMutation;
}

export function useDeleteCropProtectionApplicationMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  const deleteCropProtectionApplicationMutation = useMutation({
    mutationFn: async (cropProtectionApplicationId: string) => {
      await api.cropProtectionApplications.deleteCropProtectionApplication(
        cropProtectionApplicationId,
      );
      return cropProtectionApplicationId;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropProtectionApplications._def,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.cropProtectionApplications.byId(id).queryKey,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
  return deleteCropProtectionApplicationMutation;
}

export function useCropProtectionApplicationSummariesOfFarmQuery(
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropProtectionApplications.summaries.queryKey,
    queryFn: () =>
      api.cropProtectionApplications.getCropProtectionApplicationSummariesForFarm(),
    enabled,
  });
  return { applicationSummaries: data, ...rest };
}

export function useCropProtectionApplicationSummariesOfPlotQuery(
  plotId: string,
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey:
      queryKeys.cropProtectionApplications.summariesByPlotId(plotId).queryKey,
    queryFn: () =>
      api.cropProtectionApplications.getCropProtectionApplicationSummariesForPlot(
        plotId,
      ),
    enabled,
  });
  return { applicationSummaries: data, ...rest };
}
