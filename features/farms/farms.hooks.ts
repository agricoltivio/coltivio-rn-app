import { useApi } from "@/api/api";
import {
  AcceptInviteResult,
  CreateInviteInput,
  Farm,
  FarmCreated,
  FarmInvite,
  FarmUpdateInput,
  MemberPermission,
  PermissionAccess,
  PermissionFeature,
} from "@/api/farms.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OnboardingData } from "../onboarding/OnboardingContext";
import { User } from "@/api/user.api";
import * as Linking from "expo-linking";
import { usePaymentSheet } from "@stripe/stripe-react-native";
import { applePayParams, googlePayParams } from "@/utils/stripe";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { useActiveFarm } from "./ActiveFarmContext";

export function useFarmQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.farms.farm.queryKey,
    queryFn: () => api.farms.getFarm(),
    enabled,
  });

  return { farm: data, ...rest };
}

export function useFarmsQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.farms.list.queryKey,
    queryFn: () => api.farms.getFarms(),
    enabled,
  });

  return { farms: data, ...rest };
}

export function useFarmStatsQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.farms.stats.queryKey,
    queryFn: () => api.farms.getFarmStats(),
    enabled,
  });

  return { farmStats: data, ...rest };
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
  const { setActiveFarmId } = useActiveFarm();
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
      // The backend doesn't auto-select the new farm — do it locally so the user lands in
      // the right context immediately (both for onboarding and "create another farm").
      // setActiveFarmId also discards the query cache (query keys aren't farm-scoped), so
      // users.me/farms.list/etc. all come back fresh for the new farm.
      setActiveFarmId(farm.id);
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
  const { setActiveFarmId } = useActiveFarm();
  return useMutation({
    mutationFn: (code: string) => api.farms.acceptInvite(code),
    onSuccess: (user) => {
      // The backend doesn't auto-select the joined farm — do it locally, same as create.
      // See useCreateFarmMutation above for why no manual cache invalidation is needed here.
      if (user.farmId) {
        setActiveFarmId(user.farmId);
      }
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
    mutationFn: (input: CreateInviteInput) => api.farms.createInvite(input),
    onSuccess: (invite) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.farms.invites.queryKey,
      });
      onSuccess && onSuccess(invite);
    },
    onError: (error) => console.error(error),
  });
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

export function useLeaveFarmMutation(onSuccess?: () => void) {
  const api = useApi();
  return useMutation({
    mutationFn: () => api.farms.leaveFarm(),
    onSuccess: () => {
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

  // Grace period: farm status is "none" but membership expired less than GRACE days ago.
  // Matches the backend (membership.ts isActive/isPaidMember): a user who explicitly cancelled
  // (Austritt) doesn't get the grace buffer — their access already ended exactly at periodEnd.
  const isInGracePeriod =
    status === "none" &&
    !membershipStatus?.cancelledByUser &&
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

export function useMembershipCheckoutMutation() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const { updateLocalSettings } = useLocalSettings();

  async function refreshMembership() {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.farms.membershipStatus.queryKey,
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.farms.farm.queryKey,
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.farms.membershipPayments.queryKey,
    });
    // A new/renewed membership means any previously dismissed expiry banner no longer applies —
    // let it show again next time this (or any future) membership actually expires.
    updateLocalSettings("dismissedMembershipBannerForDate", null);
  }

  return useMutation({
    mutationFn: async (autoRenew: boolean): Promise<boolean> => {
      // autoRenew picks which intent to create, which is what determines the payment methods
      // Stripe offers in the sheet: recurring subscription (card only) vs. one-time (Twint too).
      const { paymentIntentClientSecret, customerId, ephemeralKeySecret } =
        autoRenew
          ? await api.membership.createSubscriptionIntent()
          : await api.membership.createManualIntent();

      const returnURL = Linking.createURL("stripe-redirect");
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "AgriColtivio",
        customerId,
        customerEphemeralKeySecret: ephemeralKeySecret,
        paymentIntentClientSecret,
        // Needed for payment methods that redirect out for their own confirmation (e.g. Twint, 3DS).
        returnURL,
        applePay: applePayParams,
        googlePay: googlePayParams,
      });
      if (initError) throw new Error(initError.message);

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        // User dismissed the sheet without paying — not a failure.
        if (presentError.code === "Canceled") return false;
        throw new Error(presentError.message);
      }

      // The Stripe webhook that activates the membership on the backend can lag slightly
      // behind the sheet closing, so refetch twice with a short gap rather than just once.
      await new Promise((resolve) => setTimeout(resolve, 800));
      await refreshMembership();
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await refreshMembership();
      return true;
    },
  });
}

export function useMembershipCancelMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.membership.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.farms.membershipStatus.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.farms.farm.queryKey,
      });
    },
  });
}

export function useMembershipReactivateMutation() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { updateLocalSettings } = useLocalSettings();

  return useMutation({
    mutationFn: () => api.membership.reactivateSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.farms.membershipStatus.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.farms.farm.queryKey,
      });
      // Withdrawing an Austritt means any previously dismissed expiry banner no longer
      // applies — let it show again next time this membership actually expires.
      updateLocalSettings("dismissedMembershipBannerForDate", null);
    },
  });
}

export function useMembershipDisableAutoRenewMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.membership.disableAutoRenew(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.farms.membershipStatus.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.farms.farm.queryKey,
      });
    },
  });
}

export function useMembershipPaymentMethodMutation() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

  return useMutation({
    mutationFn: async () => {
      const { setupIntentClientSecret, customerId, ephemeralKeySecret } =
        await api.membership.createPaymentMethodIntent();

      const returnURL = Linking.createURL("stripe-redirect");
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "AgriColtivio",
        customerId,
        customerEphemeralKeySecret: ephemeralKeySecret,
        setupIntentClientSecret,
        returnURL,
      });
      if (initError) throw new Error(initError.message);

      const { error: presentError } = await presentPaymentSheet();
      if (presentError && presentError.code !== "Canceled") {
        throw new Error(presentError.message);
      }
      if (presentError?.code === "Canceled") return;

      await queryClient.invalidateQueries({
        queryKey: queryKeys.farms.membershipStatus.queryKey,
      });
    },
  });
}

export function useMembershipPaymentsQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.farms.membershipPayments.queryKey,
    queryFn: () => api.membership.getPayments(),
    enabled,
  });
  return { payments: data, ...rest };
}

export function useDeleteFarmMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const { clearActiveFarmId } = useActiveFarm();

  const deleteFarmMutation = useMutation({
    mutationFn: async (deleteAccount: boolean) => {
      await api.farms.deleteFarm(deleteAccount);
    },
    onSuccess: () => {
      // The deleted farm's id is no longer valid to send as x-farm-id. clearActiveFarmId
      // updates the value request middleware reads before discarding the query cache, so the
      // refetch it triggers (e.g. the farms list, driving auto-select or the picker) never
      // goes out with the stale id and 403s.
      clearActiveFarmId();
      onSuccess && onSuccess();
    },
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
  });
  return deleteFarmMutation;
}
