import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { List } from "@/components/list/List";
import { CropRotationsScreenProps } from "./navigation/crop-rotations-routes";
import { H2, Headline } from "@/theme/Typography";
import React from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropRotationYearsQuery } from "./crop-rotations.hooks";
import { ScrollView } from "@/components/views/ScrollView";
import { useTranslation } from "react-i18next";

export function CropRotationsScreen({ navigation }: CropRotationsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { cropRotationYears } = useCropRotationYearsQuery();

  if (!cropRotationYears) {
    return null;
  }
  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("crop_rotations.crop_rotation")}
      >
        <H2>{t("crop_rotations.crop_rotation")}</H2>
        <View
          style={{
            marginTop: theme.spacing.m,
          }}
        >
          {cropRotationYears.length === 0 ? (
            <Headline>{t("common.no_entries")}</Headline>
          ) : (
            <List>
              {cropRotationYears.map((year) => (
                <List.Item
                  key={year}
                  title={year}
                  onPress={() =>
                    navigation.navigate("CropRotationsOfYearList", {
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
        onPress={() => navigation.navigate("AddCropRotationSelectStartDate")}
      />
    </ContentView>
  );
}
