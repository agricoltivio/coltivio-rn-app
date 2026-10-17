import { Meadow } from "@/api/meadows.api";
import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2, Subtitle } from "@/theme/Typography";
import { round } from "@/utils/math";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useMeadowDraftStore } from "./meadow-draft.store";
import { useMeadowsQuery } from "./meadows.hooks";
import { MeadowsScreenProps } from "./navigation/animals-routes";

export function MeadowsScreen({ navigation }: MeadowsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { meadows: unsortedMeadows, isLoading } = useMeadowsQuery();
  const resetMeadowDraft = useMeadowDraftStore((state) => state.reset);

  const meadows = unsortedMeadows
    ?.slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  const renderItem = useCallback(
    ({ item: meadow }: { item: Meadow }) => (
      <ListItem
        key={meadow.id}
        style={{ paddingVertical: 5 }}
        onPress={() =>
          navigation.navigate("MeadowDetails", { meadowId: meadow.id })
        }
      >
        <ListItem.Content>
          <ListItem.Title>{meadow.name}</ListItem.Title>
          <ListItem.Body>
            {t("animals.meadows.size_value", {
              are: round(meadow.size / 100, 1),
              squareMeters: round(meadow.size, 0),
            })}
          </ListItem.Body>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    ),
    [t, navigation],
  );

  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("animals.meadows.meadows")}
      >
        <H2>{t("animals.meadows.meadows")}</H2>

        <View style={{ marginTop: theme.spacing.m, flex: 1 }}>
          {!isLoading && (!meadows || meadows.length === 0) && (
            <Subtitle>{t("animals.meadows.no_meadows")}</Subtitle>
          )}
          {meadows && meadows.length > 0 && (
            <FlatList
              scrollEnabled={false}
              contentContainerStyle={{
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
              data={meadows}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
            />
          )}
        </View>
      </ScrollView>
      {canWrite("animals") && (
        <FAB
          icon={{ name: "add", color: "white" }}
          onPress={() => {
            resetMeadowDraft();
            navigation.navigate("PlotsMap", {
              meadowAction: { type: "create" },
            });
          }}
        />
      )}
    </ContentView>
  );
}
