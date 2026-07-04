import { useApi } from "@/api/api";
import {
  Farm,
  FarmCreated,
  FarmUpdateInput,
  PermissionAccess,
  PermissionFeature,
} from "@/api/farms.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OnboardingData } from "../onboarding/OnboardingContext";

export function useFarmQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.farms.farm.queryKey,
    queryFn: () => api.farms.getFarm(),
    enabled,
  });

  return { farm: data, ...rest };
}

export function useUpdateFarmMutation(
  onSuccess?: (farm: Farm) => void,
  onError?: (error: Error) => void,
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
  onSuccess?: (farm: FarmCreated) => void,
  onError?: (error: Error) => void,
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
    onSuccess: async ({ farm }) => {
      // Fetch fresh user data after farm creation so farmId is guaranteed to be set
      // by the server. Using setQueryData with a partial update risks being overwritten
      // by an in-flight useUserQuery fetch that started before the farm existed.
      const freshUser = await api.users.getLoggedInUser();
      queryClient.setQueryData(queryKeys.users.me.queryKey, freshUser);
      onSuccess && onSuccess(farm);
    },
  });
  return createFarmMutation;
}

export function useMemberPermissionsQuery(userId: string) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.farms.memberPermissions(userId).queryKey,
    queryFn: () => api.farms.getMemberPermissions(userId),
    enabled: userId.length > 0,
  });
  return { permissions: data ?? [], ...rest };
}

export function useSetMemberPermissionMutation(userId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      feature,
      access,
    }: {
      feature: PermissionFeature;
      access: PermissionAccess;
    }) => api.farms.setMemberPermission(userId, feature, access),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.farms.memberPermissions(userId).queryKey,
      });
    },
    onError: (error) => console.error(error),
  });
}

export function useDeleteMemberPermissionMutation(userId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (feature: PermissionFeature) =>
      api.farms.deleteMemberPermission(userId, feature),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.farms.memberPermissions(userId).queryKey,
      });
    },
    onError: (error) => console.error(error),
  });
}

export function useRemoveMemberMutation(onSuccess?: () => void) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.farms.removeMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users._def });
      onSuccess && onSuccess();
    },
    onError: (error) => console.error(error),
  });
}

export function useUpdateMemberRoleMutation(onSuccess?: () => void) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: "owner" | "member";
    }) => api.farms.updateMemberRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users._def });
      onSuccess && onSuccess();
    },
    onError: (error) => console.error(error),
  });
}

// Standalone builds have no membership/subscription concept — every farm is
// always fully active.
export function useMembership() {
  return { isActive: true, isInGracePeriod: false, graceDaysRemaining: 0 };
}

export function useDeleteFarmMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
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
