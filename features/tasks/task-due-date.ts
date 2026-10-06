import { ColtivioTheme } from "@/theme/theme";

// Compares calendar days in local time, so a task due today stays "due today" all day
// instead of turning overdue right after midnight UTC or at the exact due time
export function getDueDateColor(
  dueDate: string | Date,
  theme: ColtivioTheme,
): string {
  const due = new Date(dueDate);
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (dueDay < today) {
    return theme.colors.danger;
  }
  if (dueDay.getTime() === today.getTime()) {
    return theme.colors.amber;
  }
  return theme.colors.success;
}
