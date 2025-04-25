import { useApi } from "@/api/api";
import { UpdateUserInput, User } from "@/api/user.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
  onSuccess?: (user: User) => void,
  onError?: (error: Error) => void
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: UpdateUserInput) => api.users.updateUser(user),
    onError: (error) => {
      console.error(error);
      onError && onError(error);
    },
    onSuccess: (tillage) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.me.queryKey,
      });
      onSuccess && onSuccess(tillage);
    },
  });
}
