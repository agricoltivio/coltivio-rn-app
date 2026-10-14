import { Controller, FieldValues, UseControllerProps } from "react-hook-form";
import { Select, SelectProps } from "./Select";

type RHTextInputProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<
    SelectProps,
    "onChange" | "onClear" | "onBlur" | "value" | "disabled"
  > & {
    // Allows resetting the field to null
    clearable?: boolean;
  };

export function RHSelect<T extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  control,
  defaultValue,
  disabled,
  clearable,
  ...inputProps
}: RHTextInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field: { onChange, onBlur, value } }) => (
        <Select
          onBlur={onBlur}
          onChange={onChange}
          onClear={clearable ? () => onChange(null) : undefined}
          value={value}
          disabled={disabled}
          {...inputProps}
        />
      )}
    />
  );
}
