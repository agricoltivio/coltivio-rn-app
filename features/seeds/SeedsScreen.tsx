import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2, Subtitle } from "@/theme/Typography";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { SeedsScreenProps } from "./navigation/seed-routes";
import { useSeedsQuery } from "./seeds.hooks";

export function SeedsScreen({ navigation }: SeedsScreenProps) {
  const { t } = useTranslation();
  const { canWrite } = usePermissions();
  const theme = useTheme();
  const { seeds } = useSeedsQuery();

  return (
    <>
      <ScrollView showHeaderOnScroll headerTitleOnScroll={t("seeds.seeds")}>
        <ContentView headerVisible>
          <H2>{t("seeds.seeds")}</H2>
          <View style={{ marginTop: theme.spacing.m }}>
            {seeds?.length === 0 && (
              <Subtitle>{t("common.no_entries")}</Subtitle>
            )}
            <View
              style={{
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
            >
              {seeds?.map((seed) => (
                <ListItem
                  key={seed.id}
                  style={{ paddingVertical: 5 }}
                  onPress={() =>
                    navigation.navigate("EditSeed", { seedId: seed.id })
                  }
                >
                  <ListItem.Content>
                    <ListItem.Title>{seed.name}</ListItem.Title>
                    <ListItem.Body>
                      {seed.crop.name}
                      {seed.defaultAmount != null && seed.defaultUnit
                        ? `, ${seed.defaultAmount} ${t(`sowings.units.${seed.defaultUnit}`)}`
                        : ""}
                    </ListItem.Body>
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
          onPress={() => navigation.navigate("CreateSeed")}
        />
      )}
    </>
  );
}
