import { OnboardingScreen } from "@/features/onboarding/OnboardingScreen";
import { H3 } from "@/theme/Typography";
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
  const { t, i18n } = useTranslation();
  const { updateLocalSettings } = useLocalSettings();

  function handleFinish() {
    updateLocalSettings("tvdImportOnboardingCompleted", true);
    navigation.replace("TvdImport");
  }

  // TVD screenshots exist in de/fr/it, English users get the German TVD.
  const pedigreeImages = {
    de: require("@/assets/images/tvd-pedigree-de.jpg"),
    fr: require("@/assets/images/tvd-pedigree-fr.jpg"),
    it: require("@/assets/images/tvd-pedigree-it.jpg"),
  };
  const pedigreeImage =
    i18n.language === "fr" || i18n.language === "it"
      ? pedigreeImages[i18n.language]
      : pedigreeImages.de;

  const steps = [
    <View style={{ width: "100%" }}>
      <H3 style={{ color: theme.colors.primary }}>
        {t("animals.tvd_import.onboarding_body")}
      </H3>
      <View style={{ marginTop: theme.spacing.m }}>
        <H3 style={{ color: theme.colors.primary }}>
          {`1. ${t("animals.tvd_import.onboarding_step_select_type")}`}
        </H3>
        <H3 style={{ color: theme.colors.primary, marginTop: theme.spacing.m }}>
          {`2. ${t("animals.tvd_import.onboarding_step_export")}`}
        </H3>
      </View>
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
    <View style={{ width: "100%" }}>
      <H3 style={{ color: theme.colors.primary }}>
        {t("animals.tvd_import.onboarding_pedigree_body")}
      </H3>
      <Image
        source={pedigreeImage}
        style={{
          width: "100%",
          // Full width at the screenshot's own proportions (1200×1000).
          aspectRatio: 1200 / 1000,
          borderRadius: theme.radii.m,
          marginTop: theme.spacing.l,
        }}
        contentFit="contain"
      />
    </View>,
    <View style={{ width: "100%" }}>
      <H3 style={{ color: theme.colors.primary }}>
        {t("animals.tvd_import.onboarding_sync_body")}
      </H3>
      <H3 style={{ color: theme.colors.primary, marginTop: theme.spacing.m }}>
        {t("animals.tvd_import.onboarding_sync_merge_hint")}
      </H3>
    </View>,
  ];

  return <OnboardingScreen steps={steps} onFinish={handleFinish} />;
}
