import { useApi } from "@/api/api";
import {
  Fertilizer,
  FertilizerCreateInput,
  FertilizerUpdateInput,
} from "@/api/fertilizers.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFertilizersQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.fertilizers.all.queryKey,
    queryFn: () => api.fertilizers.getFertilizers(),
    enabled,
  });
  return { fertilizers: data, ...rest };
}

export function useFertilizerByIdQuery(
  fertilizerId: string,
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.fertilizers.byId(fertilizerId).queryKey,
    queryFn: () => api.fertilizers.getFertilizerById(fertilizerId),
    enabled,
  });
  return { fertilizer: data, ...rest };
}

export function useCreateFertilizerMutation(
  onSuccess?: (fertilizer: Fertilizer) => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (fertilizer: FertilizerCreateInput) => {
      return api.fertilizers.createFertilizer(fertilizer);
    },
    onSuccess: (fertilizer) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fertilizers._def,
      });
      onSuccess && onSuccess(fertilizer);
    },
    onError,
  });
}

export function useUpdateFertilizerMutation(
  onSuccess?: (fertilizer: Fertilizer) => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...fertilizer
    }: FertilizerUpdateInput & { id: string }) => {
      return api.fertilizers.updateFertilizer(id, fertilizer);
    },
    onSuccess: (fertilizer) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fertilizers._def,
      });
      onSuccess && onSuccess(fertilizer);
    },
    onError,
  });
}

export function useDeleteFertilizerMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fertilizerId: string) => {
      await api.fertilizers.deleteFertilizer(fertilizerId);
      return fertilizerId;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fertilizers._def,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.fertilizers.byId(id).queryKey,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
}

export function useIsFertilizerInUseQuery(
  fertilizerId: string,
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.fertilizers.inUse(fertilizerId).queryKey,
    queryFn: () => api.fertilizers.isFertilizerInUse(fertilizerId),
    enabled,
  });
  return { inUse: data, ...rest };
}
