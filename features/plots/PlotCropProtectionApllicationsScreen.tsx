import { List } from "@/components/list/List";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Headline } from "@/theme/Typography";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { PlotCropProtectionApplicationsScreenProps } from "@/navigation/rootStackTypes";
import { useCropProtectionApplicationsForPlotQuery } from "../crop-protection-applications/cropProtectionApplications.hooks";
import { useTranslation } from "react-i18next";

export function PlotCropProtectionApplicationsScreen({
  navigation,
  route,
}: PlotCropProtectionApplicationsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plotId, name } = route.params;
  const { cropProtectionApplications } =
    useCropProtectionApplicationsForPlotQuery(plotId);

  if (!cropProtectionApplications) {
    return null;
  }
  const years = [
    ...new Set(
      cropProtectionApplications.map((cropProtectionApplication) =>
        new Date(cropProtectionApplication.dateTime).getFullYear()
      )
    ),
  ];
  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("crop_protection_applications.crop_protection")}
      >
        <H2>{t("crop_protection_applications.crop_protection")}</H2>
        <H3>
          {t("plots.plot_name", {
            name,
          })}
        </H3>
        <View
          style={{
            marginTop: theme.spacing.m,
          }}
        >
          {cropProtectionApplications.length === 0 ? (
            <Headline>{t("common.no_entries")}</Headline>
          ) : (
            <List>
              {years.map((year) => (
                <List.Item
                  key={year}
                  title={year.toString()}
                  onPress={() =>
                    navigation.navigate(
                      "PlotCropProtectionApplicationsOfYear",
                      {
                        year: Number(year),
                        plotId,
                        name,
                      }
                    )
                  }
                />
              ))}
            </List>
          )}
        </View>
      </ScrollView>
    </ContentView>
  );
}
