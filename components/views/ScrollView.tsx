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

  const handleScroll = (event: {
    nativeEvent: { contentOffset: { y: number } };
  }) => {
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
        headerStyle: { backgroundColor: theme.colors.background },
        headerShadowVisible: false,
        title: "",
      });
    }
  };
  // Calls both our handler and a passed one: a list using this as its scroll
  // component passes its own onScroll, which it needs for virtualization
  const { onScroll: passedOnScroll, ...otherProps } = props;
  const handleScrollEvent: RnScrollViewProps["onScroll"] =
    showHeaderOnScroll || passedOnScroll
      ? (event) => {
          if (showHeaderOnScroll) handleScroll(event);
          passedOnScroll?.(event);
        }
      : undefined;
  return keyboardAware ? (
    <KeyboardAwareScrollView
      bottomOffset={keyboardBottomOffset}
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: 30 }}
      {...otherProps}
      onScroll={handleScrollEvent}
    />
  ) : (
    <RnScrollView
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: 30 }}
      {...otherProps}
      onScroll={handleScrollEvent}
    />
  );
}
