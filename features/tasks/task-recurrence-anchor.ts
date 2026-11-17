type LoadedRecurrence = {
  frequency: string;
  dueDate?: string | null;
  byMonthDay?: number | null;
};

// The API steps monthly tasks from the last due date and clamps to the month end, so without
// an anchor 31.1. drifts to 28.2. and stays on the 28th. dueDate is a YYYY-MM-DD string.
// A loaded anchor is kept while the due date is unchanged: after 31.1. the next task is due
// 28.2. but still carries 31, which must survive an edit of that task.
export function monthlyAnchorDay(
  frequency: string,
  dueDate: string | null | undefined,
  loaded?: LoadedRecurrence | null,
): number | undefined {
  if (frequency !== "monthly" || !dueDate) return undefined;
  if (
    loaded?.frequency === "monthly" &&
    loaded.byMonthDay != null &&
    loaded.dueDate === dueDate
  ) {
    return loaded.byMonthDay;
  }
  return Number(dueDate.slice(8, 10));
}
