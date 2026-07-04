import { FetchClient } from "./api";
import { components } from "./v1";

export type GenerateFieldCalendarReportInput =
  components["schemas"]["PostV1ReportsFieldcalendarDownloadRequestBody"];

export type DownloadTreatmentsReportInput =
  components["schemas"]["PostV1ReportsTreatmentsDownloadRequestBody"];

export type DownloadOutdoorJournalReportInput =
  components["schemas"]["PostV1ReportsOutdoorjournalDownloadRequestBody"];

export function reportsApi(client: FetchClient) {
  return {
    async downloadFieldCalendarReport(input: GenerateFieldCalendarReportInput) {
      const { data } = await client.POST("/v1/reports/fieldcalendar/download", {
        body: input,
      });
      return data!.data;
    },
    async downloadTreatmentsReport(input: DownloadTreatmentsReportInput) {
      const { data } = await client.POST("/v1/reports/treatments/download", {
        body: input,
      });
      return data!.data;
    },
    async downloadOutdoorJournalReport(
      input: DownloadOutdoorJournalReportInput,
    ) {
      const { data } = await client.POST(
        "/v1/reports/outdoorjournal/download",
        {
          body: input,
        },
      );
      return data!.data;
    },
  };
}
