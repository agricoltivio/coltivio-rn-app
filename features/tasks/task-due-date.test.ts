import { isTaskOverdue } from "./task-due-date";

describe("isTaskOverdue", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 21, 9, 30));
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it("is not overdue on the due day", () => {
    expect(isTaskOverdue(new Date(2026, 10, 21))).toBe(false);
  });

  it("is overdue from the day after", () => {
    expect(isTaskOverdue(new Date(2026, 10, 20))).toBe(true);
  });

  it("handles date strings like the API returns them", () => {
    expect(isTaskOverdue("2026-11-21")).toBe(false);
    expect(isTaskOverdue("2026-11-20T00:00:00.000Z")).toBe(true);
  });

  it("is not overdue for a future date", () => {
    expect(isTaskOverdue(new Date(2026, 10, 22))).toBe(false);
  });
});
