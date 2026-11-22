import {
  STATS_FOLDED_ROW_COUNT,
  StatsTableRow,
  statsDisplayRows,
} from "./StatsTable";

function makeRows(count: number): StatsTableRow[] {
  return Array.from({ length: count }, (_, index) => ({
    key: `row-${index}`,
    label: `Row ${index}`,
    values: { 2026: String(index) },
  }));
}

describe("statsDisplayRows", () => {
  it("shows all rows when the table is short", () => {
    const rows = makeRows(STATS_FOLDED_ROW_COUNT);
    const displayRows = statsDisplayRows({
      rows,
      canFold: true,
      showAllRows: false,
    });
    expect(displayRows.map((displayRow) => displayRow.kind)).toEqual(
      rows.map(() => "row"),
    );
  });

  it("folds a long table into the first rows and a 'N more' row", () => {
    const rows = makeRows(STATS_FOLDED_ROW_COUNT + 3);
    const displayRows = statsDisplayRows({
      rows,
      canFold: true,
      showAllRows: false,
    });
    expect(displayRows).toHaveLength(STATS_FOLDED_ROW_COUNT);
    expect(displayRows.at(-1)).toEqual({
      kind: "show-more",
      key: "toggle",
      hiddenCount: 4,
    });
    expect(displayRows[0]).toEqual({ kind: "row", key: "row-0", row: rows[0] });
  });

  it("shows all rows and a 'Less' row when unfolded", () => {
    const rows = makeRows(STATS_FOLDED_ROW_COUNT + 3);
    const displayRows = statsDisplayRows({
      rows,
      canFold: true,
      showAllRows: true,
    });
    expect(displayRows).toHaveLength(rows.length + 1);
    expect(displayRows.at(-1)).toEqual({ kind: "show-less", key: "toggle" });
  });

  it("never folds without a toggle handler", () => {
    const rows = makeRows(STATS_FOLDED_ROW_COUNT + 3);
    const displayRows = statsDisplayRows({
      rows,
      canFold: false,
      showAllRows: false,
    });
    expect(displayRows).toHaveLength(rows.length);
    expect(displayRows.every((displayRow) => displayRow.kind === "row")).toBe(
      true,
    );
  });

  it("ignores showAllRows on a short table", () => {
    const rows = makeRows(3);
    const displayRows = statsDisplayRows({
      rows,
      canFold: true,
      showAllRows: true,
    });
    expect(displayRows).toHaveLength(3);
  });
});
