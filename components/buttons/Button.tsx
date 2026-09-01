import { ActivityIndicator, StyleProp, ViewStyle } from "react-native";
import styled, { useTheme } from "styled-components/native";

export type ButtonProps = {
  onPress?: () => void;
  title?: string;
  style?: StyleProp<ViewStyle>;
  fontSize?: number;
  disabled?: boolean;
  type?: "primary" | "secondary" | "accent" | "danger" | "dangerGhost";
  loading?: boolean;
};

export function Button({
  title,
  disabled,
  fontSize,
  style,
  type = "primary",
  onPress,
  loading = false,
}: ButtonProps) {
  const theme = useTheme();
  const spinnerColor = disabled
    ? "white"
    : type === "accent"
      ? theme.colors.primary
      : type === "dangerGhost"
        ? theme.colors.danger
        : "white";
  return (
    <ButtonContainer
      onPress={onPress}
      style={style}
      type={type}
      disabled={disabled}
    >
      <ButtonText type={type} fontSize={fontSize} disabled={disabled}>
        {title}
      </ButtonText>
      <ActivityIndicator
        style={{ position: "absolute", right: 20 }}
        color={spinnerColor}
        animating={loading}
      />
    </ButtonContainer>
  );
}

const ButtonContainer = styled.TouchableOpacity<{
  type: "primary" | "secondary" | "accent" | "danger" | "dangerGhost";
  disabled?: boolean;
}>`
  flex-direction: row;
  background-color: ${({ theme, type, disabled }) =>
    disabled
      ? theme.colors.gray3
      : type === "primary"
        ? theme.colors.buttonPrimary
        : type === "accent" || type === "dangerGhost"
          ? theme.colors.white
          : theme.colors[type]};
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.m}px;
  border: ${({ theme, type, disabled }) =>
    disabled
      ? "none"
      : type === "accent"
        ? `1.5px solid ${theme.colors.primary}`
        : type === "dangerGhost"
          ? `1.5px solid ${theme.colors.danger}`
          : "none"};
  justify-content: center;
  align-items: center;
`;

const ButtonText = styled.Text<{
  type: "primary" | "secondary" | "accent" | "danger" | "dangerGhost";
  fontSize?: number;
  disabled?: boolean;
}>`
  color: ${({ theme, type, disabled }) =>
    disabled
      ? theme.colors.white
      : type === "accent"
        ? theme.colors.primary
        : type === "dangerGhost"
          ? theme.colors.danger
          : theme.colors.white};
  font-size: ${({ fontSize }) => fontSize ?? 16}px;
  font-weight: 600;
`;
