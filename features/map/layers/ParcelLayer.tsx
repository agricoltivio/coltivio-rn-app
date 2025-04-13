import { useInfiniteQueryParcelsByBBox as useInfiniteParcelsByBBoxQuery } from "@/api/layers.hooks";
import { SquareCta } from "@/components/buttons/SquareCta";
import { hexToRgba } from "@/theme/theme";
import { Portal } from "@gorhom/portal";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Geojson } from "react-native-maps";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import styled, { useTheme } from "styled-components/native";
import { useMapRegionAsPolygon } from "../hooks";
import { TouchableWithoutFeedback, Text, TouchableOpacity } from "react-native";

interface InsetsProps {
  insets: EdgeInsets;
}

export function ParcelLayer() {
  const {
    colors: { map },
  } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const viewportPolygon = useMapRegionAsPolygon();

  const { parcels, error, fetchMoreParcels, canLoadMore } =
    useInfiniteParcelsByBBoxQuery(viewportPolygon, 500);

  const onLoadMore = () => {
    fetchMoreParcels();
  };

  return (
    <React.Fragment>
      {parcels.map((feature) => (
        <Geojson
          key={feature.id}
          geojson={{
            type: "FeatureCollection",
            features: [
              { type: "Feature", geometry: feature.geometry, properties: {} },
            ],
          }}
          strokeWidth={map.defaultStrokeWidth}
          strokeColor={"white"}
          fillColor={hexToRgba(
            map.defaultParcelStrokeColor,
            map.defaultFillAlpha
          )}
        />
      ))}
      <Portal hostName="map-overlays">
        <LoadMoreOverlay
          insets={insets}
          style={{ display: canLoadMore ? "flex" : "none" }}
        >
          <SquareCta
            onPress={onLoadMore}
            text={t("map.buttons.load-more-parcels")}
          />
        </LoadMoreOverlay>
      </Portal>
    </React.Fragment>
  );
}
const LoadMoreOverlay = styled.View<InsetsProps>`
  position: absolute;
  bottom: ${({ theme, insets }) => insets.bottom + theme.spacing.xxl}px;
  left: 0;
  right: 0;
  justify-content: center;
  align-items: center;
`;
