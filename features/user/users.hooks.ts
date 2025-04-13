import { useApi } from "@/api/api";
import { queryKeys } from "@/cache/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useUserQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, error, ...rest } = useQuery({
    queryKey: queryKeys.users.me.queryKey,
    queryFn: () => api.users.getLoggedInUser(),
    enabled,
  });
  return { user: data, error, ...rest };
}
