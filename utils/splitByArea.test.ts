import { splitByArea } from "./splitByArea";

describe("splitByArea", () => {
  it("splits proportionally and gives the rest to the last part", () => {
    expect(splitByArea([1000, 2000], 10, 2)).toEqual([3.33, 6.67]);
  });

  it("keeps whole pieces with precision 0", () => {
    const parts = splitByArea([1, 1, 1], 100, 0);
    expect(parts).toEqual([33, 33, 34]);
    expect(parts.reduce((sum, part) => sum + part, 0)).toBe(100);
  });

  it("splits equally when all sizes are 0", () => {
    expect(splitByArea([0, 0], 10, 2)).toEqual([5, 5]);
  });
});
