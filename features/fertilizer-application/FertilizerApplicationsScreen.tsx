import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { List } from "@/components/list/List";
import { FertilizerApplicationsScreenProps } from "./navigation/fertilizer-application-routes";
import { H2, Headline } from "@/theme/Typography";
import React from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useFertilizerApplicationYearsQuery } from "./fertilizerApplications.hooks";
import { useTranslation } from "react-i18next";
import { ScrollView } from "@/components/views/ScrollView";

export function FertilizerApplicationsScreen({
  navigation,
}: FertilizerApplicationsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { fertilizerApplicationYears } = useFertilizerApplicationYearsQuery();

  if (!fertilizerApplicationYears) {
    return null;
  }
  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("fertilizer_application.fertilizer_application")}
      >
        <H2>{t("fertilizer_application.fertilizer_application")}</H2>
        <View
          style={{
            marginTop: theme.spacing.m,
          }}
        >
          {fertilizerApplicationYears.length === 0 ? (
            <Headline>{t("common.no_entries")}</Headline>
          ) : (
            <List>
              {fertilizerApplicationYears.map((year) => (
                <List.Item
                  key={year}
                  title={year}
                  onPress={() =>
                    navigation.navigate("FertilizerApplicationsOfYear", {
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
        onPress={() =>
          navigation.navigate("AddFertilizerApplicationSelectDate")
        }
      />
    </ContentView>
  );
}
