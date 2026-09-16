import { Button } from "@/components/buttons/Button";
import { MapLibreMap } from "@/components/map/MapLibreMap";
import { HomeMarkerLayer } from "@/components/map/HomeMarkerLayer";
import { SelectFederalFarmIdParcelMapScreenProps } from "@/features/onboarding/navigation/onboarding-routes";
import { hexToRgba } from "@/theme/theme";
import { H3 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import {
  GeoJSONSource,
  Layer,
  type LngLat,
} from "@maplibre/maplibre-react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { usePlotsByLocationQuery } from "../federal-plots/federalPlots.hooks";
import { MapInfoModal } from "../map/overlays/MapInfoModal";
import { useOnboarding } from "./OnboardingContext";

export function SelectFederalFarmIdMapScreen({
  navigation,
}: SelectFederalFarmIdParcelMapScreenProps) {
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

  // A new object on every tap, so tapping the same parcel again re-opens the sheet.
  // It is not reset on close, so the content doesn't change during the close animation.
  const [selection, setSelection] = useState<{
    federalFarmId: string;
  } | null>(null);
  const confirmedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("transitionEnd", () => {
      setMapVisible(true);
    });
    return unsubscribe;
  }, [navigation]);

  const bottomSheetModalRef = useRef<BottomSheet>(null);

  const { lng, lat } = data.location!;
  const initialCenter: LngLat = [lng, lat];

  useEffect(() => {
    if (selection) {
      bottomSheetModalRef.current?.expand();
    }
  }, [selection]);

  function handleOnConfirm() {
    if (!selection || confirmedRef.current) {
      return;
    }
    confirmedRef.current = true;
    const { federalFarmId } = selection;
    setData((prev) => ({ ...prev, federalFarmId }));
    bottomSheetModalRef.current?.close();
    // replace instead of navigate, so going back from the next step lands on the farm number
    // screen where the selection is visible
    navigation.replace("OnboardingPreference");
  }

  const parcelsFeatureCollection = useMemo(
    (): GeoJSON.FeatureCollection => ({
      type: "FeatureCollection",
      features: plots.map((parcel) => ({
        type: "Feature",
        properties: { federalFarmId: parcel.federalFarmId },
        geometry: parcel.geometry,
      })),
    }),
    [plots],
  );

  const handleParcelPress = useCallback(
    (event: {
      stopPropagation(): void;
      nativeEvent: { features: GeoJSON.Feature[] };
    }) => {
      event.stopPropagation();
      const feature = event.nativeEvent.features[0];
      const fid = feature?.properties?.federalFarmId;
      if (typeof fid === "string") {
        setSelection({ federalFarmId: fid });
      }
    },
    [],
  );

  const fillColor = hexToRgba(theme.colors.surface, 0.3);

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

      {mapVisible && plots.some((plot) => plot.federalFarmId) ? (
        <MapInfoModal
          title={t("onboarding.federal_farm_number.modal.heading")}
          text={t("onboarding.federal_farm_number.modal.body")}
        />
      ) : null}

      <TouchableOpacity
        style={{
          position: "absolute",
          top: insets.top + 12,
          left: 16,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "rgba(0,0,0,0.55)",
          justifyContent: "center",
          alignItems: "center",
        }}
        accessibilityRole="button"
        accessibilityLabel={t("buttons.back")}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      <BottomSheet
        ref={bottomSheetModalRef}
        enablePanDownToClose
        index={-1}
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
              federalFarmId: selection?.federalFarmId,
            })}
          </H3>
          <Button title={t("buttons.confirm")} onPress={handleOnConfirm} />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
