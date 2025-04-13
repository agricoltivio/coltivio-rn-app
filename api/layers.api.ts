import { paths } from "./v1";
import { FetchClient } from "./api";

export type FederalFarmPlot =
  paths["/v1/layers/plots/bbox"]["get"]["responses"]["200"]["content"]["application/json"]["data"]["result"][0];

export function layersApi(client: FetchClient) {
  return {
    async getPlotsByBbox([xmin, ymin, xmax, ymax]: GeoJSON.BBox) {
      const { data } = await client.GET("/v1/layers/plots/bbox", {
        params: {
          query: {
            xmax: xmax.toString(),
            xmin: xmin.toString(),
            ymax: ymax.toString(),
            ymin: ymin.toString(),
          },
        },
      });
      if (!data) {
        throw new Error("Missing content");
      }
      return {
        parcels: data.data.result,
        bbox: data.data.bbox,
      };
    },
    async getPlotsWithinRadiusOfPoint(
      latitude: number,
      longitude: number,
      radiusInKm: number
    ) {
      const { data } = await client.GET("/v1/layers/plots/radius", {
        params: {
          query: {
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            radiusInKm: radiusInKm.toString(),
          },
        },
      });
      return data!.data.result;
    },

    async getPlotsForFederalFarmId(federalFarmId: string) {
      const { data } = await client.GET(
        "/v1/layers/plots/farms/{federalFarmId}/only",
        {
          params: {
            path: {
              federalFarmId,
            },
          },
        }
      );
      return data!.data.result;
    },
    async getFarmAndNearbyPlots(federalFarmId: string, bufferInKm?: number) {
      const { data } = await client.GET(
        "/v1/layers/plots/farms/{federalFarmId}/bbox",
        {
          params: {
            path: {
              federalFarmId,
              bufferInKm,
            },
          },
        }
      );
      return data!.data.result;
    },
    async getFederalFarmIds(
      query: string,
      longitude: number,
      latitude: number,
      radiusInKm: number,
      limit: number
    ): Promise<string[]> {
      const { data } = await client.GET("/v1/layers/federalFarmIds", {
        params: {
          query: {
            query,
            limit: limit.toString(),
            longitude: longitude.toString(),
            latitude: latitude.toString(),
            radiusInKm: radiusInKm.toString(),
          },
        },
      });
      return data!.data.result;
    },
  };
}
