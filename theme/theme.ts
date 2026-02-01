export interface ColtivioTheme {
  colors: {
    background: string;
    text: string;
    primaryText: string;
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    danger: string;
    error: string;
    failure: string;
    yellow: string;
    black: string;
    darkBlue: string;
    blue: string;
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
}

const colorPalette = {
  purple: "#5A31F4",
  green: "#0ECD9D",
  red: "#CD0E61",
  black: "#0B0B0B",
  white: "#F0F2F3",
  gray0: "#111111",
  gray1: "#555555",
  gray2: "#777777",
  gray3: "#999999",
  gray4: "#eeeeee",
};

export const coltivioTheme: ColtivioTheme = {
  colors: {
    // background: "#EBF7FA",
    background: "#f6f6f6",
    // background: "#FFF1E5",
    // background: "#FDF1E7",
    // background: "#9ca498",
    // background: hexToRgba("#212123", 0.3),
    text: "#212123",
    primaryText: "#2a5159",
    // primary: "#8C4227 ",
    primary: "#2a5159",
    secondary: "#DB751D", // https://mobilepalette.netlify.app/?color=2a5159
    accent: "#F4FAFB",
    // #85A60F additional one
    success: "#85A60F",
    danger: "#CD0E61",
    failure: "#CD0E61",
    yellow: "#FFC745",
    darkBlue: "1E3A8A",
    blue: "#4285F4",
    error: "#CD0E61",
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

const colorMap = new Map();

export function stringToColor(str: string) {
  if (colorMap.has(str)) return colorMap.get(str);

  // Generate hash and map to the palette
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let index = Math.abs(hash) % palette.length;

  // Collision resolution: find the next available color
  while ([...colorMap.values()].includes(palette[index])) {
    index = (index + 1) % palette.length;
  }

  const color = palette[index];
  colorMap.set(str, color);
  return color;
}
