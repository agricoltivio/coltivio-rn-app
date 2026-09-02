export interface ColtivioTheme {
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string; // semantic: secondary button fill
    accent: string;
    buttonPrimary: string; // primary filled button background
    amber: string; // orange accent — wiki, map polygon highlights
    success: string;
    danger: string;
    warning: string;
    blue: string;
    black: string;
    gray0: string;
    gray1: string;
    gray2: string;
    gray3: string;
    gray4: string;
    gray5: string;
    white: string;
  };
  map: {
    defaultStrokeWidth: number;
    defaultFillAlpha: number;
    defaultFillColor: string;
  };
  spacing: {
    xxs: number;
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  };
  radii: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  };
  charts: {
    years: string[];
    grid: string;
    axisLabel: string;
  };
}

export const coltivioTheme: ColtivioTheme = {
  colors: {
    // Secondary2 (#e6e6a5) from the kit was tried here and reverted: as a
    // full-bleed surface it is too much colour. It stays an accent.
    background: "#f6f6f6",
    text: "#212123",
    primary: "#2a5159",
    // Secondary1 from the brand kit. Carries a dark label: white on this green
    // is 1.76:1. It is the fill that still reads on the brand gradient, which
    // is why the auth screens use it.
    secondary: "#82d59d",
    accent: "#F4FAFB",
    // Primary1 from the brand kit, same value as `primary`. White label at
    // 8.68:1, and 6.71:1 against the background, so it is the strong fill on
    // light surfaces.
    buttonPrimary: "#2a5159",
    amber: "#DB751D", // wiki styling, map polygon highlights, sign-in accent
    success: "#85A60F",
    danger: "#CD0E61",
    warning: "#FFC745",
    blue: "#4285F4",
    black: "#212123",
    gray0: "#111111",
    gray1: "#555555",
    gray2: "#777777",
    gray3: "#999999",
    gray4: "#dddddd",
    gray5: "#f7f7f7",
    white: "#ffffff",
  },
  map: {
    defaultStrokeWidth: 1,
    defaultFillAlpha: 0.5,
    defaultFillColor: "#4285F4",
  },
  spacing: {
    xxs: 4,
    xs: 8,
    s: 10,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  radii: {
    xs: 0,
    s: 3,
    m: 6,
    l: 12,
    xl: 20,
    xxl: 1000,
  },
  charts: {
    years: [
      "#4A90D9",
      "#E67E22",
      "#2ECC71",
      "#9B59B6",
      "#E74C3C",
      "#1ABC9C",
      "#F39C12",
      "#3498DB",
      "#8E44AD",
      "#27AE60",
    ],
    grid: "#dddddd", // gray4
    axisLabel: "#777777", // gray2
  },
};

export function hexToRgba(hex: string, alpha = 1) {
  hex = hex.replace(/^#/, "");

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function numberToColor(num: number) {
  return stringToColor(seededRandomString(num));
}

// Stable color derived from a plot's ID. djb2 hash → hue on golden-angle walk.
// Same plot always gets the same color regardless of list order.
export function plotIdToColor(id: string): string {
  let hash = 5381;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) + hash + id.charCodeAt(i)) & 0x7fffffff;
  }
  return hueToHex((hash * 137.508) % 360);
}

// Golden-ratio hue walk for sequential indices (used for split-mode pieces).
function hueToHex(h: number): string {
  const s = 0.65;
  const l = 0.55;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function indexToDistinctColor(index: number): string {
  return hueToHex((index * 137.508) % 360);
}
function seededRandomString(seed: number, length = 10) {
  // Linear Congruential Generator (LCG) for deterministic pseudo-random numbers
  let state = seed;
  const rand = () => {
    state = (state * 1664525 + 1013904223) % 0x100000000;
    return state / 0x100000000;
  };

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(rand() * chars.length)];
  }
  return result;
}

export function stringToDynamicColor(value: string) {
  // let hash = 0;
  // for (let i = 0; i < value.length; i++) {
  //   hash = value.charCodeAt(i) + ((hash << 5) - hash);
  // }

  // const r = (Math.abs((hash & 0xff0000) >> 16) % 200) + 55; // Limit to 55-255
  // const g = (Math.abs((hash & 0x00ff00) >> 8) % 200) + 55; // Limit to 55-255
  // const b = (Math.abs(hash & 0x0000ff) % 200) + 55; // Limit to 55-255

  // return `rgb(${r}, ${g}, ${b})`;
  // Generate a hash from the string
  // Generate a hash from the string
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Map hash to RGB values
  const r = (Math.abs((hash & 0xff0000) >> 16) % 200) + 55; // Red: 55-255
  const g = (Math.abs((hash & 0x00ff00) >> 8) % 200) + 55; // Green: 55-255
  const b = (Math.abs(hash & 0x0000ff) % 200) + 55; // Blue: 55-255

  return `rgb(${r}, ${g}, ${b})`;
}

const palette = [
  "#FF6384", // Pink
  "#36A2EB", // Light Blue
  "#FFCE56", // Yellow
  "#4BC0C0", // Teal
  "#9966FF", // Purple
  // "#FF9F40", // Orange
  // "#C9CBCF", // Gray
  "#8E44AD", // Deep Purple
  "#2ECC71", // Green
  "#E74C3C", // Red
  "#3498DB", // Blue
];

export function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}
