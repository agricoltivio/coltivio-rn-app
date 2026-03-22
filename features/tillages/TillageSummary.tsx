import { TillageAction } from "@/api/tillages.api";
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

type SummaryProps = {
  plots: {
    plotId: string;
    name: string;
    geometry: GeoJSON.MultiPolygon;
    size: number;
  }[];
  date: Date;
  action: TillageAction;
  customAction?: string | null;
  additionalNotes?: string | null;
  hidePlotList?: boolean;
};

export function TillageSummary({
  date,
  plots,
  action,
  customAction,
  additionalNotes,
  hidePlotList,
}: SummaryProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const size = plots.reduce((acc, plot) => acc + plot.size, 0);

  const centroid = turf.centroid(plots[0].geometry);
  const center = centroid.geometry.coordinates as LngLat;

  const features = useMemo(
    (): GeoJSON.FeatureCollection => ({
      type: "FeatureCollection",
      features: plots.map((p) => ({
        type: "Feature",
        properties: {},
        geometry: p.geometry,
      })),
    }),
    [plots],
  );
  const formattedDate = formatLocalizedDate(date, locale, "long");
  return (
    <ScrollView
      showHeaderOnScroll
      headerTitleOnScroll={t("tillages.tillage_date", {
        date: formattedDate,
      })}
    >
      <H2>{t("tillages.tillage")}</H2>
      <H3>{formattedDate}</H3>
      <View style={{ marginTop: theme.spacing.m }}>
        <StaticMapPreview
          center={center}
          zoom={17}
          features={features}
          height={250}
        />
      </View>
      <Card style={{ marginTop: theme.spacing.m }}>
        <SummaryItem label={t("forms.labels.area")} value={`${size / 100}a`} />
        {action === "custom" ? (
          <SummaryItem
            label={t("forms.labels.action")}
            value={customAction || ""}
          />
        ) : (
          <SummaryItem
            label={t("forms.labels.action")}
            value={t(`tillages.actions.${action}`)}
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
                </ListItem.Content>
              </ListItem>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}
