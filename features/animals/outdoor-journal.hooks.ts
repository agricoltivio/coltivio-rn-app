import { useApi } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/cache/query-keys";

// Same epoch as outdoor timeline: current year +/- 3
const currentYear = new Date().getFullYear();
const defaultFromDate = new Date(currentYear - 3, 0, 1).toISOString();
const defaultToDate = new Date(
  currentYear + 3,
  11,
  31,
  23,
  59,
  59,
  999,
).toISOString();

export function useOutdoorJournalQuery(
  fromDate: string = defaultFromDate,
  toDate: string = defaultToDate,
) {
  const api = useApi();
  return useQuery({
    ...queryKeys.outdoorJournal.byDateRange(fromDate, toDate),
    queryFn: () => api.outdoorJournal.getOutdoorJournal(fromDate, toDate),
  });
}
