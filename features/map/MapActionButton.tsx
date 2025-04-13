import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";

type MapActionProps = {
  isExpanded: SharedValue<boolean>;
  index: number;
  label: string;
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
  duration: 1200,
  overshootClamping: true,
  dampingRatio: 0.8,
};

const OFFSET = 63;

const MapAction = ({ isExpanded, index, label, onPress }: MapActionProps) => {
  const animatedStyles = useAnimatedStyle(() => {
    const moveValue = isExpanded.value ? OFFSET * index : 0;
    const translateValue = withSpring(-moveValue, SPRING_CONFIG);
    const delay = index * 100;

    const scaleValue = isExpanded.value ? 1 : 0;

    return {
      transform: [
        { translateY: translateValue },
        {
          scale: withDelay(
            isExpanded.value ? delay : 0,
            withTiming(scaleValue, { duration: 200 })
          ),
        },
      ],
    };
  });

  return (
    <FloatingActionButton style={[animatedStyles]} onPress={onPress}>
      <FloatingActionButtonText numberOfLines={1}>
        {label}
      </FloatingActionButtonText>
    </FloatingActionButton>
  );
};

export enum MapActionType {
  MANAGE_PARCELS = "MANAGE_PARCELS",
  HAY_HARVEST = "HAY_HARVEST",
  FERTILIZATION = "FERTILIZATION",
}

export type MapActionButtonProps = {
  onMapActionSelected: (mapAction: MapActionType) => void;
};
export function MapActionButton({ onMapActionSelected }: MapActionButtonProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isExpanded = useSharedValue(false);

  const handlePress = () => {
    isExpanded.value = !isExpanded.value;
  };

  const plusIconStyle = useAnimatedStyle(() => {
    const moveValue = interpolate(Number(isExpanded.value), [0, 1], [0, 2]);
    const translateValue = withTiming(moveValue);
    const rotateValue = isExpanded.value ? "45deg" : "0deg";

    return {
      transform: [
        { translateX: translateValue },
        { rotate: withTiming(rotateValue) },
      ],
    };
  });

  function handleMapActionSelected(mapAction: MapActionType) {
    isExpanded.value = false;
    onMapActionSelected(mapAction);
  }

  return (
    <MainContainer insets={insets}>
      <MainButton onPress={handlePress}>
        <MainButtonText style={[plusIconStyle]}>+</MainButtonText>
      </MainButton>
      <MapAction
        isExpanded={isExpanded}
        index={1}
        label={t("map.buttons.map-actions.add-parcels")}
        onPress={() => handleMapActionSelected(MapActionType.MANAGE_PARCELS)}
      />
      <MapAction
        isExpanded={isExpanded}
        index={2}
        label={t("map.buttons.map-actions.forage-harvest")}
        onPress={() => handleMapActionSelected(MapActionType.HAY_HARVEST)}
      />
      <MapAction
        isExpanded={isExpanded}
        index={3}
        label={t("map.buttons.map-actions.fertilization")}
        onPress={() => handleMapActionSelected(MapActionType.FERTILIZATION)}
      />
    </MainContainer>
  );
}

type MainContainerProps = {
  insets: EdgeInsets;
};

const MainContainer = styled.View<MainContainerProps>`
  position: absolute;
  flex-direction: column;
  align-items: flex-end;
  right: ${({ theme }) => theme.spacing.m}px;
  bottom: ${({ theme, insets }) => insets.bottom + theme.spacing.m}px;
`;
const MainButton = styled(AnimatedPressable)`
  z-index: 1;
  width: 66px;
  height: 66px;
  border-radius: 50%;
  padding: 4px 8px;
  background-color: #d78f41;
  justify-content: center;
  align-items: center;
  box-shadow: -0.5px 3.5px 5px rgba(23, 23, 23, 0.8);
`;

const MainButtonText = styled(Animated.Text)`
  font-size: 24px;
  color: #f8f9ff;
`;

const FloatingActionButton = styled(AnimatedPressable)`
  position: absolute;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 5px;
  padding: 4px 8px;
  justify-content: center;
  align-items: center;
  width: 160px;
`;

const FloatingActionButtonText = styled(Animated.Text)`
  color: #333;
  font-size: 14px;
`;
