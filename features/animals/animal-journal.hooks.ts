import { useApi } from "@/api/api";
import { queryKeys } from "@/cache/query-keys";
import { components } from "@/api/v1";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAnimalJournalQuery(animalId: string) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.animalJournal.byAnimalId(animalId).queryKey,
    queryFn: () => api.animalJournal.getJournalEntries(animalId),
  });
  return { entries: data ?? [], ...rest };
}

export function useAnimalJournalEntryQuery(entryId: string) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.animalJournal.byEntryId(entryId).queryKey,
    queryFn: () => api.animalJournal.getJournalEntryById(entryId),
  });
  return { entry: data, ...rest };
}

export function useCreateJournalEntryMutation() {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: ({
      animalId,
      body,
    }: {
      animalId: string;
      body: components["schemas"]["PostV1AnimalsByIdAnimalIdJournalRequestBody"];
    }) => api.animalJournal.createJournalEntry(animalId, body),
    onSuccess: (_data, { animalId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.animalJournal.byAnimalId(animalId).queryKey,
      });
    },
  });
}

export function useUpdateJournalEntryMutation() {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: ({
      entryId,
      animalId,
      body,
    }: {
      entryId: string;
      animalId: string;
      body: components["schemas"]["PatchV1AnimalsJournalByIdEntryIdRequestBody"];
    }) => api.animalJournal.updateJournalEntry(entryId, body),
    onSuccess: (_data, { entryId, animalId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.animalJournal.byAnimalId(animalId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.animalJournal.byEntryId(entryId).queryKey,
      });
    },
  });
}

export function useDeleteJournalEntryMutation() {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: ({
      entryId,
    }: {
      entryId: string;
      animalId: string;
    }) => api.animalJournal.deleteJournalEntry(entryId),
    onSuccess: (_data, { animalId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.animalJournal.byAnimalId(animalId).queryKey,
      });
    },
  });
}
