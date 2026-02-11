import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { MapTile } from "@/features/map/MapTile";
import { H1, H2 } from "@/theme/Typography";
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useFarmQuery } from "../farms/farms.hooks";
import { useUserQuery } from "../user/users.hooks";
import { HomeTile } from "./HomeTile";
import { HomeScreenProps } from "./navigation/home-routes";

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { t } = useTranslation();
  const { user } = useUserQuery();
  const { farm } = useFarmQuery();
  const theme = useTheme();

  return (
    <ScrollView showHeaderOnScroll headerTitleOnScroll={farm?.name}>
      <ContentView headerVisible={true}>
        <View>
          {user?.fullName ? (
            <H1>{t("home.welcome_text", { displayName: user?.fullName })}</H1>
          ) : null}
          <H2>{farm?.name}</H2>
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
        <View
          style={{
            flexDirection: "row",
            marginTop: theme.spacing.m,
            gap: theme.spacing.m,
          }}
        >
          <HomeTile
            title={t("home.tiles.farm")}
            // style={{ shadowOpacity: 0.4 }}
            // style={{ width: 150 }}
            onPress={() => navigation.navigate("Farm")}
          >
            <Image
              source={require("@/assets/images/farm-icon-6.png")}
              contentFit="contain"
              style={{
                height: 110,
                opacity: 0.9,
                marginBottom: theme.spacing.xxs,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
              }}
            />
          </HomeTile>
          <HomeTile
            title={t("home.tiles.plots")}
            onPress={() => navigation.navigate("Plots")}
          >
            <Image
              source={require("@/assets/images/field-calendar-icon-4.png")}
              contentFit="contain"
              style={{
                marginBottom: theme.spacing.xs,
                height: 110,
                opacity: 0.9,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
              }}
            />
          </HomeTile>
        </View>
        <View
          style={{
            flexDirection: "row",
            marginTop: theme.spacing.m,
            gap: theme.spacing.m,
          }}
        >
          <HomeTile
            title={t("home.tiles.field_calendar")}
            onPress={() => navigation.navigate("FieldCalendar")}
          >
            <Image
              source={require("@/assets/images/harvest-icon.png")}
              contentFit="contain"
              style={{
                height: 110,
                opacity: 0.9,
                marginBottom: theme.spacing.xxs,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
              }}
            />
          </HomeTile>

          <HomeTile
            title={t("home.tiles.animal_husbandry")}
            onPress={() => navigation.navigate("AnimalsHub")}
          >
            <Image
              source={require("@/assets/images/animals-icon.png")}
              contentFit="contain"
              style={{
                height: 110,
                opacity: 0.9,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
              }}
            />
          </HomeTile>
        </View>
        {/* <View
          style={{
            flexDirection: "row",
            marginTop: theme.spacing.m,
            gap: theme.spacing.m,
          }}
        >
          <HomeTile
            title={t("home.tiles.animal_husbandry")}
            onPress={() => navigation.navigate("AnimalsHub")}
          >
            <Image
              source={require("@/assets/images/animals-icon.png")}
              contentFit="contain"
              style={{
                height: 110,
                opacity: 0.9,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
              }}
            />
          </HomeTile>
          <HomeTile title={t("home.tiles.community")} disabled>
            <View style={{ overflow: "hidden" }}>
              <Image
                source={require("@/assets/images/community-icon-3.png")}
                contentFit="contain"
                style={{
                  height: 110,
                  opacity: 0.9,
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,

                  marginBottom: theme.spacing.xs,
                }}
              />
            </View>
          </HomeTile>
        </View> */}
        {/* <View
          style={{
            flexDirection: "row",
            marginTop: theme.spacing.m,
            gap: theme.spacing.m,
          }}
        >
          <HomeTile onPress={() => navigation.navigate("AgriColtivioInfo")}>
            <View style={{ padding: theme.spacing.m }}>
              <H1 style={{ textAlign: "center" }}>AgriColtivio</H1>
            </View>
          </HomeTile>
          <Button title="Agri Coltivio" />
        </View> */}
      </ContentView>
    </ScrollView>
  );
};
