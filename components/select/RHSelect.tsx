import { Controller, FieldValues, UseControllerProps } from "react-hook-form";
import { Select, SelectProps } from "./Select";

type RHTextInputProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<SelectProps, "onChange" | "onBlur" | "value" | "disabled">;

export function RHSelect<T extends FieldValues>({
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
      disabled={disabled}
      rules={rules}
      render={({ field: { onChange, onBlur, value, disabled } }) => (
        <Select
          onBlur={onBlur}
          onChange={onChange}
          value={value}
          disabled={disabled}
          {...inputProps}
        />
      )}
    />
  );
}
