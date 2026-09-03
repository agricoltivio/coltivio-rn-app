import { Stack } from "@/navigation/stack";
import { DefaultTheme } from "styled-components/native";
import { ForgotPasswordScreen } from "../ForgotPasswordScreen";
import { PasswordResetLinkSentScreen } from "../PasswordResetLinkSentScreen";
import { ResetPasswordScreen } from "../ResetPasswordScreen";
import { SignInScreen } from "../SignInScreen";
import { SignUpScreen } from "../SignUpScreen";

export function renderAuthStack(theme: DefaultTheme) {
  // Every auth screen sits on the brand gradient now, so the header floats over
  // it instead of painting a light bar across the top. headerStyle and
  // contentStyle have to be cleared explicitly: the navigator sets both to the
  // light theme background (RootStack.tsx), and headerTransparent alone does not
  // override an inherited headerStyle backgroundColor.
  const brandHeader = {
    headerShown: true,
    title: "",
    headerTransparent: true,
    headerTintColor: theme.colors.offWhite,
    headerStyle: { backgroundColor: "transparent" },
    contentStyle: { backgroundColor: "transparent" },
  } as const;
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
        options={brandHeader}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={brandHeader}
      />
      <Stack.Screen
        name="PasswordResetLinkSent"
        component={PasswordResetLinkSentScreen}
        options={brandHeader}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={brandHeader}
      />
    </Stack.Group>
  );
}
