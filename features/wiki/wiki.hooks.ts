import { useApi } from "@/api/api";
import { WikiTranslationInput } from "@/api/wiki.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePublicWikiQuery() {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.wiki.publicList.queryKey,
    queryFn: () => api.wiki.getPublicEntries(),
  });
  return { entries: data, ...rest };
}

export function useMyWikiEntriesQuery() {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.wiki.myEntries.queryKey,
    queryFn: () => api.wiki.getMyEntries(),
  });
  return { myEntries: data, ...rest };
}

export function useWikiDetailQuery(entryId: string) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.wiki.byId(entryId).queryKey,
    queryFn: () => api.wiki.getEntryById(entryId),
  });
  return { entry: data, ...rest };
}

export function useWikiCategoriesQuery() {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.wiki.categories.queryKey,
    queryFn: () => api.wiki.getCategories(),
    staleTime: 1000 * 60 * 10,
  });
  return { categories: data ?? [], ...rest };
}

export function useMyChangeRequestsQuery() {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.wiki.myChangeRequests.queryKey,
    queryFn: () => api.wiki.getMyChangeRequests(),
  });
  return { changeRequests: data ?? [], ...rest };
}

export function useChangeRequestNotesQuery(changeRequestId: string) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.wiki.changeRequestNotes(changeRequestId).queryKey,
    queryFn: () => api.wiki.getChangeRequestNotes(changeRequestId),
  });
  return { notes: data ?? [], ...rest };
}

export function useCreateWikiEntryMutation(onSuccess?: (entryId: string) => void) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (body: { id?: string; categoryId: string; translations: WikiTranslationInput[] }) =>
      api.wiki.createEntry(body),
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wiki._def });
      onSuccess?.(entry.id);
    },
  });
}

export function useUpdateWikiEntryMutation(entryId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (body: { categoryId?: string; translations?: WikiTranslationInput[] }) =>
      api.wiki.updateEntry(entryId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wiki._def });
      onSuccess?.();
    },
  });
}

export function useSubmitWikiEntryMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (entryId: string) => api.wiki.submitEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wiki._def });
      onSuccess?.();
    },
  });
}

export function useDeleteWikiEntryMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (entryId: string) => api.wiki.deleteEntry(entryId),
    onSuccess: (_, entryId) => {
      queryClient.removeQueries({ queryKey: queryKeys.wiki.byId(entryId).queryKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.wiki._def });
      onSuccess?.();
    },
  });
}

export function useCreateChangeRequestMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: ({
      entryId,
      translations,
    }: {
      entryId: string;
      translations: WikiTranslationInput[];
    }) => api.wiki.createChangeRequest(entryId, translations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wiki.myChangeRequests.queryKey });
      onSuccess?.();
    },
  });
}

export function useUpdateChangeRequestDraftMutation(
  changeRequestId: string,
  onSuccess?: () => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (body: {
      translations?: WikiTranslationInput[];
      proposedCategoryId?: string;
    }) => api.wiki.updateChangeRequestDraft(changeRequestId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wiki.myChangeRequests.queryKey });
      onSuccess?.();
    },
  });
}

export function useSubmitChangeRequestDraftMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (changeRequestId: string) =>
      api.wiki.submitChangeRequestDraft(changeRequestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wiki.myChangeRequests.queryKey });
      onSuccess?.();
    },
  });
}

export function useAddChangeRequestNoteMutation(changeRequestId: string) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (content: string) => api.wiki.addChangeRequestNote(changeRequestId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.wiki.changeRequestNotes(changeRequestId).queryKey,
      });
    },
  });
}
