import { useApi } from "@/api/api";
import { UpdateUserInput, User } from "@/api/user.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type PermissionFeature = NonNullable<User["farmPermissions"]>[number]["feature"];

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
    enabled,
  });
  return { user: data, error, ...rest };
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
