import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { List } from "@/components/list/List";
import { CropProtectionApplicationsScreenProps } from "./navigation/crop-protection-application-routes";
import { H2, Headline } from "@/theme/Typography";
import React from "react";
import { ScrollView, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropProtectionApplicationYearsQuery } from "./cropProtectionApplications.hooks";
import { useTranslation } from "react-i18next";

export function CropProtectionApplicationsScreen({
  navigation,
}: CropProtectionApplicationsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { cropProtectionApplicationYears } =
    useCropProtectionApplicationYearsQuery();

  if (!cropProtectionApplicationYears) {
    return null;
  }
  return (
    <ContentView headerVisible>
      <ScrollView>
        <H2>{t("crop_protection_applications.crop_protection")}</H2>
        <View
          style={{
            marginTop: theme.spacing.m,
          }}
        >
          {cropProtectionApplicationYears.length === 0 ? (
            <Headline>{t("common.no_entries")}</Headline>
          ) : (
            <List>
              {cropProtectionApplicationYears.map((year) => (
                <List.Item
                  key={year}
                  title={year}
                  onPress={() =>
                    navigation.navigate("CropProtectionApplicationsOfYear", {
                      year: Number(year),
                    })
                  }
                />
              ))}
            </List>
          )}
        </View>
      </ScrollView>
      <FAB
        icon={{ name: "add", color: "white" }}
        onPress={() => navigation.navigate("SelectCropProtectionApplicationProductAndDate", {})}
      />
    </ContentView>
  );
}
