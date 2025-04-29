import { Controller, FieldValues, UseControllerProps } from "react-hook-form";
import { TextInput, TextInputProps } from "./TextInput";

type RHTextInputProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<TextInputProps, "onChangeText" | "onBlur" | "value" | "disabled">;

export function RHTextInput<T extends FieldValues>({
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
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
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
