import { Stack } from "@/navigation/stack";
import { IonIconButton } from "@/components/buttons/IconButton";
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

        headerRight() {
          return (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IonIconButton
                icon="settings-outline"
                type="ghost"
                iconSize={30}
                color={theme.colors.primary}
                onPress={() => navigation.navigate("AppSettings")}
              />
              <IonIconButton
                icon="information-circle-outline"
                type="ghost"
                iconSize={30}
                color={theme.colors.primary}
                onPress={() => navigation.navigate("AgriColtivioInfo")}
              />
              <IonIconButton
                icon="person-circle-outline"
                type="ghost"
                iconSize={30}
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
