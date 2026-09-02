import { useTranslation } from "react-i18next";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { Text } from "@/components/text/Text";
import { BrandBackground } from "./BrandBackground";
import { BrandLockup } from "./BrandLockup";
import { BRAND_ACCENT, LOCKUP_WIDTH, h, w } from "./brand";

// Positions measured off the brand mockup (assets/ph.png). Sizes scale with the
// screen width so the lockup keeps its proportions, positions scale with the
// height so the composition sits where the mockup puts it.
const LOCKUP_TOP = h(623);

// Text is placed by the midpoint between cap height and baseline rather than by
// a top edge: the height of a line box depends on the platform's font metrics,
// that midpoint does not.
const TAGLINE_CENTRE = h(1226);
const TAGLINE_SIZE = w(41.5);
const TAGLINE_TRACKING = -0.03;
const LOADING_CENTRE = h(2102);
const LOADING_SIZE = w(70);
const LOADING_TRACKING = -0.05;

const LINE_BOX = 1.3;

/**
 * The branded loading screen. The native splash can only centre one image on a
 * solid colour, so it holds the brand ground until this takes over and draws
 * the full composition: gradient, mark, wordmark, tagline, line art.
 */
export function SplashView() {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();

  const taglineSize = width * TAGLINE_SIZE;
  const loadingSize = width * LOADING_SIZE;

  const row = (centre: number, fontSize: number) => ({
    top: height * centre - (fontSize * LINE_BOX) / 2,
    height: fontSize * LINE_BOX,
  });

  return (
    <BrandBackground style={styles.container}>
      <BrandLockup
        width={width * LOCKUP_WIDTH}
        style={{ position: "absolute", top: height * LOCKUP_TOP }}
      />
      <View style={[styles.row, row(TAGLINE_CENTRE, taglineSize)]}>
        {/* Placeholder copy: the kit shipped the tagline in English only, the
            DE/FR/IT files are byte-identical copies of it. Swap the four
            splash.tagline strings once the real copy arrives. */}
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.text,
            {
              fontSize: taglineSize,
              letterSpacing: taglineSize * TAGLINE_TRACKING,
            },
          ]}
        >
          {t("splash.tagline")}
        </Text>
      </View>
      <View style={[styles.row, row(LOADING_CENTRE, loadingSize)]}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.text,
            {
              fontSize: loadingSize,
              letterSpacing: loadingSize * LOADING_TRACKING,
            },
          ]}
        >
          {t("splash.loading")}
        </Text>
      </View>
    </BrandBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  // German runs about a third longer than the English original, so the text
  // gets a bounded box and shrinks to fit rather than wrapping.
  row: {
    position: "absolute",
    maxWidth: "80%",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: BRAND_ACCENT,
    textAlign: "center",
    // Android otherwise adds ascent padding, which shifts the line inside its
    // box and breaks the alignment the ratios above are built on.
    includeFontPadding: false,
  },
});
