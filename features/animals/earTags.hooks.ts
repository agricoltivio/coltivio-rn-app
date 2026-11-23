import { useApi } from "@/api/api";
import { EarTagRangeInput } from "@/api/earTags.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useEarTagsQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.earTags.all.queryKey,
    queryFn: () => api.earTags.getEarTags(),
    enabled,
  });
  return { earTags: data, ...rest };
}

export function useAvailableEarTagsQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.earTags.available.queryKey,
    queryFn: () => api.earTags.getAvailableEarTags(),
    enabled,
  });
  return { availableEarTags: data, ...rest };
}

export function useCreateEarTagRangeMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (input: EarTagRangeInput) => {
      return api.earTags.createEarTagRange(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.earTags._def,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
}

export function useDeleteEarTagRangeMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      fromNumber,
      toNumber,
      prefix,
    }: {
      fromNumber: string;
      toNumber: string;
      prefix?: string;
    }) => {
      return api.earTags.deleteEarTagRange(fromNumber, toNumber, prefix);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.earTags._def,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
}

export function useDeleteEarTagMutation(onError?: (error: Error) => void) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (earTagId: string) => api.earTags.deleteEarTag(earTagId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.earTags._def,
      });
    },
    onError,
  });
}

// Changes the number of one ear tag; animals show the new number
export function useUpdateEarTagNumberMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ earTagId, number }: { earTagId: string; number: string }) =>
      api.earTags.updateEarTagNumber(earTagId, number),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.earTags._def });
      queryClient.invalidateQueries({ queryKey: queryKeys.animals._def });
      onSuccess && onSuccess();
    },
    onError,
  });
}
