import { useApi } from "@/api/api";
import { Harvest, HarvestBatchCreateInput } from "@/api/harvests.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useHarvestsQuery(
  fromDate?: Date,
  toDate?: Date,
  enabled = true,
) {
  const api = useApi();

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.harvests.all(fromDate, toDate).queryKey,
    queryFn: () => api.harvests.getHarvests(fromDate, toDate),
    enabled,
  });

  return { harvests: data, ...rest };
}

export function useHarvestQuery(harvestId: string, enabled = true) {
  const api = useApi();

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.harvests.byId(harvestId).queryKey,
    queryFn: () => api.harvests.getHarvestById(harvestId),
    enabled,
  });
  return { harvest: data, ...rest };
}

export function useHarvestsOfPlotQuery(plotId: string, enabled = true) {
  const api = useApi();

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.harvests.byPlotId(plotId).queryKey,
    queryFn: () => api.harvests.getPlotHarvests(plotId),
    enabled,
  });
  return { harvests: data, ...rest };
}
export function useHarvestSummariesOfFarm(enabled = true) {
  const api = useApi();

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.harvests.summaries.queryKey,
    queryFn: () => api.harvests.getHarvestSummaries(),
    staleTime: 1000 * 60 * 60,
    enabled,
  });
  return { harvestSummaries: data, ...rest };
}

export function useHarvestSummariesOfPlotQuery(plotId: string, enabled = true) {
  const api = useApi();

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.harvests.summariesByPlotId(plotId).queryKey,
    queryFn: () => api.harvests.getPlotHarvestSummaries(plotId),
    enabled,
  });
  return { harvestSummaries: data, ...rest };
}

export function useCreateHarvestMutation(
  onSuccess?: (harvest: Harvest[]) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  const createHarvestMutation = useMutation({
    mutationFn: (harvests: HarvestBatchCreateInput) => {
      return api.harvests.createHarvests(harvests);
    },
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (harvests) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.harvests._def,
      });
      onSuccess && onSuccess(harvests);
    },
  });
  return createHarvestMutation;
}

export function useDeleteHarvestMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const api = useApi();
  const deleteHarvestMutation = useMutation({
    mutationFn: async (harvestId: string) => {
      await api.harvests.deleteHarvest(harvestId);
      return harvestId;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.harvests._def,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.harvests.byId(id).queryKey,
      });
      onSuccess && onSuccess();
    },
  });
  return deleteHarvestMutation;
}

export function useHarvestYearsQuery(enabled = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.harvests.years.queryKey,
    queryFn: () => api.harvests.getHarvestYears(),
    enabled,
  });
  return { harvestYears: data, ...rest };
}
