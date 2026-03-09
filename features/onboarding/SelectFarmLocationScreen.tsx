import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { SelectFarmLocationScreenProps } from "@/features/onboarding/navigation/onboarding-routes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { NavigationButton } from "./NavigationButton";
import { useOnboarding } from "./OnboardingContext";
import { Stepper } from "./Stepper";
import { FarmLocationPage } from "./pages/FarmLocationPage";

export function SelectFarmLocationScreen({
  navigation,
}: SelectFarmLocationScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { data } = useOnboarding();

  return (
    <ContentView headerVisible={false}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <FarmLocationPage
          farmName={data.name}
          locationLabel={data.location?.label}
          onOpenSearchModal={() =>
            navigation.navigate("SelectFarmLocationSearch")
          }
        />
      </ScrollView>
      <View style={{ padding: theme.spacing.m }}>
        <Stepper totalSteps={5} currentStep={2} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginHorizontal: theme.spacing.m,
          }}
        >
          <NavigationButton
            title={t("buttons.back")}
            icon="arrow-back-circle-outline"
            onPress={() => navigation.goBack()}
          />
          <NavigationButton
            title={t("buttons.next")}
            icon="arrow-forward-circle-outline"
            onPress={() => navigation.navigate("SelectFederalFarmIdMap")}
            disabled={!data.location}
          />
        </View>
      </View>
    </ContentView>
  );
}
