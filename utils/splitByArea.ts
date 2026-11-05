import { round } from "./math";

/**
 * Splits a total proportionally to the given area sizes, rounded to `precision`.
 * The last entry gets the rest so the parts always add up to the total. Areas that
 * sum to 0 (e.g. tiny drawn slivers rounded to 0 m²) are split equally.
 */
export function splitByArea(
  sizes: number[],
  total: number,
  precision: number,
): number[] {
  const totalSize = sizes.reduce((sum, size) => sum + size, 0);
  let divided = 0;
  return sizes.map((size, index) => {
    const amount =
      index === sizes.length - 1
        ? round(total - divided, precision)
        : round(
            total * (totalSize > 0 ? size / totalSize : 1 / sizes.length),
            precision,
          );
    divided += amount;
    return amount;
  });
}
