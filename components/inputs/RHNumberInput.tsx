import { Controller, FieldValues, UseControllerProps } from "react-hook-form";
import { NumberInput, NumberInputProps } from "./NumberInput";

type RHTextInputProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<NumberInputProps, "onChangeText" | "onBlur" | "value" | "disabled">;

export function RHNumberInput<T extends FieldValues>({
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
      render={({ field: { onChange, onBlur, value, disabled } }) => (
        <NumberInput
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          disabled={disabled}
          {...inputProps}
        />
      )}
    />
  );
}
