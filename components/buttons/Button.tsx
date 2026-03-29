import { ActivityIndicator, StyleProp, ViewStyle } from "react-native";
import styled from "styled-components/native";

export type ButtonProps = {
  onPress?: () => void;
  title?: string;
  style?: StyleProp<ViewStyle>;
  fontSize?: number;
  disabled?: boolean;
  type?: "primary" | "secondary" | "accent" | "danger";
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
  return (
    <ButtonContainer
      onPress={onPress}
      style={style}
      type={type}
      disabled={disabled}
    >
      <ButtonText type={type} fontSize={fontSize}>
        {title}
      </ButtonText>
      <ActivityIndicator
        style={{ position: "absolute", right: 20 }}
        color={"white"}
        animating={loading}
      />
    </ButtonContainer>
  );
}

const ButtonContainer = styled.TouchableOpacity<{
  type: "primary" | "secondary" | "accent" | "danger";
  disabled?: boolean;
}>`
  flex-direction: row;
  background-color: ${({ theme, type, disabled }) =>
    disabled
      ? theme.colors.gray3
      : type === "primary"
        ? theme.colors.buttonPrimary
        : type === "accent"
          ? theme.colors.white
          : theme.colors[type]};
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.m}px;
  border: ${({ theme, type }) =>
    type === "accent" ? `1.5px solid ${theme.colors.primary}` : "none"};
  justify-content: center;
  align-items: center;
`;

const ButtonText = styled.Text<{
  type: "primary" | "secondary" | "accent" | "danger";
  fontSize?: number;
}>`
  color: ${({ theme, type }) =>
    type === "accent" ? theme.colors.primary : theme.colors.white};
  font-size: ${({ fontSize }) => fontSize ?? 16}px;
  font-weight: 600;
`;
