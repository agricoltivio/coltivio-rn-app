import { useApi } from "@/api/api";
import { Seed, SeedCreateInput, SeedUpdateInput } from "@/api/seeds.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useSeedsQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.seeds.all.queryKey,
    queryFn: () => api.seeds.getSeeds(),
    enabled,
  });
  return { seeds: data, ...rest };
}

export function useSeedByIdQuery(seedId: string, enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.seeds.byId(seedId).queryKey,
    queryFn: () => api.seeds.getSeedById(seedId),
    enabled,
  });
  return { seed: data, ...rest };
}

export function useIsSeedInUseQuery(seedId: string, enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.seeds.inUse(seedId).queryKey,
    queryFn: () => api.seeds.isSeedInUse(seedId),
    enabled,
  });
  return { inUse: data, ...rest };
}

export function useCreateSeedMutation(
  onSuccess?: (seed: Seed) => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (seed: SeedCreateInput) => api.seeds.createSeed(seed),
    onSuccess: (seed) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seeds._def });
      onSuccess?.(seed);
    },
    onError,
  });
}

export function useUpdateSeedMutation(
  onSuccess?: (seed: Seed) => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: ({ id, ...seed }: SeedUpdateInput & { id: string }) =>
      api.seeds.updateSeed(id, seed),
    onSuccess: (seed) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seeds._def });
      // a crop change carries over to the seed's sowings and presets
      queryClient.invalidateQueries({ queryKey: queryKeys.sowings._def });
      onSuccess?.(seed);
    },
    onError,
  });
}

export function useDeleteSeedMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: async (seedId: string) => {
      await api.seeds.deleteSeed(seedId);
      return seedId;
    },
    onSuccess: (seedId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seeds._def });
      queryClient.removeQueries({
        queryKey: queryKeys.seeds.byId(seedId).queryKey,
      });
      onSuccess?.();
    },
    onError,
  });
}
