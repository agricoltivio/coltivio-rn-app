import { Stack } from "@/navigation/stack";
import { DefaultTheme } from "styled-components/native";
import { SignInScreen } from "../SignInScreen";

export function renderAuthStack(_theme: DefaultTheme) {
  return (
    <Stack.Group>
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ headerShown: false }}
      />
    </Stack.Group>
  );
}
