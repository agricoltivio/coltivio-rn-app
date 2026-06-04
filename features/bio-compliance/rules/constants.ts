// MVP baked Bio Suisse (Knospe) thresholds.
//
// Client-side, indicative rule set. A logically identical mirror lives in
// coltivio-web (src/lib/bioCompliance). The single source of truth moves to a
// date-effective backend rule engine in v2.
// See coltivio-internal/market-research/biosuisse-compliance-module-feasibility.md (section 8).

export const ANTIBIOTIC_MAX_PER_YEAR = 3;
export const ANTIBIOTIC_MAX_PER_YEAR_SHORT_LIVED = 1;
export const SHORT_LIVED_LIFECYCLE_DAYS = 365;

// Bio applies double the statutory withdrawal period. Stored waiting-days are
// the standard legal values, so we double them client-side.
export const WITHDRAWAL_BIO_FACTOR = 2;

// Cattle RAUS minimums (days per month).
export const RAUS_VEGETATION_MIN_DAYS = 26;
export const RAUS_WINTER_MIN_DAYS = 13;
// Vegetation period: April (3) through October (9), zero-indexed months.
export const VEGETATION_MONTHS = [3, 4, 5, 6, 7, 8, 9];
