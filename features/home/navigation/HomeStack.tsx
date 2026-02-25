import { Stack } from "@/navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { DefaultTheme } from "styled-components/native";
import { HomeScreen } from "../HomeScreen";
import { SpeedDialOnboardingScreen } from "../SpeedDialOnboardingScreen";
import { View } from "react-native";

export function renderHomeStack(theme: DefaultTheme, navigation: any) {
  return [
    <Stack.Screen
      key="home"
      name="Home"
      component={HomeScreen}
      options={{
        title: "",

        headerRight(props) {
          return (
            <View style={{ flexDirection: "row" }}>
              <Ionicons
                size={35}
                name="settings-outline"
                color={theme.colors.primary}
                onPress={() => navigation.navigate("AppSettings")}
              />
              <Ionicons
                size={40}
                name="information-circle-outline"
                color={theme.colors.primary}
                onPress={() => navigation.navigate("AgriColtivioInfo")}
              />
              <Ionicons
                size={40}
                name="person-circle-outline"
                color={theme.colors.primary}
                onPress={() => navigation.navigate("UserAccount")}
              />
            </View>
          );
        },
      }}
    />,
    <Stack.Screen
      key="speed-dial-onboarding"
      name="SpeedDialOnboarding"
      component={SpeedDialOnboardingScreen}
      options={{ title: "", headerShown: false }}
    />,
  ];
}
