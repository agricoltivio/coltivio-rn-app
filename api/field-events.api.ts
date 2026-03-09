import { FetchClient } from "./api";
import { components } from "./v1";

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type FieldEvent =
  components["schemas"]["GetV1FarmFieldEventsPositiveResponse"]["data"]["result"][number];

export function fieldEventsApi(client: FetchClient) {
  return {
    async getFieldEvents(fromDate: Date, toDate: Date): Promise<FieldEvent[]> {
      const { data } = await client.GET("/v1/farm/fieldEvents", {
        params: {
          query: {
            fromDate: toDateString(fromDate),
            toDate: toDateString(toDate),
          },
        },
      });
      return data!.data.result;
    },
  };
}
