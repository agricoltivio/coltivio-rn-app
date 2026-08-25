export type UnitScale = { label: string; divisor: number };

// Scale a raw value + unit string to a human-friendly display unit.
// kg → g / kg / dt / t; l → ml / l / hl; anything else: no scaling.
export function scaleUnit(rawUnit: string, maxValue: number): UnitScale {
  if (rawUnit === "kg") {
    if (maxValue >= 1000) return { label: "t", divisor: 1000 };
    if (maxValue >= 100) return { label: "dt", divisor: 100 };
    if (maxValue >= 1) return { label: "kg", divisor: 1 };
    return { label: "g", divisor: 0.001 };
  }
  if (rawUnit === "l") {
    if (maxValue >= 100) return { label: "hl", divisor: 100 };
    if (maxValue >= 1) return { label: "l", divisor: 1 };
    return { label: "ml", divisor: 0.001 };
  }
  return { label: rawUnit, divisor: 1 };
}

// Drop decimals when they're not needed, otherwise show up to 1 decimal
export function formatNumber(n: number): string {
  return n === Math.floor(n)
    ? String(Math.round(n))
    : (Math.round(n * 10) / 10).toString();
}

export function formatYValue(raw: number, unitLabel: string): string {
  return `${formatNumber(raw)} ${unitLabel}`;
}

// e.g. "+0.6 dt" / "-0.7 dt" — formatNumber already prefixes negatives with "-"
export function formatSignedDelta(delta: number, unitLabel: string): string {
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${formatNumber(delta)} ${unitLabel}`;
}
