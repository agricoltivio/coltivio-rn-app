import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { List } from "@/components/list/List";
import { TillagesScreenProps } from "@/navigation/rootStackTypes";
import { H2, Headline } from "@/theme/Typography";
import React from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useTillageYearsQuery } from "./tillages.hooks";
import { ScrollView } from "@/components/views/ScrollView";
import { useTranslation } from "react-i18next";

export function TillagesScreen({ navigation }: TillagesScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { tillageYears } = useTillageYearsQuery();

  if (!tillageYears) {
    return null;
  }
  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("tillages.tillages")}
      >
        <H2>{t("tillages.tillages")}</H2>
        <View
          style={{
            marginTop: theme.spacing.m,
          }}
        >
          {tillageYears.length === 0 ? (
            <Headline>{t("common.no_entries")}</Headline>
          ) : (
            <List>
              {tillageYears.map((year) => (
                <List.Item
                  key={year}
                  title={year}
                  onPress={() =>
                    navigation.navigate("TillagesOfYearList", {
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
        onPress={() => navigation.navigate("AddTillageSelectDate")}
      />
    </ContentView>
  );
}
