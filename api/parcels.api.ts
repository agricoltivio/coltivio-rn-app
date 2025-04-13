import { FetchClient } from "./api";
import { components } from "./v1";

export type CopyParcelsInput =
  components["schemas"]["PostV1ParcelsCopyRequestBody"];
export type Parcel =
  components["schemas"]["GetV1ParcelsPositiveResponse"]["data"]["result"][number];
export function parcelsApi(client: FetchClient) {
  return {
    async copyParcels(gisIds: number[]) {
      const { data } = await client.POST("/v1/parcels/copy", {
        body: { gisIds },
      });
      return data!.data.result;
    },
    async getFarmParcels() {
      const { data } = await client.GET("/v1/parcels");
      return data!.data.result;
    },
    async getFarmParcel(farmParcelId: string): Promise<Parcel> {
      const { data } = await client.GET("/v1/parcels/byId/{parcelId}", {
        params: { path: { parcelId: farmParcelId } },
      });
      return data!.data;
    },
  };
}
