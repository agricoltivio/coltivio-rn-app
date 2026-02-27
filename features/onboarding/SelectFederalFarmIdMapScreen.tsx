import { Button } from "@/components/buttons/Button";
import { AutocompleteInput } from "@/components/inputs/AutocompleteInput";
import { MapLibreMap } from "@/components/map/MapLibreMap";
import { HomeMarkerLayer } from "@/components/map/HomeMarkerLayer";
import { SelectFederalFarmIdMapScreenProps } from "@/features/onboarding/navigation/onboarding-routes";
import { hexToRgba } from "@/theme/theme";
import { H3 } from "@/theme/Typography";
import {
  GeoJSONSource,
  Layer,
  type LngLat,
} from "@maplibre/maplibre-react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import {
  useFederalFarmIdSearchQuery,
  usePlotsByLocationQuery,
} from "../federal-plots/federalPlots.hooks";
import { MapInfoModal } from "../map/overlays/MapInfoModal";
import { NavigationButton } from "./NavigationButton";
import { useOnboarding } from "./OnboardingContext";
import { Stepper } from "./Stepper";

export function SelectFederalFarmIdMapScreen({
  navigation,
}: SelectFederalFarmIdMapScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [mapVisible, setMapVisible] = useState(false);
  const { data, setData } = useOnboarding();
  const { plots, isFetching: isFetchingPlots } = usePlotsByLocationQuery(
    data.location!,
    1,
    !!data.location,
  );

  const [federalFarmId, setFederalFarmId] = useState<string | undefined>();
  const [federalFarmIdSearchText, setFederalFarmIdSearchText] = useState(
    data.federalFarmId || "",
  );

  const debouncedFederalFarmIdSearchText = useDebounce(
    federalFarmIdSearchText,
    800,
  );

  const { federalFarmIds, isFetching } = useFederalFarmIdSearchQuery(
    debouncedFederalFarmIdSearchText,
    data.location?.lng!,
    data.location?.lat!,
    3,
    20,
    !data.federalFarmId && debouncedFederalFarmIdSearchText !== "",
  );

  function onChangeQuery(value: string) {
    setFederalFarmIdSearchText(value);
  }

  function onFederalFarmIdSelect(value: string) {
    setFederalFarmId(value);
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("transitionEnd", () => {
      setMapVisible(true);
    });
    return unsubscribe;
  }, [navigation]);

  const bottomSheetModalRef = useRef<BottomSheet>(null);

  const handleExpandBottomDrawer = useCallback(() => {
    bottomSheetModalRef.current?.expand();
  }, []);

  const handleCloseBottomDrawer = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  const { lng, lat } = data.location!;
  const initialCenter: LngLat = [lng, lat];

  useEffect(() => {
    if (federalFarmId) {
      handleExpandBottomDrawer();
    }
  }, [federalFarmId]);

  function handleOnConfirm() {
    setData({
      ...data,
      federalFarmId: federalFarmId!,
    });
    handleCloseBottomDrawer();
    navigation.navigate("OnboardingPreference");
  }

  // Build feature collection for federal parcels
  const parcelsFeatureCollection = useMemo((): GeoJSON.FeatureCollection => ({
    type: "FeatureCollection",
    features: plots.map((parcel) => ({
      type: "Feature",
      properties: { federalFarmId: parcel.federalFarmId },
      geometry: parcel.geometry,
    })),
  }), [plots]);

  const handleParcelPress = useCallback(
    (event: { stopPropagation(): void; nativeEvent: { features: GeoJSON.Feature[] } }) => {
      event.stopPropagation();
      const feature = event.nativeEvent.features[0];
      const fid = feature?.properties?.federalFarmId;
      if (typeof fid === "string") {
        onFederalFarmIdSelect(fid);
      }
    },
    [],
  );

  const fillColor = hexToRgba(theme.colors.accent, 0.3);

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      <MapLibreMap
        loading={!mapVisible || isFetchingPlots}
        initialCenter={initialCenter}
        initialZoom={17}
      >
        <GeoJSONSource
          id="federal-parcels"
          data={parcelsFeatureCollection}
          onPress={handleParcelPress}
        >
          <Layer
            type="fill"
            id="federal-parcels-fill"
            paint={{
              "fill-color": fillColor,
              "fill-opacity": 1,
            }}
          />
          <Layer
            type="line"
            id="federal-parcels-stroke"
            paint={{
              "line-color": "white",
              "line-width": theme.map.defaultStrokeWidth,
            }}
          />
        </GeoJSONSource>
        <HomeMarkerLayer center={initialCenter} />
      </MapLibreMap>
      <View
        style={{
          position: "absolute",
          top: insets.top + 50,
          left: theme.spacing.m,
          right: theme.spacing.m,
        }}
      >
        <AutocompleteInput
          label={t("forms.labels.federal_farm_number")}
          placeholder={t("forms.placeholders.federal_farm_number")}
          setQuery={onChangeQuery}
          results={federalFarmIds ?? []}
          query={federalFarmIdSearchText}
          onResultSelect={onFederalFarmIdSelect}
          getListItemTitel={(item) => item}
          isLoading={isFetching}
          moveTopOnFocus={false}
        />
      </View>

      {mapVisible && plots?.length > 0 ? (
        <MapInfoModal
          title={t("onboarding.federal_farm_number.modal.heading")}
          text={t("onboarding.federal_farm_number.modal.body")}
        />
      ) : null}

      {mapVisible && !isFetchingPlots && plots?.length === 0 ? (
        <MapInfoModal
          title={t("onboarding.federal_farm_number.modal_not_found.heading")}
          text={t("onboarding.federal_farm_number.modal_not_found.body")}
          onClose={() => navigation.navigate("OnboardingPreference")}
        />
      ) : null}

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colors.background,
          paddingVertical: theme.spacing.m,
          paddingHorizontal: theme.spacing.m,
        }}
      >
        <Stepper totalSteps={4} currentStep={3} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: insets.bottom + theme.spacing.s,
            marginHorizontal: theme.spacing.m * 2,
          }}
        >
          <NavigationButton
            title={t("buttons.back")}
            icon="arrow-back-circle-outline"
            onPress={() => navigation.goBack()}
          />
          <NavigationButton
            title={t("buttons.next")}
            icon="arrow-forward-circle-outline"
            onPress={() => navigation.navigate("OnboardingPreference")}
          />
        </View>
      </View>
      <BottomSheet
        ref={bottomSheetModalRef}
        enablePanDownToClose
        index={-1}
        onClose={() => setFederalFarmId(undefined)}
        backdropComponent={(props) => {
          return <BottomSheetBackdrop disappearsOnIndex={-1} {...props} />;
        }}
      >
        <BottomSheetView
          style={{
            paddingBottom: insets.bottom + theme.spacing.s,
            paddingHorizontal: theme.spacing.l,
          }}
        >
          <H3
            style={{
              marginVertical: theme.spacing.l,
              fontSize: 16,
              textAlign: "center",
            }}
          >
            {t("onboarding.federal_farm_number.confirmation", {
              federalFarmId,
            })}
          </H3>
          <Button title={t("buttons.confirm")} onPress={handleOnConfirm} />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
