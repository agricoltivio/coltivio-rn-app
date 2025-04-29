import { Stack } from "@/navigation/stack";
import { DefaultTheme } from "styled-components";
import { UnexpectedErrorScreen } from "../UnexpectedErrorScreen";

export function renderErrorStack(theme: DefaultTheme) {
  return (
    <Stack.Screen
      name="UnexpectedError"
      component={UnexpectedErrorScreen}
      options={{
        headerShown: true,
        title: "",
        headerStyle: { backgroundColor: theme.colors.background },
      }}
    />
  );
}
