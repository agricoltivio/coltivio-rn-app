import { useApi } from "@/api/api";
import { DeleteAccountInput, UpdateUserInput, User } from "@/api/user.api";
import { useSession } from "@/auth/SessionProvider";
import { useActiveFarm } from "@/features/farms/ActiveFarmContext";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type PermissionFeature = NonNullable<
  User["farmPermissions"]
>[number]["feature"];

export function usePermissions() {
  const { user } = useUserQuery();

  function getAccess(feature: PermissionFeature): "none" | "read" | "write" {
    // Owners and users without a farm role (no farm yet) bypass all restrictions
    if (!user || user.farmRole === "owner" || user.farmRole === null) {
      return "write";
    }
    const perm = user.farmPermissions?.find((p) => p.feature === feature);
    // absence of a record means the server default applies; we use "read" as fallback
    return (perm?.access ?? "read") as "none" | "read" | "write";
  }

  function canWrite(feature: PermissionFeature): boolean {
    return getAccess(feature) === "write";
  }

  function canRead(feature: PermissionFeature): boolean {
    return getAccess(feature) !== "none";
  }

  return { getAccess, canWrite, canRead };
}

export function useUserQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, error, ...rest } = useQuery({
    queryKey: queryKeys.users.me.queryKey,
    queryFn: () => api.users.getLoggedInUser(),
    staleTime: (query) =>
      query.state.data?.emailVerified === false ? 0 : 5 * 60 * 1000,
    enabled,
  });
  return { user: data, error, ...rest };
}

export function useSendVerificationEmailMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  return useMutation({
    mutationFn: () => api.users.sendVerificationEmail(),
    onSuccess,
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
  });
}

export function useUpdateUserMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: UpdateUserInput) => api.users.updateUser(user),
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.me.queryKey,
      });
      onSuccess && onSuccess();
    },
  });
}

export function useDeletionPreviewQuery() {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.users.deletionPreview.queryKey,
    queryFn: () => api.users.getDeletionPreview(),
    // Farm memberships can change at any time, the preview must be current when confirming
    staleTime: 0,
  });
  return { farms: data, ...rest };
}

export function useDeleteAccountMutation(onError?: (error: Error) => void) {
  const api = useApi();
  const { clearSession } = useSession();
  const { clearActiveFarmId } = useActiveFarm();
  return useMutation({
    mutationFn: (input: DeleteAccountInput) => api.users.deleteAccount(input),
    onSuccess: async () => {
      clearActiveFarmId();
      await clearSession();
    },
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
  });
}
