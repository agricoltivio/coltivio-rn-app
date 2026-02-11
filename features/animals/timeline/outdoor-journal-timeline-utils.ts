import { OutdoorJournalEntry } from "@/api/outdoor-journal.api";
import {
  OutdoorTimelineData,
  OutdoorHerdData,
  OutdoorBar,
} from "./outdoor-timeline-utils";

const MS_PER_DAY = 86_400_000;

// Builds OutdoorTimelineData from journal entries.
// Each category becomes a row, each entry becomes a bar.
// Uses same epoch as outdoor schedule timeline (current year +/- 3).
export function buildJournalTimelineData(
  entries: OutdoorJournalEntry[],
): OutdoorTimelineData {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 3;
  const endYear = currentYear + 3;
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i,
  );

  const epochStart = new Date(startYear, 0, 1);
  const epochEnd = new Date(endYear, 11, 31, 23, 59, 59, 999);
  const totalDays =
    Math.floor((epochEnd.getTime() - epochStart.getTime()) / MS_PER_DAY) + 1;

  // Group entries by category
  const byCategory = new Map<string, OutdoorJournalEntry[]>();
  for (const entry of entries) {
    const group = byCategory.get(entry.category) ?? [];
    group.push(entry);
    byCategory.set(entry.category, group);
  }

  // Sort categories alphabetically
  const sortedCategories = [...byCategory.keys()].sort();

  // Always show at least a placeholder row so the timeline renders when empty
  if (sortedCategories.length === 0) {
    return {
      herds: [{ herdId: "_empty", herdName: "–", bars: [] }],
      epochStart,
      totalDays,
      years,
    };
  }

  const herds: OutdoorHerdData[] = sortedCategories.map((category) => {
    const categoryEntries = byCategory.get(category)!;
    const bars: OutdoorBar[] = categoryEntries.map((entry, idx) => {
      const start = new Date(entry.startDate);
      const end = new Date(entry.endDate);
      const startDay = Math.floor(
        (start.getTime() - epochStart.getTime()) / MS_PER_DAY,
      );
      const endDay = Math.floor(
        (end.getTime() - epochStart.getTime()) / MS_PER_DAY,
      );
      return {
        scheduleId: `${category}-${idx}`,
        herdName: category,
        herdId: category,
        startDay: Math.max(0, startDay),
        endDay: Math.min(totalDays, endDay),
        isOpenEnded: false,
        notes: String(entry.animalCount),
      };
    });
    bars.sort((a, b) => a.startDay - b.startDay);
    return { herdId: category, herdName: category, bars };
  });

  return { herds, epochStart, totalDays, years };
}
