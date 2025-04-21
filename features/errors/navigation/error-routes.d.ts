import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type ErrorStackParamList = {
  UnexpectedError: undefined;
};

export type UnexpectedErrorScreenProps = NativeStackScreenProps<
  ErrorStackParamList,
  "UnexpectedError"
>;
