import { useApi } from "@/api/api";
import { queryKeys } from "@/cache/query-keys";
import { components } from "@/api/v1";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePlotJournalQuery(plotId: string) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.plotJournal.byPlotId(plotId).queryKey,
    queryFn: () => api.plotJournal.getJournalEntries(plotId),
  });
  return { entries: data ?? [], ...rest };
}

export function usePlotJournalEntryQuery(entryId: string) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.plotJournal.byEntryId(entryId).queryKey,
    queryFn: () => api.plotJournal.getJournalEntryById(entryId),
  });
  return { entry: data, ...rest };
}

export function useCreatePlotJournalEntryMutation() {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: ({
      plotId,
      body,
    }: {
      plotId: string;
      body: components["schemas"]["PostV1PlotsByIdPlotIdJournalRequestBody"];
    }) => api.plotJournal.createJournalEntry(plotId, body),
    onSuccess: (_data, { plotId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.plotJournal.byPlotId(plotId).queryKey,
      });
    },
  });
}

export function useUpdatePlotJournalEntryMutation() {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: ({
      entryId,
      body,
    }: {
      entryId: string;
      plotId: string;
      body: components["schemas"]["PatchV1PlotsJournalByIdEntryIdRequestBody"];
    }) => api.plotJournal.updateJournalEntry(entryId, body),
    onSuccess: (_data, { entryId, plotId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.plotJournal.byPlotId(plotId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.plotJournal.byEntryId(entryId).queryKey,
      });
    },
  });
}

export function useDeletePlotJournalEntryMutation() {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: ({ entryId }: { entryId: string; plotId: string }) =>
      api.plotJournal.deleteJournalEntry(entryId),
    onSuccess: (_data, { plotId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.plotJournal.byPlotId(plotId).queryKey,
      });
    },
  });
}
