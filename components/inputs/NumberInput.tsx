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
    if (float) {
      return onChangeText(value.replace(/[^0-9.]|(?<!^)\.(?=.*\.)/g, ""));
    } else {
      onChangeText(value.replace(/[^0-9]/g, ""));
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
