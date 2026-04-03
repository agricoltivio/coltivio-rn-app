import { Herd } from "@/api/herds.api";
import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { useHerdsQuery } from "./herds.hooks";
import { HerdsScreenProps } from "./navigation/animals-routes";
import { usePermissions } from "@/features/user/users.hooks";

export function HerdsScreen({ navigation }: HerdsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { localSettings } = useLocalSettings();
  const { herds: unsortedHerds, isLoading } = useHerdsQuery();

  // Redirect to onboarding on first visit
  useEffect(() => {
    if (!localSettings.herdsOnboardingCompleted) {
      navigation.replace("HerdsOnboarding" as never);
    }
  }, []);
  const herds = unsortedHerds
    ?.slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  const renderItem = useCallback(
    ({ item: herd }: { item: Herd }) => (
      <ListItem
        key={herd.id}
        style={{ paddingVertical: 5 }}
        onPress={() => navigation.navigate("HerdEdit", { herdId: herd.id })}
      >
        <ListItem.Content>
          <ListItem.Title>{herd.name}</ListItem.Title>
          <ListItem.Body>
            {herd.animals.length} {t("animals.animals")}
          </ListItem.Body>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    ),
    [t, navigation],
  );

  return (
    <ContentView headerVisible>
      <ScrollView showHeaderOnScroll headerTitleOnScroll={t("animals.herds")}>
        <H2>{t("animals.herds")}</H2>

        <View style={{ marginTop: theme.spacing.m, flex: 1 }}>
          {!isLoading && (!herds || herds.length === 0) && (
            <Subtitle>{t("animals.no_herds")}</Subtitle>
          )}
          {herds && herds.length > 0 && (
            <FlatList
              scrollEnabled={false}
              contentContainerStyle={{
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
              data={herds}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
            />
          )}
        </View>
      </ScrollView>
      {canWrite("animals") && (
        <FAB
          icon={{ name: "add", color: "white" }}
          onPress={() => navigation.navigate("CreateHerd", {})}
        />
      )}
    </ContentView>
  );
}
