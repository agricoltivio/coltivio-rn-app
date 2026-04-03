import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import React from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropFamiliesQuery } from "./cropFamilies.hooks";
import { CropFamiliesScreenProps } from "./navigation/crop-families-routes";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/features/user/users.hooks";

export function CropFamiliesScreen({ navigation }: CropFamiliesScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { cropFamilies } = useCropFamiliesQuery();

  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("crop_families.crop_families")}
      >
        <H2>{t("crop_families.crop_families")}</H2>
        <View style={{ marginTop: theme.spacing.m }}>
          {cropFamilies?.length === 0 && (
            <Subtitle>{t("common.no_entries")}</Subtitle>
          )}
          <View
            style={{
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: theme.colors.white,
            }}
          >
            {cropFamilies?.map((family) => (
              <ListItem
                key={family.id}
                style={{ paddingVertical: 5 }}
                onPress={() =>
                  navigation.navigate("EditCropFamily", {
                    familyId: family.id,
                  })
                }
              >
                <ListItem.Content>
                  <ListItem.Title>{family.name}</ListItem.Title>
                  <ListItem.Body>
                    {t("crop_families.waiting_time_years", {
                      count: family.waitingTimeInYears,
                    })}
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
          onPress={() => navigation.navigate("CreateCropFamily")}
        />
      )}
    </ContentView>
  );
}
