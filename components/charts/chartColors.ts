import { ColtivioTheme } from "@/theme/theme";

export function getYearColor(theme: ColtivioTheme, index: number): string {
  const years = theme.charts.years;
  return years[index % years.length];
}
