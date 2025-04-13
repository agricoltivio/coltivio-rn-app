import { Label } from "@/theme/Typography";
import {
  View,
  Switch as RnSwitch,
  SwitchChangeEvent,
  ViewStyle,
} from "react-native";

export type SwitchProps = {
  value?: boolean;
  onChange?: (event: SwitchChangeEvent) => void;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Switch({
  value,
  onChange,
  label,
  disabled,
  style,
}: SwitchProps) {
  return (
    <View style={[{ flexDirection: "row" }, style]}>
      <Label style={{ flex: 1 }}>{label}</Label>
      <RnSwitch value={value} onChange={onChange} disabled={disabled} />
    </View>
  );
}
