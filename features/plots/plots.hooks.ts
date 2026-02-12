import { useApi } from "@/api/api";
import {
  MergePlotsInput,
  Plot,
  PlotCreateInput,
  PlotUpdateInput,
  SplitPlotInput,
} from "@/api/plots.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFarmPlotsQuery() {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.plots.all.queryKey,
    queryFn: () => api.plots.getPlots(),
    staleTime: 5 * 60 * 1000,
  });
  return { plots: data, ...rest };
}

export function usePlotByIdQuery(plotId: string) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.plots.byId(plotId).queryKey,
    queryFn: () => api.plots.getPlotById(plotId),
  });
  return { plot: data, ...rest };
}

export function useCreatePlotMutation(
  onSuccess?: (plot: Plot) => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationKey: ["createPlot"],
    mutationFn: (input: PlotCreateInput) => api.plots.createPlot(input),
    onSuccess: (plot) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.plots._def,
      });
      onSuccess && onSuccess(plot);
    },
    onError,
  });
}

export function useUpdatePlotMutation(
  onSuccess?: (plot: Plot) => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: ({ plotId, data }: { plotId: string; data: PlotUpdateInput }) =>
      api.plots.updatePlot(plotId, data),
    onSuccess: (plot) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.plots._def,
      });
      onSuccess && onSuccess(plot);
    },
    onError,
  });
}

export function useDeletePlotMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (plotId: string) => api.plots.deletePlot(plotId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.plots._def,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
}

export function useSplitPlotMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: ({ plotId, data }: { plotId: string; data: SplitPlotInput }) =>
      api.plots.splitPlot(plotId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.plots._def,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
}

export function useMergePlotsMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (data: MergePlotsInput) => api.plots.mergePlots(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.plots._def,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
}

export function useSyncMissingLocalIdsMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.plots.syncMissingLocalIds(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.plots._def,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
}
