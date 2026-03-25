import { Ionicons } from "@expo/vector-icons";
import React from "react";
import styled, { useTheme } from "styled-components/native";

const ICON_CONTAINER_SIZE = 40;

interface SquareCtaProps {
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  disabled?: boolean;
}

export const SquareIconCta = ({
  onPress,
  icon,
  iconColor,
  disabled,
}: SquareCtaProps) => {
  const theme = useTheme();

  return (
    <Touchable onPress={onPress} disabled={disabled}>
      <Container borderRadius={theme.radii.l}>
        <Ionicons
          name={icon}
          size={ICON_CONTAINER_SIZE * 0.6}
          color={iconColor ?? "black"}
        />
      </Container>
    </Touchable>
  );
};

const Touchable = styled.TouchableOpacity<{ disabled?: boolean }>`
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;

const Container = styled.View<{ borderRadius: number }>(({ borderRadius }) => ({
  width: ICON_CONTAINER_SIZE,
  height: ICON_CONTAINER_SIZE,
  backgroundColor: "white",
  borderRadius: borderRadius,
  alignItems: "center",
  justifyContent: "center",
}));
