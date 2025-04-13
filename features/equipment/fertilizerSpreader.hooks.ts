import { useApi } from "@/api/api";
import {
  FertilizerSpreader,
  FertilizerSpreaderCreateInput,
  FertilizerSpreaderUpdateInput,
} from "@/api/fertilizerSpreaders.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFertilizerSpreadersQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.fertilizerSpreaders.all.queryKey,
    queryFn: () => api.fertilizerSpreaders.getFertilizerSpreaders(),
    enabled,
  });
  return { fertilizerSpreaders: data, ...rest };
}

export function useFertilizerSpreaderByIdQuery(
  fertilizerSpreaderId: string,
  enabled: boolean = true
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.fertilizerSpreaders.byId(fertilizerSpreaderId).queryKey,
    queryFn: () =>
      api.fertilizerSpreaders.getFertilizerSpreaderById(fertilizerSpreaderId),
    enabled,
  });
  return { fertilizerSpreader: data, ...rest };
}

export function useCreateFertilizerSpreaderMutation(
  onSuccess?: (fertilizerSpreader: FertilizerSpreader) => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (fertilizerSpreader: FertilizerSpreaderCreateInput) => {
      return api.fertilizerSpreaders.createFertilizerSpreader(
        fertilizerSpreader
      );
    },
    onSuccess: (fertilizerSpreader) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fertilizerSpreaders._def,
      });
      onSuccess && onSuccess(fertilizerSpreader);
    },
    onError,
  });
}

export function useUpdateFertilizerSpreaderMutation(
  onSuccess?: (fertilizerSpreader: FertilizerSpreader) => void,
  onError?: (error: Error) => void
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...fertilizerSpreader
    }: FertilizerSpreaderUpdateInput & { id: string }) => {
      return api.fertilizerSpreaders.updateFertilizerSpreader(
        id,
        fertilizerSpreader
      );
    },
    onSuccess: (fertilizerSpreader) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fertilizerSpreaders._def,
      });
      onSuccess && onSuccess(fertilizerSpreader);
    },
    onError,
  });
}

export function useDeleteFertilizerSpreaderMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fertilizerSpreaderId: string) => {
      await api.fertilizerSpreaders.deleteFertilizerSpreader(
        fertilizerSpreaderId
      );
      return fertilizerSpreaderId;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fertilizerSpreaders._def,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.fertilizerSpreaders.byId(id).queryKey,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
}
