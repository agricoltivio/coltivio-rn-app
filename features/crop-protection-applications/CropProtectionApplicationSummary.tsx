import {
  CropProtectionApplicationMethod,
  CropProtectionApplicationUnit,
} from "@/api/cropProtectionApplications.api";
import { Card } from "@/components/card/Card";
import { ListItem } from "@/components/list/ListItem";
import { StaticMapPreview } from "@/components/map/StaticMapPreview";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import { Body, H2, H3 } from "@/theme/Typography";
import { formatLocalizedDateTime } from "@/utils/date";
import { type LngLat } from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import React, { useMemo } from "react";
import { Text, View } from "react-native";
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
  productUnit?: string;
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
  productUnit = "kg",
}: CropProtectionApplicationSummaryProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const size = plots.reduce((acc, plot) => acc + plot.size, 0);

  const centroid = turf.centroid(plots[0].geometry);
  const center = centroid.geometry.coordinates as LngLat;

  const features = useMemo((): GeoJSON.FeatureCollection => ({
    type: "FeatureCollection",
    features: plots.map((p) => ({
      type: "Feature",
      properties: {},
      geometry: p.geometry,
    })),
  }), [plots]);
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
      <View style={{ marginTop: theme.spacing.m }}>
        <StaticMapPreview center={center} zoom={17} features={features} height={250} />
      </View>
      <Card style={{ marginTop: theme.spacing.m }}>
        <SummaryItem label={t("forms.labels.area")} value={`${size / 100}a`} />
        <SummaryItem
          label={
            unit === "total_amount"
              ? t("common.total_amount")
              : unit === "amount_per_hectare"
                ? t("forms.labels.area_hectares")
                : t("forms.labels.amount_of_loads")
          }
          value={
            unit === "amount_per_hectare"
              ? `${round(totalNumberOfUnits, 2)} ha`
              : `${totalNumberOfUnits}`
          }
        />
        <SummaryItem
          label={
            unit === "amount_per_hectare"
              ? t("fertilizer_application.units.amount_per_hectare")
              : unit === "total_amount"
                ? t("forms.labels.total")
                : t("forms.labels.amount_per_load")
          }
          value={`${amountPerUnit} ${productUnit}`}
        />
        {unit !== "total_amount" && (
          <SummaryItem
            label={t("forms.labels.total")}
            value={`${round(amountPerUnit * totalNumberOfUnits, 2)} ${productUnit}`}
          />
        )}
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
                    {unit === "amount_per_hectare"
                      ? `${round(plot.numberOfUnits, 2)} ha → ${round(plot.numberOfUnits * amountPerUnit, 2)} ${productUnit}`
                      : `${round(plot.numberOfUnits * amountPerUnit, 2)} ${productUnit}`}
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
