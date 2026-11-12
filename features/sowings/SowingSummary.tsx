import { SowingUnit } from "@/api/sowings.api";
import { Card } from "@/components/card/Card";
import { ListItem } from "@/components/list/ListItem";
import { StaticMapPreview } from "@/components/map/StaticMapPreview";
import { Text } from "@/components/text/Text";
import { ScrollView } from "@/components/views/ScrollView";
import { Body, H2, H3 } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { computeCounterpart, formatArea, isPerAreaUnit } from "./sowingUnits";

function SummaryItem({ label, value }: { label: string; value: string }) {
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

type SowingSummaryProps = {
  sowingAreas: {
    plotId: string;
    name: string;
    geometry: GeoJSON.MultiPolygon;
    size: number;
    // per-area units: the rate, total units: this plot's share of the total
    amount: number;
  }[];
  unit: SowingUnit;
  date: Date;
  cropName: string;
  seedName?: string;
  additionalNotes?: string | null;
  hidePlotList?: boolean;
};

export function SowingSummary({
  sowingAreas,
  unit,
  date,
  cropName,
  seedName,
  additionalNotes,
  hidePlotList,
}: SowingSummaryProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  const size = sowingAreas.reduce((sum, area) => sum + area.size, 0);
  const perArea = isPerAreaUnit(unit);
  const unitLabel = t(`sowings.units.${unit}`);
  // per-area: one rate for all plots, total: the plots' shares add up
  const enteredAmount = perArea
    ? (sowingAreas[0]?.amount ?? 0)
    : sowingAreas.reduce((sum, area) => sum + area.amount, 0);
  const counterpart = computeCounterpart(enteredAmount, unit, size);

  const features = useMemo(
    (): GeoJSON.FeatureCollection => ({
      type: "FeatureCollection",
      features: sowingAreas.map((area) => ({
        type: "Feature",
        properties: {},
        geometry: area.geometry,
      })),
    }),
    [sowingAreas],
  );
  const formattedDate = formatLocalizedDate(date, i18n.language, "long");

  return (
    <ScrollView
      showHeaderOnScroll
      headerTitleOnScroll={t("sowings.sowing_date", { date: formattedDate })}
    >
      <H2>{t("sowings.sowing")}</H2>
      <H3>{formattedDate}</H3>
      <View style={{ marginTop: theme.spacing.m }}>
        <StaticMapPreview features={features} height={250} />
      </View>
      <Card style={{ marginTop: theme.spacing.m }}>
        {hidePlotList && (
          <SummaryItem label={t("plots.plot")} value={sowingAreas[0]?.name} />
        )}
        <SummaryItem label={t("forms.labels.area")} value={formatArea(size)} />
        {seedName && <SummaryItem label={t("sowings.seed")} value={seedName} />}
        <SummaryItem label={t("forms.labels.crop")} value={cropName} />
        <SummaryItem
          label={perArea ? t("sowings.rate") : t("sowings.total")}
          value={`${enteredAmount.toLocaleString()} ${unitLabel}`}
        />
        {counterpart && (
          <SummaryItem
            label={perArea ? t("sowings.total") : t("sowings.rate")}
            value={`${counterpart.amount.toLocaleString()} ${t(`sowings.units.${counterpart.unit}`)}`}
          />
        )}
      </Card>
      {additionalNotes ? (
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
      ) : null}
      {!hidePlotList && (
        <>
          <H3 style={{ marginTop: theme.spacing.l }}>{t("plots.plots")}</H3>
          <View style={{ marginTop: theme.spacing.m }}>
            {sowingAreas.map((area) => {
              // per-area: show what this plot got in total, total: its share
              const plotTotal = perArea
                ? computeCounterpart(area.amount, unit, area.size)
                : { amount: area.amount, unit };
              return (
                <ListItem key={area.plotId}>
                  <ListItem.Content>
                    <ListItem.Title>
                      {t("plots.plot_name", { name: area.name })} (
                      {formatArea(area.size)})
                    </ListItem.Title>
                    {plotTotal && (
                      <ListItem.Body>
                        {plotTotal.amount.toLocaleString()}{" "}
                        {t(`sowings.units.${plotTotal.unit}`)}
                      </ListItem.Body>
                    )}
                  </ListItem.Content>
                </ListItem>
              );
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}
