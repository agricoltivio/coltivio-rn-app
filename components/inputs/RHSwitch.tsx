import { Controller, FieldValues, UseControllerProps } from "react-hook-form";
import { Switch, SwitchProps } from "./Switch";

type RHTextInputProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<SwitchProps, "onChange" | "value" | "disabled">;

export function RHSwitch<T extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  control,
  defaultValue,
  disabled,
  ...inputProps
}: RHTextInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      disabled={disabled}
      render={({ field: { onChange, value, disabled } }) => (
        <Switch
          onChange={(event) => onChange(event.nativeEvent.value)}
          value={value}
          disabled={disabled}
          {...inputProps}
        />
      )}
    />
  );
}
