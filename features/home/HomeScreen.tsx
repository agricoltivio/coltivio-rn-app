import { SpeedDial } from "@/components/buttons/SpeedDial";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { MapTile } from "@/features/map/MapTile";
import { H1, H2 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useFarmQuery, useMembership } from "../farms/farms.hooks";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { useUserQuery } from "../user/users.hooks";
import { HomeTile } from "./HomeTile";
import { HOME_TILES } from "./home-tiles-settings";
import { HomeScreenProps } from "./navigation/home-routes";
import { SPEED_DIAL_ACTIONS } from "./speed-dial-settings";

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { t } = useTranslation();
  const { user } = useUserQuery();
  const { farm } = useFarmQuery();
  const { isActive, isTrial } = useMembership();
  const theme = useTheme();
  const { localSettings, updateLocalSettings } = useLocalSettings();

  const speedDialItems = useMemo(() => {
    return localSettings.speedDialItems
      .filter((item) => item.active && item.id in SPEED_DIAL_ACTIONS)
      .map((item) => {
        const action =
          SPEED_DIAL_ACTIONS[item.id as keyof typeof SPEED_DIAL_ACTIONS];
        return {
          id: item.id,
          icon: action.icon,
          onPress: () => navigation.navigate(action.route as never),
        };
      });
  }, [localSettings.speedDialItems, t, navigation]);

  const visibleTiles = useMemo(() => {
    return localSettings.homeTiles
      .filter((tile) => tile.visible && tile.id in HOME_TILES)
      .filter((tile) => {
        const meta = HOME_TILES[tile.id as keyof typeof HOME_TILES];
        const membershipRequired = "membershipRequired" in meta && meta.membershipRequired;
        return !membershipRequired || isActive;
      })
      .map((tile) => ({
        id: tile.id,
        ...HOME_TILES[tile.id as keyof typeof HOME_TILES],
      }));
  }, [localSettings.homeTiles, isActive]);

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

  const membership = farm?.membership;
  // Prefer lastPeriodEnd (paid) over trialEnd as the dismissal key — changes when subscription renews
  const relevantExpiryIso =
    typeof membership?.lastPeriodEnd === "string" && membership.lastPeriodEnd.length > 0
      ? membership.lastPeriodEnd
      : typeof membership?.trialEnd === "string" && membership.trialEnd.length > 0
        ? membership.trialEnd
        : null;
  const expiryDate = relevantExpiryIso ? new Date(relevantExpiryIso) : null;
  const daysUntilExpiry = expiryDate
    ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const isBannerDismissed =
    localSettings.dismissedMembershipBannerForDate === relevantExpiryIso;
  const isOwner = user?.farmRole === "owner";
  const isCancelled = !membership?.autoRenewing || !!membership?.cancelAtPeriodEnd;
  // Show expiry-soon warning when active membership expires within 10 days and won't auto-renew
  const showExpirySoonBanner =
    isOwner && isCancelled && !isBannerDismissed && isActive &&
    daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 10;
  // Show expired notice when there was a membership but it's now past and won't auto-renew
  const showExpiredBanner =
    isOwner && isCancelled && !isBannerDismissed && !isActive && relevantExpiryIso !== null;

  function dismissMembershipBanner() {
    if (relevantExpiryIso) {
      updateLocalSettings("dismissedMembershipBannerForDate", relevantExpiryIso);
    }
  }

  return (
    <>
      <ScrollView showHeaderOnScroll headerTitleOnScroll={farm?.name}>
        <ContentView headerVisible={true}>
          <View>
            {user?.fullName ? (
              <H1>{t("home.welcome_text", { displayName: user?.fullName })}</H1>
            ) : null}
            <H2>{farm?.name}</H2>
            {showExpirySoonBanner && daysUntilExpiry !== null ? (
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.yellow,
                  borderRadius: theme.radii.m,
                  padding: theme.spacing.m,
                  marginTop: theme.spacing.m,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("FarmMembership")}
              >
                <H2 style={{ color: theme.colors.black, fontSize: 15, flex: 1 }}>
                  {isTrial
                    ? t("membership.trial_expiry_banner", { days: daysUntilExpiry })
                    : t("membership.expiry_banner", { days: daysUntilExpiry })}
                </H2>
                <TouchableOpacity onPress={dismissMembershipBanner} hitSlop={8}>
                  <Ionicons name="close" size={20} color={theme.colors.black} />
                </TouchableOpacity>
              </TouchableOpacity>
            ) : null}
            {showExpiredBanner ? (
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.danger,
                  borderRadius: theme.radii.m,
                  padding: theme.spacing.m,
                  marginTop: theme.spacing.m,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("FarmMembership")}
              >
                <H2 style={{ color: theme.colors.white, fontSize: 15, flex: 1 }}>
                  {t("membership.expired_banner")}
                </H2>
                <TouchableOpacity onPress={dismissMembershipBanner} hitSlop={8}>
                  <Ionicons name="close" size={20} color={theme.colors.white} />
                </TouchableOpacity>
              </TouchableOpacity>
            ) : null}
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
          </View>

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
