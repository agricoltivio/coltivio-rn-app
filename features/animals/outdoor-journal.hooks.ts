import { useApi } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/cache/query-keys";

// Up to 10 years back until 3 years ahead (date-only, as the API expects).
// The timeline itself starts at the year of the earliest returned entry.
const currentYear = new Date().getFullYear();
const defaultFromDate = `${currentYear - 10}-01-01`;
const defaultToDate = `${currentYear + 3}-12-31`;

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
