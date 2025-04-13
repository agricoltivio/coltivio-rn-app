import { FetchClient } from "./api";
import { components } from "./v1";

export type GenerateFieldCalendarReportInput =
  components["schemas"]["PostV1ReportsFieldcalendarRequestBody"];

export function reportsApi(client: FetchClient) {
  return {
    async generateFieldCalendarReport(input: GenerateFieldCalendarReportInput) {
      await client.POST("/v1/reports/fieldcalendar", {
        body: input,
      });
    },
  };
}
