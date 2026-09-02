import { Image } from "expo-image";
import { StyleProp, View, ViewStyle } from "react-native";

import {
  GAP_TO_WORDMARK,
  MARK_TO_WORDMARK,
  WORDMARK_ASPECT,
} from "./brand";

type BrandLockupProps = {
  /** Width of the wordmark. The mark and the gap scale with it. */
  width: number;
  style?: StyleProp<ViewStyle>;
};

/** The reversed mark stacked over the reversed wordmark, for dark grounds. */
export function BrandLockup({ width, style }: BrandLockupProps) {
  return (
    <View style={[{ alignItems: "center" }, style]}>
      <Image
        source={require("@/assets/images/splash-mark.png")}
        contentFit="contain"
        style={{ width: width * MARK_TO_WORDMARK, aspectRatio: 1 }}
      />
      <Image
        source={require("@/assets/images/splash-wordmark.png")}
        contentFit="contain"
        style={{
          width,
          aspectRatio: WORDMARK_ASPECT,
          marginTop: width * GAP_TO_WORDMARK,
        }}
      />
    </View>
  );
}
