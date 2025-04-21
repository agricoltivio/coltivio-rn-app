import { StackScreenProps } from "@/navigation/rootStackTypes";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  PasswordResetLinkSent: undefined;
  ResetPassword: undefined;

  UnexpectedError: undefined;
};

export type SignInScreenProps = StackScreenProps<"SignIn">;

export type SignUpScreenProps = StackScreenProps<"SignUp">;

export type ForgotPasswordScreenProps = StackScreenProps<"ForgotPassword">;

export type PasswordResetLinkSentScreenProps =
  StackScreenProps<"PasswordResetLinkSent">;

export type ResetPasswordScreenProps = StackScreenProps<"ResetPassword">;
