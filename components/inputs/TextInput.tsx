import { ReactNode, useEffect, useState } from "react";
import { Keyboard, TextInputProps as RnTextInputProps, View } from "react-native";
import styled, { useTheme } from "styled-components/native";

export type TextInputProps = Omit<RnTextInputProps, "editable"> & {
  label?: ReactNode;
  error?: string | null;
  hideLabel?: boolean;
  disabled?: boolean;
};

export function TextInput({
  label,
  onFocus,
  onBlur,
  error,
  hideLabel,
  disabled,
  onChange,
  ...props
}: TextInputProps) {
  const theme = useTheme();
  const [focus, setFocus] = useState(false);

  // Blur all inputs when the keyboard hides while this input is focused.
  // Prevents "ghost focus" where the next tap re-shows the keyboard
  // instead of triggering the tapped button.
  useEffect(() => {
    if (!focus) return;
    const sub = Keyboard.addListener("keyboardDidHide", () => {
      Keyboard.dismiss();
    });
    return () => sub.remove();
  }, [focus]);

  return (
    <View>
      {!hideLabel && <Label>{label}</Label>}
      <Input
        placeholderTextColor={theme.colors.gray2}
        error={!!error}
        focus={focus}
        returnKeyType="done"
        onFocus={(event) => {
          setFocus(true);
          onFocus && onFocus(event);
        }}
        onBlur={(event) => {
          setFocus(false);
          onBlur && onBlur(event);
        }}
        hideLabel={hideLabel}
        editable={!disabled}
        {...props}
      />
      {error && (
        <View style={{ marginTop: 3, paddingHorizontal: 5 }}>
          <ErrorText>{error}</ErrorText>
        </View>
      )}
    </View>
  );
}

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
  font-weight: 400;
`;

type InputProps = RnTextInputProps & {
  focus: boolean;
  error?: boolean;
  hideLabel?: boolean;
};
const Input = styled.TextInput<InputProps>`
  width: 100%;
  padding: ${({ hideLabel }) => `${hideLabel ? 10 : 32}px 10px 10px 10px`};
  font-size: 17px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.gray0};
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.white};
  border-width: 1px;
  border-color: ${({ theme, focus, error }) =>
    error
      ? theme.colors.danger
      : focus
        ? theme.colors.primary
        : theme.colors.gray2};
`;

const Label = styled.Text`
  z-index: 1;
  font-size: 16px;
  position: absolute;
  top: 10px;
  left: 10px;

  /* margin-bottom: 5px; */
  color: ${({ theme }) => theme.colors.gray2};
`;
