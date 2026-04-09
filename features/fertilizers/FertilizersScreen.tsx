import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { FertilizersScreenProps } from "./navigation/fertilizer-routes";
import { usePermissions } from "@/features/user/users.hooks";
import { H2, Subtitle } from "@/theme/Typography";
import React from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useFertilizersQuery } from "./fertilizers.hooks";
import { useTranslation } from "react-i18next";

export function FertilizersScreen({
  route,
  navigation,
}: FertilizersScreenProps) {
  const { t } = useTranslation();
  const { canWrite } = usePermissions();
  const theme = useTheme();
  const { fertilizers } = useFertilizersQuery();

  return (
    <>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("fertilizers.fertilizer")}
      >
        <ContentView headerVisible>
          <H2>{t("fertilizers.fertilizer")}</H2>
          <View style={{ marginTop: theme.spacing.m }}>
            {fertilizers?.length === 0 && (
              <Subtitle>{t("common.no_entries")}</Subtitle>
            )}
            <View
              style={{
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
            >
              {fertilizers?.map((fertilizer) => (
                <ListItem
                  key={fertilizer.id}
                  style={{ paddingVertical: 5 }}
                  onPress={() =>
                    navigation.navigate("EditFertilizer", {
                      fertilizerId: fertilizer.id,
                    })
                  }
                >
                  <ListItem.Content>
                    <ListItem.Title>{fertilizer.name}</ListItem.Title>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
              ))}
            </View>
          </View>
        </ContentView>
      </ScrollView>
      {canWrite("field_calendar") && (
        <FAB
          icon={{ name: "add", color: "white" }}
          onPress={() => navigation.navigate("CreateFertilizer")}
        />
      )}
    </>
  );
}
