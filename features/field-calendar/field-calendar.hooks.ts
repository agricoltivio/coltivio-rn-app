import { useApi } from "@/api/api";
import { GenerateFieldCalendarReportInput } from "@/api/reports.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery } from "@tanstack/react-query";
import { File, Paths } from "expo-file-system";
import { shareAsync } from "expo-sharing";

export function useFieldEventsQuery(fromDate: Date, toDate: Date) {
  const api = useApi();
  return useQuery({
    ...queryKeys.fieldEvents.all(fromDate, toDate),
    queryFn: () => api.fieldEvents.getFieldEvents(fromDate, toDate),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDownloadFieldCalendarReportMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  return useMutation({
    mutationFn: async (input: GenerateFieldCalendarReportInput) => {
      const { base64, fileName } = await api.reports.downloadFieldCalendarReport(input);
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
