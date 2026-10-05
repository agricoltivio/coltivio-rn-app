import { useInfiniteQuery } from "@tanstack/react-query";
import { useApi } from "@/api/api";
import { GeoSpatials } from "@/utils/geo-spatials";
import { queryKeys } from "@/cache/query-keys";
import { useMemo } from "react";
import _ from "lodash";

export function useInfiniteQueryParcelsByBBox(
  bboxPolygon: GeoJSON.Feature,
  bufferInMeters: number = 500,
) {
  const api = useApi();

  const { data, fetchNextPage, isFetchingNextPage, fetchStatus, ...rest } =
    useInfiniteQuery({
      queryFn: () =>
        api.layers.getPlotsByBbox(
          GeoSpatials.bufferedBBox(bboxPolygon, bufferInMeters),
        ),
      queryKey: queryKeys.parcelLayer.all.queryKey,
      getNextPageParam: () => true,
      initialPageParam: true,
      staleTime: Infinity,
    });

  const { parcels, boundingBoxes } = useMemo(() => {
    const parcels = _.uniqBy(
      data?.pages.flatMap((page) => page.parcels),
      "id",
    );
    const boundingBoxes = data?.pages.map((page) => page.bbox) ?? [];
    return { parcels, boundingBoxes };
  }, [data]);

  const canLoadMore = useMemo(() => {
    if (fetchStatus === "fetching") {
      return false;
    }

    return !boundingBoxes.some((bbox) =>
      GeoSpatials.isWithinBBox(bboxPolygon, bbox, 500),
    );
  }, [boundingBoxes, bboxPolygon, fetchStatus]);
  return {
    parcels,
    boundingBoxes,
    canLoadMore,
    fetchStatus,
    fetchMoreParcels: fetchNextPage,
    isFetchingMoreParcels: fetchNextPage,
    ...rest,
  };
}
