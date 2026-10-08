import { useMemo } from "react";
import { useFarmUsersQuery } from "./tasks.hooks";

// Kept clear of green, orange, red and yellow, which are reserved for due date states, and
// of dark hues (brown, blue grey), which read as black next to the gray label chips
const ASSIGNEE_COLORS = [
  "#1E88E5", // blue
  "#8E24AA", // purple
  "#00ACC1", // cyan
  "#EC407A", // pink
  "#3949AB", // indigo
];

// Colors are handed out in order of the farm's members sorted by id, so the first
// ASSIGNEE_COLORS.length members never share a color (hashing ids collided too often) and
// every device shows the same color per member. Adding a member can shift the colors of
// members sorted after them.
export function useAssigneeColor() {
  const { users } = useFarmUsersQuery();

  const colorByUserId = useMemo(() => {
    const sortedUserIds = users.map((user) => user.id).sort();
    const colors = new Map<string, string>();
    sortedUserIds.forEach((userId, index) => {
      colors.set(userId, ASSIGNEE_COLORS[index % ASSIGNEE_COLORS.length]);
    });
    return colors;
  }, [users]);

  // Former members still assigned to old tasks aren't in the member list
  return (userId: string) => colorByUserId.get(userId) ?? ASSIGNEE_COLORS[0];
}
