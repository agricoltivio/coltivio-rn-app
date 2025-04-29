import { useApi } from "@/api/api";
import { Farm, FarmUpdateInput } from "@/api/farms.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OnboardingData } from "../onboarding/OnboardingContext";
import { User } from "@/api/user.api";

export function useFarmQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.farms.farm.queryKey,
    queryFn: () => api.farms.getFarm(),
    staleTime: Infinity,
    enabled,
  });

  return { farm: data, ...rest };
}

export function useUpdateFarmMutation(
  onSuccess?: (farm: Farm) => void,
  onError?: (error: Error) => void
) {
  const api = useApi();
  const queryClient = useQueryClient();
  const updateFarmMutation = useMutation({
    mutationFn: async (data: FarmUpdateInput) => {
      const farm = await api.farms.updateFarm(data);
      return { farm };
    },
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
    onSuccess: ({ farm }) => {
      queryClient.setQueryData(queryKeys.farms.farm.queryKey, () => farm);
      onSuccess && onSuccess(farm);
    },
  });

  return updateFarmMutation;
}

export function useCreateFarmMutation(
  onSuccess?: (farm: Farm) => void,
  onError?: (error: Error) => void
) {
  const api = useApi();
  const queryClient = useQueryClient();
  const createFarmMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      const farm = await api.farms.createFarm({
        federalId: data.federalFarmId!,
        location: {
          type: "Point",
          coordinates: [data.location!.lng, data.location!.lat],
        },
        name: data.name,
        address: data.location!.label,
      });
      return { farm };
    },
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
    onSuccess: ({ farm }) => {
      // set cache
      queryClient.setQueryData(queryKeys.users.me.queryKey, (user: User) => ({
        ...user,
        farmId: farm.id,
      }));
      onSuccess && onSuccess(farm);
    },
  });
  return createFarmMutation;
}

export function useDeleteFarmMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const api = useApi();
  const queryClient = useQueryClient();

  const deleteFarmMutation = useMutation({
    mutationFn: async (deleteAccount: boolean) => {
      await api.farms.deleteFarm(deleteAccount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users._def,
      });
      queryClient.removeQueries();
      onSuccess && onSuccess();
    },
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
  });
  return deleteFarmMutation;
}
