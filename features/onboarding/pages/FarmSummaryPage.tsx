import { H2, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

type FarmSummaryPageProps = {
  federalFarmId: string | null;
};

export function FarmSummaryPage({ federalFarmId }: FarmSummaryPageProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={{ width: "100%" }}>
      {federalFarmId ? (
        <>
          <H2 style={{ color: theme.colors.primary }}>
            {t("onboarding.summary.heading")}
          </H2>
          <H3 style={{ marginTop: theme.spacing.s }}>
            {t("onboarding.summary.subheading", { federalFarmId })}
          </H3>
        </>
      ) : (
        <H3 style={{ marginTop: theme.spacing.s }}>
          {t("onboarding.summary.no_federal_farm_id")}
        </H3>
      )}
    </View>
  );
}
