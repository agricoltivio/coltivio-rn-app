import { ColtivioTheme } from "@/theme/theme";

export function getYearColor(theme: ColtivioTheme, index: number): string {
  const years = theme.charts.years;
  return years[index % years.length];
}

// HSL-based color from string, used for e.g. animal-type coloring
export function animalTypeColor(type: string): string {
  let hash = 0;
  for (let i = 0; i < type.length; i++)
    hash = type.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 40%)`;
}

// Convert an HSL string to a hex-compatible form for SVG (react-native-svg doesn't support hsl())
// We derive r,g,b from the hsl values directly.
export function hslToHex(hslStr: string): string {
  const match = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return "#888888";
  const h = Number(match[1]) / 360;
  const s = Number(match[2]) / 100;
  const l = Number(match[3]) / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
