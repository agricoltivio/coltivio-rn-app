import { useApi } from "@/api/api";
import {
  FertilizerApplication,
  FertilizerApplicationBatchCreateInput,
} from "@/api/fertilizerApplications.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFertilizerApplicationsQuery(
  fromDate?: Date,
  toDate?: Date,
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.fertilizerApplications.all(fromDate, toDate).queryKey,
    queryFn: () =>
      api.fertilizerApplications.getFertilizerApplications(fromDate, toDate),
    enabled,
  });
  return { fertilizerApplications: data, ...rest };
}

export function useFertilizerApplicationsForPlotQuery(
  plotId: string,
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.fertilizerApplications.byPlotId(plotId).queryKey,
    queryFn: () =>
      api.fertilizerApplications.getFertilizerApplicationsForPlot(plotId),
    enabled,
  });
  return { fertilizerApplications: data, ...rest };
}

export function useFertilizerApplicationQuery(
  fertilizerApplicationId: string,
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.fertilizerApplications.byId(fertilizerApplicationId)
      .queryKey,
    queryFn: () =>
      api.fertilizerApplications.getFertilizerApplicationById(
        fertilizerApplicationId,
      ),
    enabled,
  });
  return { fertilizerApplication: data, ...rest };
}

export function useFertilizerApplicationYearsQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.fertilizerApplications.years.queryKey,
    queryFn: () => api.fertilizerApplications.getFertilizerApplicationYears(),
    enabled,
  });
  return { fertilizerApplicationYears: data, ...rest };
}

export function useFertilizerApplicationSummaryOfFarmQuery(
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.fertilizerApplications.summaries.queryKey,
    queryFn: () =>
      api.fertilizerApplications.getFertilizerApplicationSummariesForFarm(),
    enabled,
  });
  return { applicationSummaries: data, ...rest };
}

export function useFertilizerApplicationSummaryForPlotQuery(
  plotId: string,
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey:
      queryKeys.fertilizerApplications.summariesByPlotId(plotId).queryKey,
    queryFn: () =>
      api.fertilizerApplications.getFertilizerApplicationSummariesForPlot(
        plotId,
      ),
    enabled,
  });
  return { applicationSummaries: data, ...rest };
}

export function useCreateFertilizerApplicationsMutation(
  onSuccess?: (fertilizerApplications: FertilizerApplication[]) => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  const createFertilizerApplicationMutation = useMutation({
    mutationFn: (
      fertilizerApplications: FertilizerApplicationBatchCreateInput,
    ) => {
      return api.fertilizerApplications.createFertilizerApplications(
        fertilizerApplications,
      );
    },
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
    onSuccess: (fertilizerApplication) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fertilizerApplications._def,
      });
      onSuccess && onSuccess(fertilizerApplication);
    },
  });
  return createFertilizerApplicationMutation;
}

export function useDeleteFertilizerApplicationMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  const deleteFertilizerApplicationMutation = useMutation({
    mutationFn: async (fertilizerApplicationId: string) => {
      await api.fertilizerApplications.deleteFertilizerApplication(
        fertilizerApplicationId,
      );
      return fertilizerApplicationId;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fertilizerApplications._def,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.fertilizerApplications.byId(id).queryKey,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
  return deleteFertilizerApplicationMutation;
}
