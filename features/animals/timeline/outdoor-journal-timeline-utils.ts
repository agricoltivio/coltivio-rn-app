import { differenceInCalendarDays } from "date-fns";
import {
  OutdoorJournalEntry,
  OutdoorJournalMeadowEntry,
} from "@/api/outdoor-journal.api";
import {
  OutdoorTimelineData,
  OutdoorHerdData,
  OutdoorBar,
  getTimelineEpoch,
} from "./outdoor-timeline-utils";

// Day range of a journal entry on the timeline. Calendar days keep consecutive days
// adjacent across daylight-saving changes, and an entry always covers at least its
// own day — single-day entries (e.g. weekday stays) would otherwise have no width.
function entryDayRange(
  startDate: string,
  endDate: string,
  epochStart: Date,
): { startDay: number; endDay: number } {
  const startDay = differenceInCalendarDays(new Date(startDate), epochStart);
  const endDay = Math.max(
    differenceInCalendarDays(new Date(endDate), epochStart),
    startDay + 1,
  );
  return { startDay, endDay };
}

// Joins bars that touch or overlap and describe the same stay, so consecutive
// single-day entries render as one continuous bar. Expects bars sorted by startDay.
function mergeTouchingBars(
  sortedBars: OutdoorBar[],
  isSameStay: (previous: OutdoorBar, next: OutdoorBar) => boolean,
): OutdoorBar[] {
  const merged: OutdoorBar[] = [];
  for (const bar of sortedBars) {
    const previous = merged[merged.length - 1];
    if (
      previous &&
      bar.startDay <= previous.endDay &&
      isSameStay(previous, bar)
    ) {
      if (bar.endDay > previous.endDay) {
        previous.endDay = bar.endDay;
        previous.endDate = bar.endDate;
      }
    } else {
      merged.push({ ...bar });
    }
  }
  return merged;
}

// Builds OutdoorTimelineData from journal entries.
// Each category becomes a row, each entry becomes a bar.
export function buildJournalTimelineData(
  entries: OutdoorJournalEntry[],
): OutdoorTimelineData {
  const { years, epochStart, totalDays, todayDay } = getTimelineEpoch(
    entries.map((entry) => entry.startDate),
  );

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
      const { startDay, endDay } = entryDayRange(
        entry.startDate,
        entry.endDate,
        epochStart,
      );
      return {
        scheduleId: `${category}-${idx}`,
        herdName: category,
        herdId: category,
        startDay: Math.max(0, startDay),
        endDay: Math.min(totalDays, endDay),
        isOpenEnded: false,
        isFuture: startDay > todayDay,
        notes: String(entry.animalCount),
        animalCount: entry.animalCount,
        startDate: entry.startDate,
        endDate: entry.endDate,
      };
    });
    bars.sort((a, b) => a.startDay - b.startDay);
    return {
      herdId: category,
      herdName: category,
      bars: mergeTouchingBars(
        bars,
        (previous, next) => previous.animalCount === next.animalCount,
      ),
    };
  });

  return { herds, epochStart, totalDays, years };
}

// Builds OutdoorTimelineData from meadow journal entries.
// Each meadow becomes a row, each herd stay on it becomes a bar labelled with the herd name.
export function buildMeadowJournalTimelineData(
  entries: OutdoorJournalMeadowEntry[],
): OutdoorTimelineData {
  const { years, epochStart, totalDays, todayDay } = getTimelineEpoch(
    entries.map((entry) => entry.startDate),
  );

  // Group entries by meadow
  const byMeadow = new Map<string, OutdoorJournalMeadowEntry[]>();
  for (const entry of entries) {
    const group = byMeadow.get(entry.meadowId) ?? [];
    group.push(entry);
    byMeadow.set(entry.meadowId, group);
  }

  // Always show at least a placeholder row so the timeline renders when empty
  if (byMeadow.size === 0) {
    return {
      herds: [{ herdId: "_empty", herdName: "–", bars: [] }],
      epochStart,
      totalDays,
      years,
    };
  }

  const rows: OutdoorHerdData[] = [...byMeadow.entries()].map(
    ([meadowId, meadowEntries]) => {
      const meadowName = meadowEntries[0].meadowName;
      const bars: OutdoorBar[] = meadowEntries.map((entry, idx) => {
        const { startDay, endDay } = entryDayRange(
          entry.startDate,
          entry.endDate,
          epochStart,
        );
        return {
          scheduleId: `${meadowId}-${idx}`,
          herdName: entry.herdName,
          herdId: entry.herdId,
          startDay: Math.max(0, startDay),
          endDay: Math.min(totalDays, endDay),
          isOpenEnded: false,
          isFuture: startDay > todayDay,
          notes: entry.herdName,
          scheduleType: entry.type,
          animalCount: entry.animalCount,
          startDate: entry.startDate,
          endDate: entry.endDate,
          meadowName: entry.meadowName,
          meadowSize: entry.meadowSize,
        };
      });
      bars.sort((a, b) => a.startDay - b.startDay);
      const mergedBars = mergeTouchingBars(
        bars,
        (previous, next) =>
          previous.herdId === next.herdId &&
          previous.scheduleType === next.scheduleType &&
          previous.animalCount === next.animalCount,
      );

      // Herds on the meadow at the same time get separate lanes. Each herd keeps
      // its previous lane when it's free, otherwise takes the first free one.
      const laneEndDays: number[] = [];
      const lastLaneByHerd = new Map<string, number>();
      for (const bar of mergedBars) {
        const preferredLane = lastLaneByHerd.get(bar.herdId);
        let lane =
          preferredLane !== undefined &&
          laneEndDays[preferredLane] <= bar.startDay
            ? preferredLane
            : laneEndDays.findIndex((endDay) => endDay <= bar.startDay);
        if (lane === -1) lane = laneEndDays.length;
        laneEndDays[lane] = bar.endDay;
        lastLaneByHerd.set(bar.herdId, lane);
        bar.lane = lane;
      }

      return {
        herdId: meadowId,
        herdName: meadowName,
        bars: mergedBars,
        laneCount: Math.max(1, laneEndDays.length),
      };
    },
  );
  // Most recently used meadows on top; ties by name
  const lastDay = (row: OutdoorHerdData) =>
    Math.max(-1, ...row.bars.map((bar) => bar.endDay));
  rows.sort(
    (a, b) => lastDay(b) - lastDay(a) || a.herdName.localeCompare(b.herdName),
  );

  return { herds: rows, epochStart, totalDays, years };
}
