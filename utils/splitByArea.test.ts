import { splitByArea, validateDivision } from "./splitByArea";

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

  it("splits each part relative to the total with three or more parts", () => {
    // reported case: 5 loads on 99.5 a, 27.1 a and 27.5 a
    expect(splitByArea([9950, 2710, 2750], 5, 2)).toEqual([3.23, 0.88, 0.89]);
  });

  it("never leaves a negative rest for the last part", () => {
    const parts = splitByArea([1, 1, 1, 1, 1, 1], 3, 0);
    expect(parts).toEqual([1, 1, 1, 0, 0, 0]);
  });

  it("gives the last part the decimal rest of a total with lower precision", () => {
    expect(splitByArea([1, 1], 5.5, 0)).toEqual([3, 2.5]);
  });
});

describe("validateDivision", () => {
  it("accepts entries that add up to the total", () => {
    expect(validateDivision(["4", "6"], 10)).toEqual({
      totalDivided: 10,
      remaining: 0,
      error: null,
    });
  });

  it("rejects an entry that isn't a number instead of dropping it", () => {
    const check = validateDivision([".", "6"], 10);
    expect(check.error).toBe("invalid_number");
    // the remaining amount stays a number for display
    expect(check.remaining).toBe(4);
  });

  it("counts empty entries as 0", () => {
    expect(validateDivision(["", "10"], 10).error).toBeNull();
  });

  it("reports too much or too little divided", () => {
    expect(validateDivision(["5", "6"], 10).error).toBe(
      "divided_amount_too_big",
    );
    expect(validateDivision(["4", "5"], 10).error).toBe("not_all_divided");
  });

  it("requires at least one entry above 0", () => {
    expect(validateDivision(["0", "0"], 0).error).toBe("greater_than_zero");
  });
});
