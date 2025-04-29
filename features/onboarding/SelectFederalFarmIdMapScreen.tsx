import { Button } from "@/components/buttons/Button";
import { AutocompleteInput } from "@/components/inputs/AutocompleteInput";
import { MapView } from "@/components/map/Map";
import { SelectFederalFarmIdMapScreenProps } from "@/features/onboarding/navigation/onboarding-routes";
import { hexToRgba } from "@/theme/theme";
import { H3 } from "@/theme/Typography";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useDebounce } from "@uidotdev/usehooks";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Geojson, Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import {
  useFederalFarmIdSearchQuery,
  usePlotsByLocationQuery,
} from "../federal-plots/federalPlots.hooks";
import { HomeMarker } from "../map/layers/HomeMarker";
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
    !!data.location
  );

  const [federalFarmId, setFederalFarmId] = useState<string | undefined>();
  const [federalFarmIdSearchText, setFederalFarmIdSearchText] = useState(
    data.federalFarmId || ""
  );

  const debouncedFederalFarmIdSearchText = useDebounce(
    federalFarmIdSearchText,
    800
  );

  const { federalFarmIds, isFetching } = useFederalFarmIdSearchQuery(
    debouncedFederalFarmIdSearchText,
    data.location?.lng!,
    data.location?.lat!,
    3,
    20,
    !data.federalFarmId && debouncedFederalFarmIdSearchText !== ""
  );

  function onChangeQuery(value: string) {
    // if (data.federalFarmId) {
    //   setData((prev) => ({ ...prev, federalFarmId: null }));
    // }
    setFederalFarmIdSearchText(value);
  }

  function onFederalFarmIdSelect(value: string) {
    // setFederalFarmIdSearchText(value);
    setFederalFarmId(value);
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("transitionEnd", () => {
      setMapVisible(true); // Render the map only after the transition ends
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

  const initialRegion: Region = {
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

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
    navigation.navigate("FarmSummary");
  }

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      <MapView
        loading={!mapVisible || isFetchingPlots}
        mapType="satellite"
        initialRegion={initialRegion}
      >
        {plots.map((parcel) => (
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
            tappable
            fillColor={hexToRgba(theme.colors.accent, 0.3)}
            onPress={() => onFederalFarmIdSelect(parcel.federalFarmId)}
          />
        ))}
        <HomeMarker latitude={lat} longitude={lng} />
      </MapView>
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
          onClose={() => navigation.navigate("FarmSummary")}
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
            // disabled={setupFarmMutation.isPending}
            onPress={() => navigation.goBack()}
          />
          <NavigationButton
            title={t("buttons.next")}
            icon="arrow-forward-circle-outline"
            onPress={() => navigation.navigate("FarmSummary")}
          />
        </View>
      </View>
      <BottomSheet
        ref={bottomSheetModalRef}
        enablePanDownToClose
        // onClose={}
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
