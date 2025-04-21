import { Parcel } from "@/api/parcels.api";
import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import {
  DrawAction,
  PolygonDrawingTool,
  PolygonDrawingToolActions,
} from "@/components/map/PolygonDrawingTool";
import { deviceHeight, deviceWidth } from "@/constants/Screen";
import { HomeMarker } from "@/features/map/layers/HomeMarker";
import { PlotsMapScreenProps } from "../plots/navigation/plots-routes";
import { hexToRgba } from "@/theme/theme";
import { H3, Subtitle } from "@/theme/Typography";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import MapView, { Geojson, MapPressEvent, Region } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { useFarmQuery } from "../farms/farms.hooks";
import { TopLeftBackButton } from "../map/TopLeftBackButton";
import { MapShowLocationToggle } from "../map/MapShowLocationToggle";
import { useFarmParcels } from "./farmParcels.hooks";
import { PortalHost } from "@gorhom/portal";

export function FarmParcelsMapScreen({ navigation }: PlotsMapScreenProps) {
  const theme = useTheme();
  const { farm } = useFarmQuery();
  const { parcels } = useFarmParcels();
  const [showsUserLocation, setShowsUserLocation] = useState<boolean>(false);
  const [selectedParcel, setSelecteParcel] = useState<Parcel | null>(null);
  const [drawingAction, setDrawingAction] = useState<DrawAction>("select");
  const mapRef = useRef<MapView>(null);

  if (!farm || !parcels) {
    return null;
  }

  const [longitude, latitude] = farm.location.coordinates;

  const initialRegion: Region = {
    latitude,
    longitude,
    latitudeDelta: 0.004,
    longitudeDelta: 0.004,
  };

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleExpandBottomDrawer = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleDismissBottomDrawer = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  navigation.addListener("focus", () => {
    if (selectedParcel) {
      handleExpandBottomDrawer();
    }
  });

  function onParcelSelect(parcel: Parcel) {
    if (selectedParcel?.id === parcel.id) {
      handleDismissBottomDrawer();
      setSelecteParcel(null);
    } else {
      setSelecteParcel(parcel);
      handleExpandBottomDrawer();
    }
  }

  function handleMapPress(event: MapPressEvent) {
    if (drawingAction === "draw") {
      event.stopPropagation();
      polygonDrawingToolRef.current?.drawToPoint(event.nativeEvent.coordinate);
    }
  }
  const polygonDrawingToolRef = useRef<PolygonDrawingToolActions>(null);

  const parcelPolygons = useMemo(
    () =>
      parcels.map((parcel) => (
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
            parcel.id === selectedParcel?.id
              ? theme.colors.success
              : theme.colors.secondary,
            theme.map.defaultFillAlpha
          )}
          tappable
          onPress={() => onParcelSelect(parcel)}
        />
      )),
    [parcels]
  );

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        width: deviceWidth,
        height: deviceHeight,
      }}
    >
      <MapView
        ref={mapRef}
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
        mapType="satellite"
        onPress={handleMapPress}
        initialRegion={initialRegion}
        showsUserLocation={showsUserLocation}
        followsUserLocation={true}
      >
        {parcelPolygons}
        <HomeMarker latitude={latitude} longitude={longitude} />
        <PolygonDrawingTool
          portalName="Test"
          ref={polygonDrawingToolRef}
          onDrawActionChange={(action) => setDrawingAction(action)}
          magnifierMapContent={parcelPolygons}
        />
      </MapView>
      <MapShowLocationToggle onPermissionStatusChange={setShowsUserLocation} />
      <TopLeftBackButton />
      <BottomSheetModalProvider>
        <BottomDrawerModal
          onClose={() => setSelecteParcel(null)}
          ref={bottomSheetModalRef}
          backdropDisappearsOnIndex={0}
        >
          <View
            style={{
              paddingVertical: theme.spacing.m,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <H3 style={{ flex: 1 }}>Parzelle {selectedParcel?.communalId}</H3>

              <Button
                title="Details"
                onPress={() => {
                  // handleDismissBottomDrawer();
                  navigation.navigate("FarmParcelDetails", {
                    plotId: selectedParcel!.id,
                  });
                }}
              />
            </View>
            <Subtitle>{Number(selectedParcel?.size) / 100} Aren</Subtitle>
          </View>
        </BottomDrawerModal>
      </BottomSheetModalProvider>
      <PortalHost name="Test" />
    </View>
  );
}
