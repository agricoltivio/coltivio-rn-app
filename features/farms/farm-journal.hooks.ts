import { useApi } from "@/api/api";
import { queryKeys } from "@/cache/query-keys";
import { components } from "@/api/v1";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFarmJournalQuery() {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.farmJournal.list.queryKey,
    queryFn: () => api.farmJournal.getJournalEntries(),
  });
  return { entries: data ?? [], ...rest };
}

export function useFarmJournalEntryQuery(entryId: string) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.farmJournal.byEntryId(entryId).queryKey,
    queryFn: () => api.farmJournal.getJournalEntryById(entryId),
    enabled: entryId !== "",
  });
  return { entry: data, ...rest };
}

export function useCreateFarmJournalEntryMutation() {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (body: components["schemas"]["PostV1FarmJournalRequestBody"]) =>
      api.farmJournal.createJournalEntry(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.farmJournal.list.queryKey,
      });
    },
  });
}

export function useUpdateFarmJournalEntryMutation() {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: ({
      entryId,
      body,
    }: {
      entryId: string;
      body: components["schemas"]["PatchV1FarmJournalByIdEntryIdRequestBody"];
    }) => api.farmJournal.updateJournalEntry(entryId, body),
    onSuccess: (_data, { entryId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.farmJournal.list.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.farmJournal.byEntryId(entryId).queryKey,
      });
    },
  });
}

export function useDeleteFarmJournalEntryMutation() {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (entryId: string) =>
      api.farmJournal.deleteJournalEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.farmJournal.list.queryKey,
      });
    },
  });
}
