import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useTheme } from "styled-components/native";

export type CheckboxProps = {
  checked?: boolean;
  onPress?: () => void;
  color?: string;
};

export function Checkbox({ checked, onPress, color }: CheckboxProps) {
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={onPress}>
      <Ionicons
        name={checked ? "checkbox-outline" : "square-outline"}
        size={24}
        color={color ?? theme.colors.black}
      />
    </TouchableOpacity>
  );
}
