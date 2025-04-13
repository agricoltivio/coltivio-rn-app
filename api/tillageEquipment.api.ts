import { FetchClient } from "./api";
import { components } from "./v1";

export type TillageEquipment =
  components["schemas"]["GetV1TillageEquipmentsPositiveResponse"]["data"]["result"][number];

export type TillageEquipmentUpdateInput =
  components["schemas"]["PatchV1TillageEquipmentsByIdTillageEquipmentIdRequestBody"];

export type TillageEquipmentCreateInput =
  components["schemas"]["PostV1TillageEquipmentsRequestBody"];

export function tillageEquipmentsApi(client: FetchClient) {
  return {
    async getTillageEquipments(): Promise<TillageEquipment[]> {
      const { data } = await client.GET("/v1/tillageEquipments");
      return data!.data.result;
    },
    async getTillageEquipmentById(
      tillageEquipmentId: string
    ): Promise<TillageEquipment> {
      const { data } = await client.GET(
        "/v1/tillageEquipments/byId/{tillageEquipmentId}",
        {
          params: {
            path: {
              tillageEquipmentId,
            },
          },
        }
      );
      return data!.data;
    },

    async createTillageEquipment(
      tillageEquipment: TillageEquipmentCreateInput
    ): Promise<TillageEquipment> {
      const { data } = await client.POST("/v1/tillageEquipments", {
        body: tillageEquipment,
      });
      return data!.data;
    },

    async updateTillageEquipment(
      tillageEquipmentId: string,
      tillageEquipment: TillageEquipmentUpdateInput
    ): Promise<TillageEquipment> {
      const { data } = await client.PATCH(
        "/v1/tillageEquipments/byId/{tillageEquipmentId}",
        {
          params: {
            path: {
              tillageEquipmentId,
            },
          },
          body: tillageEquipment,
        }
      );
      return data!.data;
    },
    async deleteTillageEquipment(tillageEquipmentId: string) {
      const { data } = await client.DELETE(
        "/v1/tillageEquipments/byId/{tillageEquipmentId}",
        {
          params: {
            path: {
              tillageEquipmentId,
            },
          },
        }
      );
      return data!.data;
    },
  };
}
