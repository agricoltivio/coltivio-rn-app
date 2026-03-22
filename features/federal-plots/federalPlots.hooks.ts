import { useApi } from "@/api/api";
import { federalParcelsQueryKeys } from "./federalPlots.querykeys";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/cache/query-keys";

export function usePlotsByLocationQuery(
  location: {
    lat: number;
    lng: number;
  },
  radius: number,
  enabled: boolean = true,
) {
  const api = useApi();

  const { data, ...rest } = useQuery({
    initialData: [],
    queryKey: federalParcelsQueryKeys.point(
      { lat: location.lat, lng: location.lng },
      radius,
    ).queryKey,
    enabled,
    queryFn: () =>
      api.layers.getPlotsWithinRadiusOfPoint(
        location.lat,
        location.lng,
        radius,
      ),
  });

  return { plots: data, ...rest };
}

export function useFarmAndNearbyPlotsQuery(
  federalFarmId: string,
  radius: number,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.federalPlots.farm(federalFarmId!, radius).queryKey,
    queryFn: () => {
      return api.layers.getFarmAndNearbyPlots(federalFarmId, radius);
    },
  });

  return { plots: data, ...rest };
}

export function useFederalFarmIdSearchQuery(
  query: string,
  longitude: number,
  latitude: number,
  radiusInKm: number,
  limit: number,
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: federalParcelsQueryKeys.federalFarmIds(query, limit).queryKey,
    queryFn: () => {
      return api.layers.getFederalFarmIds(
        query,
        longitude,
        latitude,
        radiusInKm,
        limit,
      );
    },

    enabled,
    placeholderData: (prev) => prev || [],
  });
  return { federalFarmIds: data, ...rest };
}
