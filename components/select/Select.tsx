import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Dropdown as RnDropdown } from "react-native-element-dropdown";
import { DropdownProps } from "react-native-element-dropdown/lib/typescript/components/Dropdown/model";
import styled, { useTheme } from "styled-components/native";

export type SelectProps = {
  label?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  data: { label: string; value: string }[];
  style?: any;
  error?: string;
};
export function Select({
  label,
  value,
  data,
  onChange,
  onBlur,
  onFocus,
  disabled,
  placeholder,
  style,
  error,
}: SelectProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [focus, setFocus] = useState(false);
  return (
    <View>
      <Label>{label}</Label>
      <Dropdown
        style={{
          // backgroundColor: "transparent",
          // borderBottomColor: theme.colors.grey3,
          // borderWidth: 1,
          // minHeight: 40,

          ...style,
        }}
        itemContainerStyle={{
          backgroundColor: theme.colors.white,
        }}
        containerStyle={{
          backgroundColor: theme.colors.primary,
        }}
        itemTextStyle={{ color: theme.colors.gray0, fontSize: 17 }}
        placeholderStyle={{
          color: theme.colors.gray1,
          fontSize: 17,
          paddingTop: 32,
        }}
        selectedTextStyle={{
          fontSize: 17,
          color: disabled ? theme.colors.gray2 : theme.colors.gray0,
          paddingTop: 32,
        }}
        data={data}
        // maxHeight={300}
        labelField="label"
        valueField="value"
        disable={disabled}
        placeholder={placeholder || t("forms.labels.please_select")}
        value={value}
        error={!!error}
        focus={focus}
        onFocus={() => {
          setFocus(true);
          onFocus && onFocus();
        }}
        onBlur={() => {
          setFocus(false);
          onBlur && onBlur();
        }}
        onChange={(item) => {
          onChange && onChange(item.value);
        }}
      />
      {error && (
        <View style={{ marginTop: 3, paddingHorizontal: 5 }}>
          <ErrorText>{error}</ErrorText>
        </View>
      )}
    </View>
  );
}
type CustomDropdownProps = DropdownProps<any> & {
  focus: boolean;
  error?: boolean;
};

const Dropdown = styled(RnDropdown)<CustomDropdownProps>`
  width: 100%;
  padding: 0px 10px 10px 10px;
  font-size: 17px;
  font-weight: 400;
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

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
  font-weight: 400;
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
