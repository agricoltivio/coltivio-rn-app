import { OnboardingScreen } from "@/features/onboarding/OnboardingScreen";
import { H1, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "styled-components/native";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { TvdImportOnboardingScreenProps } from "./navigation/animals-routes";

export function TvdImportOnboardingScreen({
  navigation,
}: TvdImportOnboardingScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { updateLocalSettings } = useLocalSettings();

  function handleFinish() {
    updateLocalSettings("tvdImportOnboardingCompleted", true);
    navigation.replace("TvdImport");
  }

  const steps = [
    <View style={{ width: "100%" }}>
      <H1 style={{ color: theme.colors.primary }}>
        {t("animals.tvd_import.onboarding_heading")}
      </H1>
      <H3
        style={{
          color: theme.colors.primary,
          marginTop: theme.spacing.s,
        }}
      >
        {t("animals.tvd_import.onboarding_body")}
      </H3>
      <Image
        source={require("@/assets/images/tvd-export-small.jpg")}
        style={{
          width: "100%",
          height: 200,
          borderRadius: theme.radii.m,
          marginTop: theme.spacing.l,
        }}
        contentFit="contain"
      />
    </View>,
  ];

  return <OnboardingScreen steps={steps} onFinish={handleFinish} />;
}
