import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import React from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropsQuery } from "./crops.hooks";
import { CropsScreenProps } from "./navigation/crops-routes";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/features/user/users.hooks";

export function CropsScreen({ navigation }: CropsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { crops } = useCropsQuery();

  return (
    <ContentView headerVisible>
      <ScrollView showHeaderOnScroll headerTitleOnScroll={t("crops.crops")}>
        <H2>{t("crops.crops")}</H2>
        <View style={{ marginTop: theme.spacing.m }}>
          {crops?.length === 0 && <Subtitle>{t("common.no_entries")}</Subtitle>}
          <View
            style={{
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: theme.colors.white,
            }}
          >
            {crops?.map((crop) => (
              <ListItem
                key={crop.id}
                style={{ paddingVertical: 5 }}
                onPress={() =>
                  navigation.navigate("EditCrop", {
                    cropId: crop.id,
                  })
                }
              >
                <ListItem.Content>
                  <ListItem.Title>{crop.name}</ListItem.Title>
                  <ListItem.Body>
                    {crop.variety ? crop.variety : t("crops.no_variety")}
                  </ListItem.Body>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            ))}
          </View>
        </View>
      </ScrollView>
      {canWrite("field_calendar") && (
        <FAB
          icon={{ name: "add", color: "white" }}
          onPress={() => navigation.navigate("CreateCrop")}
        />
      )}
    </ContentView>
  );
}
