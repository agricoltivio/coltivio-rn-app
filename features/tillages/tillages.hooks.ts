import { useApi } from "@/api/api";
import { Tillage, TillagesBatchCreateInput } from "@/api/tillages.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useTillagesQuery(
  fromDate?: Date,
  toDate?: Date,
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.tillages.all(fromDate, toDate).queryKey,
    queryFn: () => api.tillages.getTillages(fromDate, toDate),
    enabled,
  });
  return { tillages: data, ...rest };
}

export function useTillagesForPlotQuery(
  plotId: string,
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.tillages.byPlotId(plotId).queryKey,
    queryFn: () => api.tillages.getTillagesForPlot(plotId),
    enabled,
  });
  return { tillages: data, ...rest };
}

export function useTillageQuery(tillageId: string, enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.tillages.byId(tillageId).queryKey,
    queryFn: () => api.tillages.getTillageById(tillageId),
    enabled,
  });
  return { tillage: data, ...rest };
}

export function useTillageYearsQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.tillages.years.queryKey,
    queryFn: () => api.tillages.getTillageYears(),
    enabled,
  });
  return { tillageYears: data, ...rest };
}

export function useCreateTillagesMutation(
  onSuccess?: (tillages: Tillage[]) => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  const createTillageMutation = useMutation({
    mutationFn: (batchInput: TillagesBatchCreateInput) => {
      return api.tillages.createTillages(batchInput);
    },
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
    onSuccess: (tillage) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tillages._def,
      });
      onSuccess && onSuccess(tillage);
    },
  });
  return createTillageMutation;
}

export function useDeleteTillageMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  const deleteTillageMutation = useMutation({
    mutationFn: async (tillageId: string) => {
      await api.tillages.deleteTillage(tillageId);
      return tillageId;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tillages._def,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.tillages.byId(id).queryKey,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
  return deleteTillageMutation;
}
