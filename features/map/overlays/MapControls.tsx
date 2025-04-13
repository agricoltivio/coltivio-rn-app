import React from "react";
import { Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  EdgeInsets,
  Rect,
  useSafeAreaFrame,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { inlineStyles } from "react-native-svg";
import styled, { useTheme } from "styled-components/native";

interface FrameProps {
  frame: Rect;
}

type MapControlsProps = {
  children?: React.ReactNode;
};

export const MapControls = ({ children }: MapControlsProps) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const isExpanded = useSharedValue(true);

  const toggleOverlay = () => {
    isExpanded.value = !isExpanded.value;
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: isExpanded.value
            ? withTiming(0, { duration: 300 })
            : withTiming(200, { duration: 700 }),
        },
        // {
        //   translateY: isExpanded.value
        //     ? withTiming(120 * 1, {
        //         duration: 700,
        //       })
        //     : withTiming(0, { duration: 400 }),
        // },
        // { scale: withTiming(isExpanded.value ? 1 : 0.5, { duration: 500 }) },
      ],
      opacity: isExpanded.value
        ? withTiming(1, { duration: 500 })
        : withTiming(0, { duration: 800 }),
      marginRight: withTiming(isExpanded.value ? theme.spacing.m : 0, {
        duration: 500,
      }),
    };
  });

  const expanButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: isExpanded.value
        ? withTiming(0)
        : withTiming(1, { duration: 1000 }),
    };
  });

  if (!children) {
    return null;
  }
  return (
    <>
      <MapControlsContainer insets={insets} style={[animatedStyle]}>
        <ExpandedToggleButton onPress={toggleOverlay}>
          <Text style={{ color: "#ddd", fontWeight: "bold", fontSize: 25 }}>
            →
          </Text>
        </ExpandedToggleButton>
        <MapControlsContent>{children}</MapControlsContent>
      </MapControlsContainer>
      <CollapsedToggleButtonContainer
        insets={insets}
        style={[expanButtonStyle]}
      >
        <CollapsedToggleButton onPress={toggleOverlay}>
          <Text style={{ color: "#ddd", fontWeight: "bold", fontSize: 25 }}>
            ←
          </Text>
        </CollapsedToggleButton>
      </CollapsedToggleButtonContainer>
    </>
  );
};

const MapControlsContainer = styled(Animated.View)<{ insets: EdgeInsets }>`
  position: absolute;
  right: 0px;
  top: ${({ insets, theme }) => insets.top + theme.spacing.s}px;
  /* height: 80px; */
  border-color: #ddd;
  border-width: 2px;
  border-radius: 20px;
  overflow: hidden;
  background-color: rgba(52, 52, 52, 0.4);
  /* flex-direction: row; */
`;

const ExpandedToggleButton = styled.TouchableOpacity`
  background-color: rgba(52, 52, 52, 0.4);
  padding: 10px;
  height: 60px;
  justify-content: center;
  align-items: center;
  /* width: 50px; */
  border-bottom-color: #ddd;
  border-bottom-width: 2px;
`;

const CollapsedToggleButtonContainer = styled(Animated.View)<{
  insets: EdgeInsets;
}>`
  position: absolute;
  right: 0px;
  top: ${({ insets, theme }) => insets.top + theme.spacing.s}px;
  background-color: rgba(52, 52, 52, 0.4);
  border-color: #ddd;
  border-width: 2px;
  border-radius: 20px;
  overflow: hidden;
`;

const CollapsedToggleButton = styled.TouchableOpacity`
  width: 60px;
  align-items: center;
  justify-content: center;
  height: 60px;
`;

const MapControlsContent = styled.View`
  padding: 10px;
  align-items: center;
  justify-content: center;
  /* flex-direction: row; */
  gap: 10px;
  overflow: hidden;
`;
