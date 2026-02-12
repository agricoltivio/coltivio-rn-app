import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { Select } from "../select/Select";

export type PresetOption = {
  id: string;
  name: string;
};

type PresetSelectProps = {
  label: string;
  value?: string;
  presets: PresetOption[];
  onChange: (presetId: string | undefined) => void;
  onManagePress: () => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  /** Label for a "None" option that clears the selection */
  noneLabel?: string;
};

export function PresetSelect({
  label,
  value,
  presets,
  onChange,
  onManagePress,
  placeholder,
  error,
  disabled,
  noneLabel,
}: PresetSelectProps) {
  const theme = useTheme();

  const NONE_VALUE = "__none__";

  const selectData = [
    ...(noneLabel ? [{ label: noneLabel, value: NONE_VALUE }] : []),
    ...presets.map((preset) => ({
      label: preset.name,
      value: preset.id,
    })),
  ];

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: theme.spacing.s }}>
      <View style={{ flex: 1 }}>
        <Select
          label={label}
          value={value}
          data={selectData}
          onChange={(val) => onChange(val === "" || val === NONE_VALUE ? undefined : val)}
          placeholder={placeholder}
          error={error}
          disabled={disabled}
        />
      </View>
      <TouchableOpacity
        onPress={onManagePress}
        disabled={disabled}
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.colors.gray2,
          padding: 14,
          marginTop: 0,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialIcons
          name="settings"
          size={24}
          color={disabled ? theme.colors.gray2 : theme.colors.gray0}
        />
      </TouchableOpacity>
    </View>
  );
}
