import { FetchClient } from "./api";
import { components } from "./v1";

export type CropProtectionEquipment =
  components["schemas"]["GetV1CropProtectionEquipmentsPositiveResponse"]["data"]["result"][number];

export type CropProtectionEquipmentUpdateInput =
  components["schemas"]["PatchV1CropProtectionEquipmentsByIdCropProtectionEquipmentIdRequestBody"];

export type CropProtectionEquipmentCreateInput =
  components["schemas"]["PostV1CropProtectionEquipmentsRequestBody"];

export function cropProtectionEquipmentsApi(client: FetchClient) {
  return {
    async getCropProtectionEquipments(): Promise<CropProtectionEquipment[]> {
      const { data } = await client.GET("/v1/cropProtectionEquipments");
      return data!.data.result;
    },
    async getCropProtectionEquipmentById(
      cropProtectionEquipmentId: string
    ): Promise<CropProtectionEquipment> {
      const { data } = await client.GET(
        "/v1/cropProtectionEquipments/byId/{cropProtectionEquipmentId}",
        {
          params: {
            path: {
              cropProtectionEquipmentId,
            },
          },
        }
      );
      return data!.data;
    },

    async createCropProtectionEquipment(
      cropProtectionEquipment: CropProtectionEquipmentCreateInput
    ): Promise<CropProtectionEquipment> {
      const { data } = await client.POST("/v1/cropProtectionEquipments", {
        body: cropProtectionEquipment,
      });
      return data!.data;
    },

    async updateCropProtectionEquipment(
      cropProtectionEquipmentId: string,
      cropProtectionEquipment: CropProtectionEquipmentUpdateInput
    ): Promise<CropProtectionEquipment> {
      const { data } = await client.PATCH(
        "/v1/cropProtectionEquipments/byId/{cropProtectionEquipmentId}",
        {
          params: {
            path: {
              cropProtectionEquipmentId,
            },
          },
          body: cropProtectionEquipment,
        }
      );
      return data!.data;
    },
    async deleteCropProtectionEquipment(cropProtectionEquipmentId: string) {
      const { data } = await client.DELETE(
        "/v1/cropProtectionEquipments/byId/{cropProtectionEquipmentId}",
        {
          params: {
            path: {
              cropProtectionEquipmentId,
            },
          },
        }
      );
      return data!.data;
    },
  };
}
