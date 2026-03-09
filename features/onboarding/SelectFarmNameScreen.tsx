import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { SelectFarmNameScreenProps } from "@/features/onboarding/navigation/onboarding-routes";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { NavigationButton } from "./NavigationButton";
import { useOnboarding } from "./OnboardingContext";
import { Stepper } from "./Stepper";
import { FarmNamePage } from "./pages/FarmNamePage";

export function SelectFarmNameScreen({
  navigation,
}: SelectFarmNameScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { data, setData, clear } = useOnboarding();

  useEffect(() => clear(), []);

  return (
    <ContentView headerVisible={false}>
      <ScrollView
        contentContainerStyle={{ justifyContent: "center", flexGrow: 1 }}
      >
        <FarmNamePage
          name={data.name}
          onNameChange={(value) =>
            setData((prev) => ({ ...prev, name: value }))
          }
        />
      </ScrollView>
      <View style={{ padding: theme.spacing.m }}>
        <Stepper totalSteps={5} currentStep={1} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            marginHorizontal: theme.spacing.m,
          }}
        >
          <NavigationButton
            title={t("buttons.next")}
            icon="arrow-forward-circle-outline"
            onPress={() => navigation.navigate("SelectFarmLocation")}
            disabled={!data.name}
          />
        </View>
      </View>
    </ContentView>
  );
}
