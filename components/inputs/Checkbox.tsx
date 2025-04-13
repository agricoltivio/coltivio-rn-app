import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import styled, { useTheme } from "styled-components/native";

export type CheckboxProps = {
  checked?: boolean;
  onPress?: () => void;
};

export function Checkbox({ checked, onPress }: CheckboxProps) {
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={onPress}>
      <Ionicons
        name={checked ? "checkbox-outline" : "square-outline"}
        size={24}
        color={theme.colors.black}
      />
    </TouchableOpacity>
  );
}
