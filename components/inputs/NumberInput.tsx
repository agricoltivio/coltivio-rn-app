import { TextInput, TextInputProps } from "./TextInput";

export type NumberInputProps = TextInputProps & {
  float?: boolean;
};
export function NumberInput({
  onChangeText,
  float,
  ...props
}: NumberInputProps) {
  function handleOnChange(value: string) {
    if (!onChangeText) {
      return;
    }
    // locale keyboards (de/it/fr) emit a comma as the decimal separator
    const normalized = value.replace(/,/g, ".");
    if (float) {
      return onChangeText(normalized.replace(/[^0-9.]|(?<!^)\.(?=.*\.)/g, ""));
    } else {
      onChangeText(normalized.replace(/[^0-9]/g, ""));
    }
  }

  return (
    <TextInput
      onChangeText={handleOnChange}
      {...props}
      keyboardType="numbers-and-punctuation"
    />
  );
}
