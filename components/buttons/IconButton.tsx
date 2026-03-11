import Icon, {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleProp, ViewStyle } from "react-native";
import styled from "styled-components/native";

type ButtonBaseProps = {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  type?: "primary" | "secondary" | "accent" | "danger" | "success";
  loading?: boolean;
  children: React.ReactNode;
};

export type IconButtonProps = {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  type?: "primary" | "secondary" | "accent" | "danger" | "success";
  loading?: boolean;
  iconSize?: number;
  color?: string;
};

export type IonIconButtonProps = IconButtonProps & {
  icon: keyof typeof Ionicons.glyphMap;
};

function ButtonBase({
  disabled,
  style,
  type = "primary",
  onPress,
  loading = false,
  children,
}: ButtonBaseProps) {
  return (
    <ButtonContainer
      onPress={onPress}
      style={style}
      type={type}
      disabled={disabled}
    >
      {children}
      <ActivityIndicator
        style={{ position: "absolute", right: 20 }}
        color={"white"}
        animating={loading}
      />
    </ButtonContainer>
  );
}

export function IonIconButton({
  icon,
  iconSize,
  color = "white",
  ...rest
}: IonIconButtonProps) {
  return (
    <ButtonBase {...rest}>
      <Ionicons name={icon} size={iconSize ?? 24} color={color} />
    </ButtonBase>
  );
}

export type MaterialCommunityIconButtonProps = IconButtonProps & {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

export function MaterialCommunityIconButton({
  icon,
  iconSize,
  color = "white",
  ...rest
}: MaterialCommunityIconButtonProps) {
  return (
    <ButtonBase {...rest}>
      <MaterialCommunityIcons name={icon} size={iconSize ?? 24} color={color} />
    </ButtonBase>
  );
}

export type MaterialIconButtonProps = IconButtonProps & {
  icon: keyof typeof MaterialIcons.glyphMap;
};

export function MaterialIconButton({
  icon,
  iconSize,
  color = "white",
  ...rest
}: MaterialIconButtonProps) {
  return (
    <ButtonBase {...rest}>
      <MaterialIcons name={icon} size={iconSize ?? 24} color={color} />
    </ButtonBase>
  );
}

const ButtonContainer = styled.TouchableOpacity<{
  type: "primary" | "secondary" | "accent" | "danger" | "success";
  disabled?: boolean;
}>`
  flex-direction: row;
  background-color: ${({ theme, type, disabled }) =>
    disabled ? theme.colors.gray3 : theme.colors[type]};
  padding: 5px;
  border-radius: ${({ theme }) => theme.radii.m}px;
  border: ${({ theme, type }) =>
    type === "accent" ? `1px solid ${theme.colors.gray3}` : "none"};
  justify-content: center;
  align-items: center;
`;
