import { Controller, FieldValues, UseControllerProps } from "react-hook-form";
import { DatePicker, DatePickerProps } from "../datepicker/DatePicker";
import { locale } from "@/locales/i18n";

type RHTextInputProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<DatePickerProps, "onConfirm" | "onBlur" | "date" | "locale">;

export function RHDatePicker<T extends FieldValues>({
  name,
  rules,
  control,
  defaultValue,
  disabled,
  label,
  error,
  mode,
}: RHTextInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      disabled={disabled}
      render={({ field: { onChange, onBlur, value, disabled } }) => (
        <DatePicker
          label={label}
          date={value}
          mode={mode}
          onConfirm={onChange}
          disabled={disabled}
          onBlur={onBlur}
          locale={locale}
          error={error}
        />
      )}
    />
  );
}
