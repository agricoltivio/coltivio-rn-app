import { ColtivioTheme } from "@/theme/theme";

// Compares calendar days in local time, so a task due today isn't overdue until tomorrow
// instead of turning overdue at the exact due time
export function isTaskOverdue(dueDate: string | Date): boolean {
  const due = new Date(dueDate);
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return dueDay < today;
}

export function getDueDateColor(
  dueDate: string | Date,
  theme: ColtivioTheme,
): string | undefined {
  // Only overdue dates stand out with a red outline, others use the default chip style
  // (same as labels), since the assignee colors are enough color per row
  return isTaskOverdue(dueDate) ? theme.colors.danger : undefined;
}
