import { Stack } from "@/navigation/stack";
import { DefaultTheme } from "styled-components";
import { ForgotPasswordScreen } from "../ForgotPasswordScreen";
import { PasswordResetLinkSentScreen } from "../PasswordResetLinkSentScreen";
import { ResetPasswordScreen } from "../ResetPasswordScreen";
import { SignInScreen } from "../SignInScreen";
import { SignUpScreen } from "../SignUpScreen";

export function renderAuthStack(theme: DefaultTheme) {
  return (
    <Stack.Group>
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{
          headerShown: true,
          title: "",
          headerStyle: { backgroundColor: theme.colors.background },
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          headerShown: true,
          title: "",
          headerStyle: { backgroundColor: theme.colors.background },
        }}
      />
      <Stack.Screen
        name="PasswordResetLinkSent"
        component={PasswordResetLinkSentScreen}
        options={{
          headerShown: true,
          title: "",
          headerStyle: { backgroundColor: theme.colors.background },
        }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          headerShown: true,
          title: "",
          headerStyle: { backgroundColor: theme.colors.background },
        }}
      />
    </Stack.Group>
  );
}
