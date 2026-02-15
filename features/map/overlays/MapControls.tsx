import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import styled, { useTheme } from "styled-components/native";

type MapControlsProps = {
  children?: React.ReactNode;
  initiallyExpanded?: boolean;
  // Controlled mode: if provided, expand/collapse is driven from parent
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
};

export const MapControls = ({
  children,
  initiallyExpanded = true,
  expanded,
  onToggle,
}: MapControlsProps) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const isControlled = expanded !== undefined;
  const isExpanded = useSharedValue(
    isControlled ? expanded : initiallyExpanded,
  );

  // Sync shared value with controlled prop
  useEffect(() => {
    if (isControlled) {
      isExpanded.value = expanded;
    }
  }, [expanded, isControlled]);

  const toggleOverlay = () => {
    const next = !isExpanded.value;
    isExpanded.value = next;
    if (onToggle) {
      onToggle(next);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: isExpanded.value
            ? withTiming(0, { duration: 300 })
            : withTiming(200, { duration: 700 }),
        },
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
          <MaterialCommunityIcons name="tools" size={30} color="#ddd" />
          {/* <Text style={{ color: "#ddd", fontWeight: "bold", fontSize: 25 }}> */}
          {/* ← */}
          {/* </Text> */}
        </CollapsedToggleButton>
      </CollapsedToggleButtonContainer>
    </>
  );
};

const MapControlsContainer = styled(Animated.View)<{ insets: EdgeInsets }>`
  position: absolute;
  right: 0px;
  top: ${({ insets, theme }) => insets.top + theme.spacing.s}px;
  border-color: #ddd;
  border-width: 2px;
  border-radius: 20px;
  overflow: hidden;
  background-color: rgba(52, 52, 52, 0.4);
`;

const ExpandedToggleButton = styled.TouchableOpacity`
  background-color: rgba(52, 52, 52, 0.4);
  padding: 10px;
  height: 60px;
  justify-content: center;
  align-items: center;
  border-bottom-color: #ddd;
  border-bottom-width: 2px;
`;

const CollapsedToggleButtonContainer = styled(Animated.View)<{
  insets: EdgeInsets;
}>`
  position: absolute;
  right: 0px;
  top: ${({ insets, theme }) => insets.top + theme.spacing.s}px;
  background-color: rgba(52, 52, 52, 0.8);
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
  gap: 10px;
  overflow: hidden;
`;
