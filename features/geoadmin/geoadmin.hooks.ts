import { useApi } from "@/api/api";
import { queryKeys } from "@/cache/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useGeoAdminAddressQuery(searchText: string) {
  const api = useApi();

  const { data, ...rest } = useQuery({
    initialData: [],
    queryKey: queryKeys.geoadmin.addresses(searchText).queryKey,
    enabled: searchText.length > 3,
    queryFn: () => api.geoAdmin.searchAddressLocation(searchText),
  });

  return { addresses: data, ...rest };
}
