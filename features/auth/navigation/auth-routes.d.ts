import { StackScreenProps } from "@/navigation/rootStackTypes";

export type AuthStackParamList = {
  SignIn: undefined;

  UnexpectedError: undefined;
};

export type SignInScreenProps = StackScreenProps<"SignIn">;
