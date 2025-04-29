import { useApi } from "@/api/api";
import { GenerateFieldCalendarReportInput } from "@/api/reports.api";
import { useMutation } from "@tanstack/react-query";

export function useGeneratePlotsReportMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const api = useApi();
  const deleteTillageMutation = useMutation({
    mutationFn: async (input: GenerateFieldCalendarReportInput) => {
      await api.reports.generateFieldCalendarReport(input);
    },
    onSuccess,
    onError,
  });
  return deleteTillageMutation;
}
