import { FederalFarmPlot } from "@/api/layers.api";
import { ListItem } from "@/components/list/ListItem";
import { MapView } from "@/components/map/Map";
import { SelectParcelsScreenProps } from "@/features/onboarding/navigation/onboarding-routes";
import { hexToRgba } from "@/theme/theme";
import { H2, H3 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { Geojson, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { useFarmAndNearbyPlotsQuery } from "../federal-plots/federalPlots.hooks";
import { HomeMarker } from "../map/layers/HomeMarker";
import { NavigationButton } from "./NavigationButton";
import { useOnboarding } from "./OnboardingContext";
import { Stepper } from "./Stepper";

export function SelectParcelsScreen({ navigation }: SelectParcelsScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { data, setData } = useOnboarding();
  const [mapVisible, setMapVisible] = useState(false);
  const { plots: parcels, isFetching } = useFarmAndNearbyPlotsQuery(
    data.federalFarmId!,
    0.5
  );

  const farmParcels = Object.values(data.parcelsById).sort((a, b) =>
    a.communalId > b.communalId ? 1 : b.communalId > a.communalId ? -1 : 0
  );

  const aggregatedParcels: Record<
    string,
    { communalId: string; area: number }
  > = {};
  for (const farmParcel of farmParcels) {
    if (farmParcel.communalId in aggregatedParcels) {
      aggregatedParcels[farmParcel.communalId].area += farmParcel.area;
    } else {
      aggregatedParcels[farmParcel.communalId] = {
        communalId: farmParcel.communalId,
        area: farmParcel.area,
      };
    }
  }

  useEffect(() => {
    const farmParcelsById: Record<string, FederalFarmPlot> = {};
    if (parcels) {
      for (const parcel of parcels) {
        if (parcel.federalFarmId === data.federalFarmId) {
          farmParcelsById[parcel.id] = parcel;
        }
      }
      setData((prev) => ({
        ...prev,
        parcelsById: farmParcelsById,
      }));
    }
    return () => {
      setData((prev) => ({
        ...prev,
        parcelsById: {},
      }));
    };
  }, [parcels]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("transitionEnd", () => {
      setMapVisible(true); // Render the map only after the transition ends
    });

    return unsubscribe;
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: { communalId: string; area: number } }) => (
      <ListItem
        key={item.communalId}
        style={{
          paddingVertical: 5,

          backgroundColor: theme.colors.background,
          borderColor: theme.colors.gray3,
          borderBottomWidth: 1,
        }}
        // onPress={() => onFederalFarmIdSelected(item)}
      >
        <ListItem.Content>
          <ListItem.Title style={{ flex: 1 }}>
            Parzelle: {item.communalId}
          </ListItem.Title>
          <ListItem.Body>Fläche: {item.area}m²</ListItem.Body>
        </ListItem.Content>
      </ListItem>
    ),
    []
  );

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View style={{ height: 300 }}>
        {data.location ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ height: 300 }}
            loading={!mapVisible}
            initialRegion={{
              latitude: data.location!.lat,
              longitude: data.location!.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            mapType="satellite"
            //   onMapReady={() => setLoading(false)}
            onPress={() => navigation.navigate("SelectPlots")}
          >
            <HomeMarker
              latitude={data.location!.lat}
              longitude={data.location!.lng}
            />
            {mapVisible && parcels
              ? parcels.map((parcel) => (
                  <Geojson
                    key={parcel.id}
                    geojson={{
                      type: "FeatureCollection",
                      features: [
                        {
                          type: "Feature",
                          geometry: parcel.geometry,
                          properties: {},
                        },
                      ],
                    }}
                    strokeWidth={theme.map.defaultStrokeWidth}
                    strokeColor={"white"}
                    fillColor={hexToRgba(
                      parcel.id in data.parcelsById
                        ? theme.map.defaultFillColor
                        : theme.colors.white,
                      theme.map.defaultFillAlpha
                    )}
                    // tappable
                    // onPress={() => onParcelToggle(parcel)}
                  />
                ))
              : []}
          </MapView>
        ) : null}
        {mapVisible && (
          <TouchableOpacity
            style={{ position: "absolute", top: 250, right: 10 }}
            onPress={() => navigation.navigate("OnboardingStep4MapScreen")}
          >
            <View>
              <Ionicons
                size={35}
                color={theme.colors.white}
                name="expand-outline"
              />
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View
        style={{
          padding: theme.spacing.m,
          paddingTop: theme.spacing.l,
          flex: 1,
        }}
      >
        <View>
          <H2>Deine Parzellen</H2>
          <H3
            style={{ color: theme.colors.primary, marginTop: theme.spacing.s }}
          >
            Auf der Karte kannst du weitere hinzufügen oder entfernen.
          </H3>
        </View>
        <View
          style={{
            marginVertical: theme.spacing.m,
            flex: 1,
          }}
        >
          <H3 style={{ color: theme.colors.primary }}>Parzellen:</H3>
          {isFetching ? (
            <ActivityIndicator
              style={{ marginTop: theme.spacing.xl }}
              size={"large"}
            />
          ) : (
            <FlatList
              style={{ marginTop: theme.spacing.m }}
              contentContainerStyle={{
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
              data={Object.values(aggregatedParcels)}
              keyExtractor={(item) => item.communalId}
              renderItem={renderItem}
            />
          )}
        </View>
        <Stepper totalSteps={6} currentStep={4} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: insets.bottom + theme.spacing.xxs,
            marginHorizontal: theme.spacing.m,
          }}
        >
          <NavigationButton
            title="Zurück"
            icon="arrow-back-circle-outline"
            // disabled={setupFarmMutation.isPending}
            onPress={() => navigation.goBack()}
          />
          <NavigationButton
            title={t("buttons.next")}
            icon="arrow-forward-circle-outline"
            onPress={() => navigation.navigate("OnboardingStep5")}
          />
        </View>
      </View>
    </View>
  );
}
