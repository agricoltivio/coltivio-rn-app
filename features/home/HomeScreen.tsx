import { Button } from "@/components/buttons/Button";
import { SpeedDial } from "@/components/buttons/SpeedDial";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { MapTile } from "@/features/map/MapTile";
import { Body, H2, H3 } from "@/theme/Typography";
import { H1 } from "@/theme/Typography";
import { openMembershipUrl } from "@/utils/membership";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useFarmQuery, useMembership, useMembershipStatusQuery } from "../farms/farms.hooks";
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
  const { isActive, isInGracePeriod, graceDaysRemaining } = useMembership();
  const { membershipStatus } = useMembershipStatusQuery();
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

  // Prefer lastPeriodEnd (paid) over trialEnd as the dismissal key — changes when subscription renews
  const relevantExpiryIso =
    typeof membershipStatus?.lastPeriodEnd === "string" && membershipStatus.lastPeriodEnd.length > 0
      ? membershipStatus.lastPeriodEnd
      : typeof membershipStatus?.trialEnd === "string" && membershipStatus.trialEnd.length > 0
        ? membershipStatus.trialEnd
        : null;
  const expiryDate = relevantExpiryIso ? new Date(relevantExpiryIso) : null;
  const daysUntilExpiry = expiryDate
    ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  // Set firstLaunchDate once on the very first render after the app is installed
  const didInitLaunchDate = useRef(false);
  useEffect(() => {
    if (!didInitLaunchDate.current && localSettings.firstLaunchDate === null) {
      didInitLaunchDate.current = true;
      updateLocalSettings("firstLaunchDate", new Date().toISOString());
    }
  }, [localSettings.firstLaunchDate]);

  const daysSinceLaunch = localSettings.firstLaunchDate
    ? (Date.now() - new Date(localSettings.firstLaunchDate).getTime()) / (1000 * 60 * 60 * 24)
    : 0;
  // Show the promo modal once after 30 days, only to non-members
  const shouldShowPromo =
    !isActive &&
    !localSettings.agriColtivioPromoShown &&
    daysSinceLaunch >= 30;
  const [promoVisible, setPromoVisible] = useState(shouldShowPromo);

  function dismissPromo() {
    updateLocalSettings("agriColtivioPromoShown", true);
    setPromoVisible(false);
  }

  async function openMembershipAndDismiss() {
    await openMembershipUrl();
    dismissPromo();
  }

  const isBannerDismissed =
    localSettings.dismissedMembershipBannerForDate === relevantExpiryIso;
  const isTrial = typeof membershipStatus?.trialEnd === "string" && membershipStatus.trialEnd.length > 0
    && new Date(membershipStatus.trialEnd) > new Date()
    && !(typeof membershipStatus?.lastPeriodEnd === "string" && membershipStatus.lastPeriodEnd.length > 0);
  const isCancelled = !membershipStatus?.autoRenewing || !!membershipStatus?.cancelAtPeriodEnd;
  // Show expiry-soon banner only to the user who owns the membership
  const showExpirySoonBanner =
    !!membershipStatus && isCancelled && !isBannerDismissed && isActive &&
    daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 10;
  // Show expired/grace notice to the user who had the membership.
  // isInGracePeriod means isActive=true, so we check it separately.
  const showExpiredBanner =
    !!membershipStatus && isCancelled && !isBannerDismissed &&
    (isInGracePeriod || (!isActive && relevantExpiryIso !== null));

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
                onPress={() => navigation.navigate("UserMembership")}
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
                  backgroundColor: isInGracePeriod ? theme.colors.yellow : theme.colors.danger,
                  borderRadius: theme.radii.m,
                  padding: theme.spacing.m,
                  marginTop: theme.spacing.m,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("UserMembership")}
              >
                <H2
                  style={{
                    color: isInGracePeriod ? theme.colors.black : theme.colors.white,
                    fontSize: 15,
                    flex: 1,
                  }}
                >
                  {isInGracePeriod
                    ? t("membership.expired_grace_banner", { days: graceDaysRemaining })
                    : t("membership.expired_banner")}
                </H2>
                <TouchableOpacity onPress={dismissMembershipBanner} hitSlop={8}>
                  <Ionicons
                    name="close"
                    size={20}
                    color={isInGracePeriod ? theme.colors.black : theme.colors.white}
                  />
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

      <Modal
        visible={promoVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={dismissPromo}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {/* Header row with close button */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              paddingHorizontal: theme.spacing.m,
              paddingTop: theme.spacing.s,
            }}
          >
            <TouchableOpacity onPress={dismissPromo} hitSlop={12}>
              <Ionicons name="close" size={26} color={theme.colors.gray1} />
            </TouchableOpacity>
          </View>

          {/* Scrollable content mirrors AgriColtivioInfoScreen */}
          <ScrollView
            contentContainerStyle={{ padding: theme.spacing.m, paddingBottom: theme.spacing.xxl }}
          >
            <H2>{t("agri_coltivio.promo_intro")}</H2>
            <Body style={{ marginTop: theme.spacing.m }}>
              {t("agri_coltivio.section_1_pre")}
              <Text style={{ fontWeight: "bold" }}>{t("agri_coltivio.section_1_bold")}</Text>
              {t("agri_coltivio.section_1_post")}
            </Body>
            <Body style={{ marginTop: theme.spacing.l, fontWeight: "bold" }}>
              {t("agri_coltivio.section_4")}
            </Body>
            <H3 style={{ marginTop: theme.spacing.l }}>
              {t("membership.community_heading")}
            </H3>
            <Body style={{ marginTop: theme.spacing.m }}>
              {t("agri_coltivio.community_text")}
            </Body>
            <Body style={{ marginTop: theme.spacing.s }}>
              {t("agri_coltivio.community_text_2")}
            </Body>
          </ScrollView>

          {/* CTA pinned to bottom */}
          <View style={{ padding: theme.spacing.m }}>
            <Button
              title={t("agri_coltivio.become_member")}
              onPress={openMembershipAndDismiss}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};
