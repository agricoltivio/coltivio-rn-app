import { Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { TextStyle } from "react-native";

export const FONT_REGULAR = "Inter_400Regular";
export const FONT_BOLD = "Inter_700Bold";

export function useAppFonts() {
  return useFonts({ Inter_400Regular, Inter_700Bold });
}

// Custom fonts don't have a single family with multiple weights baked in like
// system fonts do — Inter_400Regular and Inter_700Bold are two entirely
// separate font families, so we have to pick the right one ourselves based on
// the requested weight instead of letting fontWeight select a variant.
export function isBoldFontWeight(fontWeight: TextStyle["fontWeight"]) {
  if (fontWeight == null) return false;
  if (fontWeight === "bold") return true;
  const numeric =
    typeof fontWeight === "number" ? fontWeight : parseInt(fontWeight, 10);
  return !Number.isNaN(numeric) && numeric >= 600;
}
