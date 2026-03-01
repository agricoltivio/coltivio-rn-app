import { useNavigation } from "@react-navigation/native";
import { useRef } from "react";
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
  // Use a ref to avoid re-rendering this component when scroll threshold changes —
  // a re-render during keyboard-induced auto-scroll can steal input focus on the simulator.
  const scrolledRef = useRef(false);

  const handleScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 50 && !scrolledRef.current) {
      scrolledRef.current = true;
      navigation.setOptions({
        headerStyle: { backgroundColor: "white" },
        headerShadowVisible: true,
        title: headerTitleOnScroll,
      });
    } else if (offsetY <= 50 && scrolledRef.current) {
      scrolledRef.current = false;
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
