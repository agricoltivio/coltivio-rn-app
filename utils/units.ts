type Unit = "ml" | "l" | "g" | "kg" | "dt" | "t";

type UnitGroup = "volume" | "weight";

const unitGroups: Record<Unit, UnitGroup> = {
  ml: "volume",
  l: "volume",
  g: "weight",
  kg: "weight",
  dt: "weight",
  t: "weight",
};

const conversionFactors: Record<Unit, number> = {
  // volume (in liters)
  ml: 0.001,
  l: 1,

  // weight (in kg)
  g: 0.001,
  kg: 1,
  dt: 100,
  t: 1000,
};

// Check if two units are compatible (same group)
export function areUnitsCompatible(unitA: Unit, unitB: Unit): boolean {
  return unitGroups[unitA] === unitGroups[unitB];
}

// Convert from one unit to another (must be compatible)
export function convertUnit(value: number, from: Unit, to: Unit): number {
  if (!areUnitsCompatible(from, to)) {
    throw new Error(`Incompatible units: ${from} and ${to}`);
  }

  const group = unitGroups[from];

  if (group === "volume") {
    // Convert to liters, then to target
    const inLiters = value * conversionFactors[from];
    return inLiters / conversionFactors[to];
  } else if (group === "weight") {
    // Convert to kilograms, then to target
    const inKg = value * conversionFactors[from];
    return inKg / conversionFactors[to];
  }

  throw new Error(`Unknown unit group: ${group}`);
}
