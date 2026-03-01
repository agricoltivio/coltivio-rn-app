import { ConservationMethod, HarvestUnit } from "@/api/harvests.api";
import { Card } from "@/components/card/Card";
import { ListItem } from "@/components/list/ListItem";
import { StaticMapPreview } from "@/components/map/StaticMapPreview";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import { Body, H2, H3 } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { type LngLat } from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
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
    geometry: GeoJSON.MultiPolygon;
    harvestSize: number;
    numberOfUnits: number;
    amountInKilos: number;
  }[];
  numberOfUnits: number;
  kilosPerUnit: number;
  producedKilos: number;
  unit: HarvestUnit;
  conservationMethod?: ConservationMethod | null;
  date: Date;
  cropName: string;
  additionalNotes?: string | null;
  hidePlotList?: boolean;
};

export function HarvestSummary({
  date,
  harvestAreas,
  cropName,
  kilosPerUnit,
  unit,
  conservationMethod,
  producedKilos,
  numberOfUnits,
  additionalNotes,
  hidePlotList,
}: HarvestSummaryProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const size = harvestAreas.reduce((acc, plot) => acc + plot.harvestSize, 0);
  const unitLabel = t(`harvests.labels.unit.${unit}`);

  const harvestCentroid = turf.centroid(harvestAreas[0].geometry);
  const center = harvestCentroid.geometry.coordinates as LngLat;

  const features = useMemo((): GeoJSON.FeatureCollection => ({
    type: "FeatureCollection",
    features: harvestAreas.map((area) => ({
      type: "Feature",
      properties: {},
      geometry: area.geometry,
    })),
  }), [harvestAreas]);
  const formattedDate = formatLocalizedDate(date, locale, "long");
  return (
    <ScrollView
      showHeaderOnScroll
      headerTitleOnScroll={t("harvests.harvest_date", { date: formattedDate })}
    >
      <H2>{t("harvests.harvest")}</H2>
      <H3>{formattedDate}</H3>
      <View style={{ marginTop: theme.spacing.m }}>
        <StaticMapPreview
          center={center}
          zoom={17}
          features={features}
          height={250}
        />
      </View>
      {/* <View>
        <H2 style={{ marginTop: theme.spacing.xl }}>Infos</H2>
      </View> */}
      <Card style={{ marginTop: theme.spacing.m }}>
        {hidePlotList && (
          <SummaryItem label={t("plots.plot")} value={harvestAreas[0]?.name} />
        )}
        <SummaryItem label={t("forms.labels.area")} value={`${size / 100}a`} />
        <SummaryItem
          label={t("forms.labels.produced_units")}
          value={`${numberOfUnits} ${unitLabel}`}
        />
        <SummaryItem
          label={`${t("units.short.kg")}/${t(`harvests.labels.unit.${unit}`)}`}
          value={`${kilosPerUnit}${t("units.short.kg")}`}
        />
        <SummaryItem
          label={t("forms.labels.total_unit", { unit: t("units.short.kg") })}
          value={`${producedKilos}${t("units.short.kg")}`}
        />
        <SummaryItem label={t("forms.labels.crop")} value={cropName} />
        {conservationMethod && (
          <SummaryItem
            label={t("forms.labels.conservation")}
            value={t(
              `harvests.labels.conservation_method.${conservationMethod}`,
            )}
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
                    {unitLabel}: {plot.numberOfUnits}
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
