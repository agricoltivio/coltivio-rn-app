import { useApi } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/cache/query-keys";
import {
  OUTDOOR_HISTORY_FROM_DATE,
  OUTDOOR_HISTORY_TO_DATE,
} from "./meadow-usage-utils";

export function useOutdoorJournalQuery(
  fromDate: string = OUTDOOR_HISTORY_FROM_DATE,
  toDate: string = OUTDOOR_HISTORY_TO_DATE,
) {
  const api = useApi();
  return useQuery({
    ...queryKeys.outdoorJournal.byDateRange(fromDate, toDate),
    queryFn: () => api.outdoorJournal.getOutdoorJournal(fromDate, toDate),
  });
}
