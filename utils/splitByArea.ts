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
    // the entered total has up to 2 decimals, so the rest is rounded to 2 as
    // well, otherwise it wouldn't sum back to the total with a lower precision
    const rest = round(total - divided, 2);
    const amount =
      index === sizes.length - 1
        ? rest
        : // capped so rounding up many small parts can't leave a negative rest
          Math.min(
            round(
              total * (totalSize > 0 ? size / totalSize : 1 / sizes.length),
              precision,
            ),
            rest,
          );
    divided += amount;
    return amount;
  });
}

export type DivisionError =
  | "invalid_number"
  | "divided_amount_too_big"
  | "not_all_divided"
  | "greater_than_zero";

export type DivisionCheck = {
  // Sum of the valid entries, rounded to 2 decimals
  totalDivided: number;
  remaining: number;
  // First problem found; the names match the forms.validation.* translation keys
  error: DivisionError | null;
};

/**
 * Checks per-plot entries of a divide step against the total. Empty entries count
 * as 0. An entry that isn't a finite number (e.g. ".") is an error: silently
 * dropping it would save less than the entered total.
 */
export function validateDivision(
  entries: (string | undefined)[],
  total: number,
): DivisionCheck {
  let hasInvalidEntry = false;
  let hasEntryAboveZero = false;
  let sum = 0;
  for (const entry of entries) {
    const trimmed = entry?.trim() ?? "";
    if (trimmed === "") continue;
    const value = Number(trimmed);
    if (!Number.isFinite(value) || value < 0) {
      hasInvalidEntry = true;
      continue;
    }
    if (value > 0) hasEntryAboveZero = true;
    sum += value;
  }
  const totalDivided = round(sum, 2);
  const remaining = round(total - totalDivided, 2);

  let error: DivisionError | null = null;
  if (hasInvalidEntry) error = "invalid_number";
  else if (remaining < 0) error = "divided_amount_too_big";
  else if (remaining > 0) error = "not_all_divided";
  // at least one plot has to get something, otherwise nothing would be saved
  else if (!hasEntryAboveZero) error = "greater_than_zero";
  return { totalDivided, remaining, error };
}
