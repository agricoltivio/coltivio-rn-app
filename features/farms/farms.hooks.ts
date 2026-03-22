import { useApi } from "@/api/api";
import {
  AcceptInviteResult,
  Farm,
  FarmCreated,
  FarmInvite,
  FarmUpdateInput,
} from "@/api/farms.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OnboardingData } from "../onboarding/OnboardingContext";
import { User } from "@/api/user.api";

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

export function useAcceptInviteMutation(
  onSuccess?: (user: AcceptInviteResult) => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => api.farms.acceptInvite(code),
    onSuccess: (user) => {
      // Setting farmId on the user cache makes hasFarm true → RootStack auto-transitions to app
      queryClient.setQueryData(queryKeys.users.me.queryKey, () => user);
      onSuccess && onSuccess(user);
    },
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
  });
}

export function useFarmInvitesQuery() {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.farms.invites.queryKey,
    queryFn: () => api.farms.getInvites(),
  });
}

export function useCreateInviteMutation(
  onSuccess?: (invite: FarmInvite) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => api.farms.createInvite(email),
    onSuccess: (invite) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.farms.invites.queryKey,
      });
      onSuccess && onSuccess(invite);
    },
    onError: (error) => console.error(error),
  });
}

export function useRevokeInviteMutation(onSuccess?: () => void) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => api.farms.revokeInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.farms.invites.queryKey,
      });
      onSuccess && onSuccess();
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

const MEMBERSHIP_GRACE_PERIOD_DAYS = 10;

export function useMembership() {
  const { farm } = useFarmQuery();
  const { membershipStatus } = useMembershipStatusQuery();
  const status = farm?.membership.status;

  // Determine the most recent expiry date from paid period or trial
  const relevantEndDate = (() => {
    const lastPeriodEnd =
      typeof membershipStatus?.lastPeriodEnd === "string" &&
      membershipStatus.lastPeriodEnd.length > 0
        ? new Date(membershipStatus.lastPeriodEnd)
        : null;
    const trialEnd =
      typeof membershipStatus?.trialEnd === "string" &&
      membershipStatus.trialEnd.length > 0
        ? new Date(membershipStatus.trialEnd)
        : null;
    return lastPeriodEnd ?? trialEnd;
  })();

  const daysSinceExpiry =
    relevantEndDate !== null
      ? Math.floor(
          (Date.now() - relevantEndDate.getTime()) / (1000 * 60 * 60 * 24),
        )
      : null;

  // Grace period: farm status is "none" but membership expired less than GRACE days ago
  const isInGracePeriod =
    status === "none" &&
    daysSinceExpiry !== null &&
    daysSinceExpiry >= 0 &&
    daysSinceExpiry < MEMBERSHIP_GRACE_PERIOD_DAYS;

  const graceDaysRemaining =
    isInGracePeriod && daysSinceExpiry !== null
      ? MEMBERSHIP_GRACE_PERIOD_DAYS - daysSinceExpiry
      : 0;

  const isActive = status === "active" || status === "trial" || isInGracePeriod;
  return { isActive, isInGracePeriod, graceDaysRemaining };
}

export function useMembershipStatusQuery() {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.farms.membershipStatus.queryKey,
    queryFn: () => api.membership.getMembershipStatus(),
  });
  return { membershipStatus: data, ...rest };
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
