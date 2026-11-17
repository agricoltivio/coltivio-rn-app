import { describe, expect, test } from "@jest/globals";
import { monthlyAnchorDay } from "./task-recurrence-anchor";

describe("monthlyAnchorDay", () => {
  test("new monthly task anchors on the due date's day", () => {
    expect(monthlyAnchorDay("monthly", "2027-01-31")).toBe(31);
    expect(monthlyAnchorDay("monthly", "2027-03-05")).toBe(5);
  });

  test("no anchor without due date or for other frequencies", () => {
    expect(monthlyAnchorDay("monthly", undefined)).toBeUndefined();
    expect(monthlyAnchorDay("monthly", null)).toBeUndefined();
    expect(monthlyAnchorDay("weekly", "2027-01-31")).toBeUndefined();
    expect(monthlyAnchorDay("yearly", "2027-01-31")).toBeUndefined();
  });

  test("keeps the loaded anchor while the due date is unchanged", () => {
    const loaded = {
      frequency: "monthly",
      dueDate: "2027-02-28",
      byMonthDay: 31,
    };
    expect(monthlyAnchorDay("monthly", "2027-02-28", loaded)).toBe(31);
  });

  test("follows a changed due date", () => {
    const loaded = {
      frequency: "monthly",
      dueDate: "2027-02-28",
      byMonthDay: 31,
    };
    expect(monthlyAnchorDay("monthly", "2027-02-15", loaded)).toBe(15);
  });

  test("sets an anchor on tasks saved without one", () => {
    const loaded = {
      frequency: "monthly",
      dueDate: "2027-01-31",
      byMonthDay: null,
    };
    expect(monthlyAnchorDay("monthly", "2027-01-31", loaded)).toBe(31);
  });

  test("ignores the loaded anchor when switching to monthly", () => {
    const loaded = {
      frequency: "weekly",
      dueDate: "2027-01-31",
      byMonthDay: 3,
    };
    expect(monthlyAnchorDay("monthly", "2027-01-31", loaded)).toBe(31);
  });

  test("drops the anchor when switching away from monthly", () => {
    const loaded = {
      frequency: "monthly",
      dueDate: "2027-01-31",
      byMonthDay: 31,
    };
    expect(monthlyAnchorDay("weekly", "2027-01-31", loaded)).toBeUndefined();
  });
});
