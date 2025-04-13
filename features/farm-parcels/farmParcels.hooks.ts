import { useApi } from "@/api/api";
import { queryKeys } from "@/cache/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useFarmParcels(enabled = true) {
  const api = useApi();

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.farmParcels.all.queryKey,
    queryFn: () => api.parcels.getFarmParcels(),
    staleTime: Infinity,
    enabled,
  });

  return { parcels: data, ...rest };
}

export function useFarmParcel(farmParcelId: string, enabled = true) {
  const api = useApi();

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.farmParcels.byId(farmParcelId).queryKey,
    queryFn: () => api.parcels.getFarmParcel(farmParcelId),
    enabled,
  });

  return { parcel: data, ...rest };
}
