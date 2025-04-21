import { Stack } from "@/navigation/stack";
import { ChangeEmailScreen } from "../ChangeEmailScreen";
import { ChangePasswordScren } from "../ChangePasswordScreen";
import { ChangeUserNameScreen } from "../ChangeUserNameScreen";
import { UserAccountScreen } from "../UserAccountScreen";

export function renderUserStack() {
  return [
    <Stack.Screen
      key="user-account"
      name="UserAccount"
      component={UserAccountScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="change-user-name"
      name="ChangeUserName"
      component={ChangeUserNameScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="change-email"
      name="ChangeEmail"
      component={ChangeEmailScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="change-password"
      name="ChangePassword"
      component={ChangePasswordScren}
      options={{
        title: "",
      }}
    />,
  ];
}
