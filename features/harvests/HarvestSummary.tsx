import { ConservationMethod } from "@/api/harvestingMachinery.api";
import { ProcessingType } from "@/api/harvests.api";
import { Card } from "@/components/card/Card";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import { hexToRgba } from "@/theme/theme";
import { Body, H2, H3 } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import * as turf from "@turf/turf";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import MapView, { Geojson, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { useTheme } from "styled-components/native";

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

type HarvestSummaryProps = {
  harvestAreas: {
    plotId: string;
    name: string;
    harvestArea: GeoJSON.MultiPolygon;
    harvestSize: number;
    producedUnits: number;
    amountInKilos: number;
  }[];
  producedUnits: number;
  kilosPerUnit: number;
  producedKilos: number;
  processingType: ProcessingType;
  conservationMethod: ConservationMethod;
  date: string;
  machineryName?: string;
  cropName: string;
  additionalNotes?: string | null;
  hidePlotList?: boolean;
};

export function HarvestSummary({
  date,
  harvestAreas,
  cropName,
  kilosPerUnit,
  processingType,
  conservationMethod,
  machineryName,
  producedKilos,
  producedUnits,
  additionalNotes,
  hidePlotList,
}: HarvestSummaryProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const size = harvestAreas.reduce((acc, plot) => acc + plot.harvestSize, 0);
  const unitLabel = t(`harvests.labels.unit.${processingType}`);

  const harvestCentroid = turf.centroid(harvestAreas[0].harvestArea);
  const [longitude, latitude] = harvestCentroid.geometry.coordinates;
  const initialRegion: Region = {
    latitude,
    longitude,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  };
  const formattedDate = formatLocalizedDate(new Date(date), locale, "long");
  return (
    <ScrollView
      showHeaderOnScroll
      headerTitleOnScroll={t("harvests.harvest_date", { date: formattedDate })}
    >
      <H2>{t("harvests.harvest")}</H2>
      <H3>{formattedDate}</H3>
      <View
        style={{
          height: 250,
          borderRadius: 10,
          overflow: "hidden",
          marginTop: theme.spacing.m,
        }}
      >
        <MapView
          provider={PROVIDER_GOOGLE}
          rotateEnabled={false}
          initialRegion={initialRegion}
          mapType="satellite"
          style={{ height: "100%" }}
        >
          {harvestAreas.map((plot) => {
            return (
              <Geojson
                key={plot.plotId}
                geojson={{
                  type: "FeatureCollection",
                  features: [
                    {
                      type: "Feature",
                      geometry: plot.harvestArea,
                      properties: {},
                    },
                  ],
                }}
                strokeWidth={theme.map.defaultStrokeWidth}
                strokeColor={"white"}
                fillColor={hexToRgba(
                  theme.map.defaultFillColor,
                  theme.map.defaultFillAlpha
                )}
              />
            );
          })}
        </MapView>
      </View>
      {/* <View>
        <H2 style={{ marginTop: theme.spacing.xl }}>Infos</H2>
      </View> */}
      <Card style={{ marginTop: theme.spacing.m }}>
        <SummaryItem label={t("forms.labels.area")} value={`${size / 100}a`} />
        {machineryName && (
          <SummaryItem
            label={t("forms.labels.machine")}
            value={machineryName}
          />
        )}
        <SummaryItem
          label={t("forms.labels.produced_units")}
          value={`${producedUnits} ${unitLabel}`}
        />
        <SummaryItem
          label={`${t("units.short.kg")}/${t(`harvests.labels.unit.${processingType}`)}`}
          value={`${kilosPerUnit}${t("units.short.kg")}`}
        />
        <SummaryItem
          label={t("forms.labels.total_unit", { unit: t("units.short.kg") })}
          value={`${producedKilos}${t("units.short.kg")}`}
        />
        <SummaryItem label={t("forms.labels.crop")} value={cropName} />
        <SummaryItem
          label={t("forms.labels.conservation")}
          value={t(`harvests.labels.conservation_method.${conservationMethod}`)}
        />
        <SummaryItem
          label={t("forms.labels.processing_type")}
          value={t(`harvests.labels.processing_type.${processingType}`)}
        />
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
            Zusätzliche Notizen
          </Text>
          <Card elevated={false}>
            <Body>{additionalNotes}</Body>
          </Card>
        </>
      )}
      {!hidePlotList && (
        <>
          <View>
            <H3 style={{ marginTop: theme.spacing.l }}>{t("plots.plots")}</H3>
          </View>
          <View style={{ marginTop: theme.spacing.m }}>
            {harvestAreas.map((plot) => (
              <ListItem key={plot.plotId}>
                <ListItem.Content>
                  <ListItem.Title>
                    {t("plots.plot_name", { name: plot.name })}
                  </ListItem.Title>
                  <ListItem.Body>
                    {unitLabel}: {plot.producedUnits}
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
