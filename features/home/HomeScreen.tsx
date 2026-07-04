import { SpeedDial } from "@/components/buttons/SpeedDial";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { MapTile } from "@/features/map/MapTile";
import { H1, H2 } from "@/theme/Typography";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useFarmQuery, useMembership } from "../farms/farms.hooks";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { useUserQuery, usePermissions } from "../user/users.hooks";
import { HomeTile } from "./HomeTile";
import { HOME_TILES } from "./home-tiles-settings";
import { UpcomingTasksTile } from "./UpcomingTasksTile";
import { HomeScreenProps } from "./navigation/home-routes";
import { SPEED_DIAL_ACTIONS } from "./speed-dial-settings";

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { t } = useTranslation();
  const { user } = useUserQuery();
  const { getAccess, canWrite } = usePermissions();
  const { farm } = useFarmQuery();
  const { isActive } = useMembership();
  const theme = useTheme();
  const { localSettings } = useLocalSettings();

  const speedDialItems = useMemo(() => {
    return localSettings.speedDialItems
      .filter((item) => {
        if (!item.active || !(item.id in SPEED_DIAL_ACTIONS)) return false;
        const action =
          SPEED_DIAL_ACTIONS[item.id as keyof typeof SPEED_DIAL_ACTIONS];
        if (
          "membershipRequired" in action &&
          action.membershipRequired &&
          !isActive
        )
          return false;
        if (!canWrite(action.accessFeature)) return false;
        return true;
      })
      .map((item) => {
        const action =
          SPEED_DIAL_ACTIONS[item.id as keyof typeof SPEED_DIAL_ACTIONS];
        return {
          id: item.id,
          icon: action.icon,
          onPress: () => navigation.navigate(action.route as never),
        };
      });
  }, [localSettings.speedDialItems, isActive, canWrite, navigation]);

  const visibleTiles = useMemo(() => {
    return localSettings.homeTiles
      .filter((tile) => tile.visible && tile.id in HOME_TILES)
      .filter((tile) => {
        const meta = HOME_TILES[tile.id as keyof typeof HOME_TILES];
        const membershipRequired =
          "membershipRequired" in meta && meta.membershipRequired;
        if (membershipRequired && !isActive) return false;
        // Hide tiles when user has no access to the relevant feature
        if (tile.id === "plots" && getAccess("field_calendar") === "none")
          return false;
        if (tile.id === "tasks" && getAccess("tasks") === "none") return false;
        if (tile.id === "animalHusbandry" && getAccess("animals") === "none")
          return false;
        if (
          tile.id === "fieldCalendar" &&
          getAccess("field_calendar") === "none"
        )
          return false;
        return true;
      })
      .map((tile) => ({
        id: tile.id,
        ...HOME_TILES[tile.id as keyof typeof HOME_TILES],
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSettings.homeTiles, isActive, user]);

  function navigateToTile(tileId: string) {
    if (tileId === "plots") {
      navigation.navigate("PlotsMap", {});
    } else {
      navigation.navigate(
        HOME_TILES[tileId as keyof typeof HOME_TILES].route as never,
      );
    }
  }

  const isList = localSettings.homeTilesLayout === "list";

  return (
    <>
      <ScrollView showHeaderOnScroll headerTitleOnScroll={farm?.name}>
        <ContentView headerVisible={true}>
          <View>
            {user?.fullName ? (
              <H1>{t("home.welcome_text", { displayName: user?.fullName })}</H1>
            ) : null}
            <H2>{farm?.name}</H2>
            {getAccess("field_calendar") !== "none" && (
              <View
                style={{
                  flex: 1,
                  marginTop: theme.spacing.l,
                  backgroundColor: theme.colors.white,
                  height: 250,
                  elevation: 8,
                  shadowColor: theme.colors.gray1,
                  shadowOffset: { width: 3, height: 3 },
                  shadowOpacity: 0.8,
                  shadowRadius: 5,
                  borderRadius: 10,
                }}
              >
                <MapTile />
              </View>
            )}
          </View>

          {isActive &&
            localSettings.showUpcomingTasks &&
            getAccess("tasks") !== "none" && <UpcomingTasksTile />}

          {isList ? (
            // List layout: full-width rows with small image icon and chevron
            <View
              style={{
                marginTop: theme.spacing.m,
                backgroundColor: theme.colors.white,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {visibleTiles.map((tile, index) => (
                <ListItem
                  key={tile.id}
                  onPress={() => navigateToTile(tile.id)}
                  hideBottomDivider={index === visibleTiles.length - 1}
                  style={{ alignItems: "center" }}
                >
                  <Image
                    source={tile.image}
                    contentFit="contain"
                    style={{
                      width: 36,
                      height: 36,
                      opacity: 0.85,
                      marginLeft: theme.spacing.m,
                    }}
                  />
                  <ListItem.Content>
                    <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                      {t(tile.translationKey)}
                    </ListItem.Title>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
              ))}
            </View>
          ) : (
            // Grid layout: natural flexWrap with fixed-size square tiles
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-around",
                marginTop: theme.spacing.m,
                gap: theme.spacing.m,
              }}
            >
              {visibleTiles.map((tile) => (
                <HomeTile
                  key={tile.id}
                  title={t(tile.translationKey)}
                  onPress={() => navigateToTile(tile.id)}
                  style={{ width: "47%" }}
                >
                  <Image
                    source={tile.image}
                    contentFit="contain"
                    style={{
                      height: 110,
                      opacity: 0.9,
                      borderBottomLeftRadius: 10,
                      borderBottomRightRadius: 10,
                    }}
                  />
                </HomeTile>
              ))}
            </View>
          )}
        </ContentView>
      </ScrollView>
      {localSettings.speedDialEnabled && speedDialItems.length > 0 ? (
        <SpeedDial items={speedDialItems} />
      ) : null}
    </>
  );
};
