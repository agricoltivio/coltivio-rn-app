import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  ScrollViewProps as RnScrollViewProps,
  ScrollView as RnScrollView,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useTheme } from "styled-components/native";

type HeaderProps = {
  keyboardAware?: boolean;
  showHeaderOnScroll?: boolean;
  headerTitleOnScroll?: string;
  keyboardBottomOffset?: number;
};
export type ScrollViewProps = RnScrollViewProps & HeaderProps;
export function ScrollView({
  showHeaderOnScroll,
  headerTitleOnScroll,
  keyboardAware = true,
  keyboardBottomOffset = 40,
  ...props
}: ScrollViewProps) {
  const theme = useTheme();
  const navigation = useNavigation();
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 50 && !scrolled) {
      setScrolled(true);
      navigation.setOptions({
        headerStyle: { backgroundColor: "white" },
        headerShadowVisible: true,
        title: headerTitleOnScroll,
      });
    } else if (offsetY <= 50 && scrolled) {
      setScrolled(false);
      navigation.setOptions({
        headerStyle: { backgroundColor: theme.colors.gray5 },
        headerShadowVisible: false,
        title: "",
      });
    }
  };
  const handleScrollEvent = showHeaderOnScroll ? handleScroll : undefined;
  return keyboardAware ? (
    <KeyboardAwareScrollView
      bottomOffset={keyboardBottomOffset}
      keyboardShouldPersistTaps="handled"
      onScroll={handleScrollEvent}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: 30 }}
      {...props}
    />
  ) : (
    <RnScrollView
      keyboardShouldPersistTaps="handled"
      onScroll={handleScrollEvent}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: 30 }}
      {...props}
    />
  );
}
