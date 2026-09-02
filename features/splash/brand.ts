// Proportions taken from the brand mockup (assets/ph.png, a 1320x2868 canvas).
// Everything the splash and the sign-in screen share lives here so the two
// cannot drift apart.

export const BRAND_GRADIENT = ["#2b525a", "#73aea2"] as const;
export const BRAND_ACCENT = "#82d59d";
export const BRAND_OFF_WHITE = "#f4fafb";

export const MOCKUP_WIDTH = 1320;
export const MOCKUP_HEIGHT = 2868;

/** Fraction of the mockup width. */
export const w = (px: number) => px / MOCKUP_WIDTH;
/** Fraction of the mockup height. */
export const h = (px: number) => px / MOCKUP_HEIGHT;

// The lockup measured on the mockup: a 267px mark, a 147px gap, then a 546x121
// wordmark. Expressing the mark and the gap relative to the wordmark width lets
// the whole lockup be driven by a single size and still match the mockup.
export const WORDMARK_WIDTH = 546;
export const MARK_TO_WORDMARK = 267 / WORDMARK_WIDTH;
export const GAP_TO_WORDMARK = 147 / WORDMARK_WIDTH;
export const WORDMARK_ASPECT = WORDMARK_WIDTH / 121;

/** Wordmark width as a fraction of the screen width, as on the mockup. */
export const LOCKUP_WIDTH = w(WORDMARK_WIDTH);

/**
 * Top inset for auth screens. Their header floats over the gradient, so the
 * content has to clear it by hand instead of relying on the header's own height.
 */
export const AUTH_HEADER_OFFSET = 56;
