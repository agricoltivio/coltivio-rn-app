import { isNeighbourPage, loopPageIndex } from "./ChartPager";

describe("loopPageIndex", () => {
  it("maps the leading copy to the last card", () => {
    expect(loopPageIndex(0, 4)).toBe(3);
  });

  it("maps the trailing copy to the first card", () => {
    expect(loopPageIndex(5, 4)).toBe(0);
  });

  it("shifts the real cards by one", () => {
    expect([1, 2, 3, 4].map((index) => loopPageIndex(index, 4))).toEqual([
      0, 1, 2, 3,
    ]);
  });

  it("works with two cards", () => {
    expect([0, 1, 2, 3].map((index) => loopPageIndex(index, 2))).toEqual([
      1, 0, 1, 0,
    ]);
  });
});

describe("isNeighbourPage", () => {
  it("counts the card itself and the ones directly before and after", () => {
    expect(isNeighbourPage(2, 2, 5)).toBe(true);
    expect(isNeighbourPage(1, 2, 5)).toBe(true);
    expect(isNeighbourPage(3, 2, 5)).toBe(true);
    expect(isNeighbourPage(0, 2, 5)).toBe(false);
    expect(isNeighbourPage(4, 2, 5)).toBe(false);
  });

  it("counts around the loop", () => {
    expect(isNeighbourPage(4, 0, 5)).toBe(true);
    expect(isNeighbourPage(0, 4, 5)).toBe(true);
    expect(isNeighbourPage(3, 0, 5)).toBe(false);
  });
});
