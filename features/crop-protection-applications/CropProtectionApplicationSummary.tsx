import {
  CropProtectionApplicationMethod,
  CropProtectionApplicationUnit,
} from "@/api/cropProtectionApplications.api";
import { Card } from "@/components/card/Card";
import { ListItem } from "@/components/list/ListItem";
import { MapView } from "@/components/map/Map";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import { hexToRgba } from "@/theme/theme";
import { Body, H2, H3 } from "@/theme/Typography";
import { formatLocalizedDateTime } from "@/utils/date";
import * as turf from "@turf/turf";
import React from "react";
import { Text, View } from "react-native";
import { PROVIDER_GOOGLE, Region } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { getMethodLabel } from "./cropProtectionApplication.utils";
import { useTranslation } from "react-i18next";
import { round } from "@/utils/math";

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        marginBottom: theme.spacing.s,
        gap: theme.spacing.m,
      }}
    >
      <Text style={{ flex: 1, fontWeight: 600, fontSize: 18 }}>{label}</Text>
      <Text style={{ fontSize: 18 }}>{value}</Text>
    </View>
  );
}

type CropProtectionApplicationSummaryProps = {
  plots: {
    plotId: string;
    name: string;
    geometry: GeoJSON.MultiPolygon;
    size: number;
    numberOfUnits: number;
  }[];
  totalNumberOfUnits: number;
  amountPerUnit: number;
  date: string;
  productName: string;
  additionalNotes?: string | null;
  unit: CropProtectionApplicationUnit;
  method?: CropProtectionApplicationMethod | null;
  hidePlotList?: boolean;
};

export function CropProtectionApplicationSummary({
  date,
  plots,
  productName,
  totalNumberOfUnits,
  amountPerUnit,
  additionalNotes,
  method,
  unit,
  hidePlotList,
}: CropProtectionApplicationSummaryProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const size = plots.reduce((acc, plot) => acc + plot.size, 0);

  const harvestCentroid = turf.centroid(plots[0].geometry);
  const [longitude, latitude] = harvestCentroid.geometry.coordinates;
  const initialRegion: Region = {
    latitude,
    longitude,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  };
  const formattedDate = formatLocalizedDateTime(new Date(date), locale, "long");
  return (
    <ScrollView
      showHeaderOnScroll
      headerTitleOnScroll={t(
        "crop_protection_applications.crop_protection_date",
      )}
    >
      <H2>{t("crop_protection_applications.crop_protection")}</H2>
      <H3>{formattedDate}</H3>
      <View
        style={{
          height: 250,
          borderRadius: 10,
          overflow: "hidden",
          marginTop: theme.spacing.m,
        }}
      >
        <MapView provider={PROVIDER_GOOGLE} initialRegion={initialRegion}>
          {plots.map((plot) => {
            return (
              <MultiPolygon
                key={plot.plotId}
                polygon={plot.geometry}
                strokeWidth={theme.map.defaultStrokeWidth}
                strokeColor={"white"}
                fillColor={hexToRgba(
                  theme.map.defaultFillColor,
                  theme.map.defaultFillAlpha,
                )}
              />
            );
          })}
        </MapView>
      </View>
      <Card style={{ marginTop: theme.spacing.m }}>
        <SummaryItem label={t("forms.labels.area")} value={`${size / 100}a`} />
        <SummaryItem
          label={t("forms.labels.amount_of_loads")}
          value={`${totalNumberOfUnits}`}
        />
        <SummaryItem
          label={t("forms.labels.amount_per_load")}
          value={`${amountPerUnit}${unit}`}
        />
        <SummaryItem
          label={t("forms.labels.total")}
          value={`${round(amountPerUnit * totalNumberOfUnits, 2)}${unit}`}
        />
        <SummaryItem
          label={t("forms.labels.crop_protection_product")}
          value={productName}
        />
        {method && (
          <SummaryItem
            label={t("forms.labels.method")}
            value={getMethodLabel(method)}
          />
        )}
      </Card>
      {additionalNotes && (
        <>
          <Text
            style={{
              fontWeight: 600,
              fontSize: 18,
              marginTop: theme.spacing.m,
              marginBottom: theme.spacing.s,
            }}
          >
            {t("forms.labels.additional_notes")}
          </Text>
          <Card elevated={false}>
            <Body>{additionalNotes}</Body>
          </Card>
        </>
      )}
      {!hidePlotList && (
        <>
          <View>
            <H3 style={{ marginTop: theme.spacing.l }}>Schläge</H3>
          </View>
          <View style={{ marginTop: theme.spacing.m }}>
            {plots.map((plot) => (
              <ListItem key={plot.plotId}>
                <ListItem.Content>
                  <ListItem.Title>
                    {t("plots.plot_name", { name: plot.name })}
                  </ListItem.Title>
                  <ListItem.Body>
                    {plot.numberOfUnits * amountPerUnit}
                    {unit}
                  </ListItem.Body>
                </ListItem.Content>
              </ListItem>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}
