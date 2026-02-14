import { useApi } from "@/api/api";
import {
  DownloadTreatmentsReportInput,
  DownloadOutdoorJournalReportInput,
} from "@/api/reports.api";
import { useMutation } from "@tanstack/react-query";
import { File, Paths } from "expo-file-system";
import { shareAsync } from "expo-sharing";

export function useDownloadTreatmentsReportMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  return useMutation({
    mutationFn: async (input: DownloadTreatmentsReportInput) => {
      const { base64, fileName } = await api.reports.downloadTreatmentsReport(input);
      const file = new File(Paths.cache, fileName);
      file.write(base64, { encoding: "base64" });
      await shareAsync(file.uri, {
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    },
    onSuccess,
    onError,
  });
}

export function useDownloadOutdoorJournalReportMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  return useMutation({
    mutationFn: async (input: DownloadOutdoorJournalReportInput) => {
      const { base64, fileName } = await api.reports.downloadOutdoorJournalReport(input);
      const file = new File(Paths.cache, fileName);
      file.write(base64, { encoding: "base64" });
      await shareAsync(file.uri, {
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    },
    onSuccess,
    onError,
  });
}
