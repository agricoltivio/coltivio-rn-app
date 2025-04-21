import { Stack } from "@/navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { DefaultTheme } from "styled-components";
import { HomeScreen } from "../HomeScreen";

export function renderHomeStack(theme: DefaultTheme, navigation: any) {
  return (
    <Stack.Screen
      key="home"
      name="Home"
      component={HomeScreen}
      options={{
        title: "",

        headerRight(props) {
          return (
            <Ionicons
              size={35}
              name="person-circle-outline"
              color={theme.colors.primary}
              onPress={() => navigation.navigate("UserAccount")}
            />
          );
        },
      }}
    />
  );
}
