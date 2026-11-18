import { Controller, FieldValues, UseControllerProps } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DatePicker, DatePickerProps } from "../datepicker/DatePicker";

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
  clearable,
  minimumDate,
}: RHTextInputProps<T>) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  // A required date can't be cleared: the button would only produce an invalid form, and screens that read the
  // date (e.g. the treatment start date) crash on an empty value. An explicit clearable prop still wins.
  const required = rules?.required;
  const isRequired =
    typeof required === "object" ? required.value : Boolean(required);
  const showClearButton = clearable ?? !isRequired;
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
          clearable={showClearButton}
          minimumDate={minimumDate}
        />
      )}
    />
  );
}
