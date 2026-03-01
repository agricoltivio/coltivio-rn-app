import { Card } from "@/components/card/Card";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { StaticMapPreview } from "@/components/map/StaticMapPreview";
import { ScrollView } from "@/components/views/ScrollView";
import { PlotDetailsScreenProps } from "./navigation/plots-routes";
import { Body, H2, H3, Label } from "@/theme/Typography";
import { type LngLat } from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { usePlotByIdQuery } from "./plots.hooks";
import { UsageCode } from "./usage-codes";
import { formatLocalizedDate } from "@/utils/date";
import { locale } from "@/locales/i18n";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";

export function PlotDetailsScreen({
  route,
  navigation,
}: PlotDetailsScreenProps) {
  const { t } = useTranslation();
  const { plotId } = route.params;
  const { plot, error } = usePlotByIdQuery(plotId);
  const theme = useTheme();

  const size = plot?.size ?? 0;
  if (!plot) {
    return null;
  }

  const hasGeometry = plot.geometry.coordinates.length > 0;
  const center = hasGeometry
    ? (turf.centroid(plot.geometry).geometry.coordinates as LngLat)
    : undefined;

  const features = useMemo((): GeoJSON.FeatureCollection => ({
    type: "FeatureCollection",
    features: hasGeometry
      ? [{ type: "Feature", properties: {}, geometry: plot.geometry }]
      : [],
  }), [plot.geometry, hasGeometry]);

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <View style={{ gap: theme.spacing.s, flexDirection: "row" }}>
            <Button
              style={{ flexGrow: 1 }}
              type="danger"
              title={t("buttons.delete")}
              onPress={() =>
                navigation.navigate("DeletePlot", { plotId, name: plot.name })
              }
            />
            <Button
              style={{ flexGrow: 1 }}
              type="accent"
              title={t("buttons.edit")}
              onPress={() => navigation.navigate("EditPlot", { plotId })}
            />
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("plots.plot_name", { name: plot.name })}
      >
        <H2>{t("plots.plot_name", { name: plot.name })}</H2>
        <H3>
          {plot.usage
            ? `${t(`plots.usage_codes.${plot.usage as UsageCode}`)}`
            : ""}
        </H3>
        {center && (
          <View style={{ marginTop: theme.spacing.m }}>
            <StaticMapPreview center={center} zoom={16} features={features} height={250} />
          </View>
        )}
        <Card style={{ marginTop: theme.spacing.m }}>
          <SummaryItem
            label={t("forms.labels.local_id")}
            value={plot.localId ?? t("common.unknown")}
          />
          <SummaryItem
            label={t("forms.labels.area")}
            value={`${size / 100}a`}
          />
          <SummaryItem
            label={t("forms.labels.usagecode")}
            value={plot.usage ? plot.usage : t("common.unknown")}
          />
          <SummaryItem
            label={t("forms.labels.cutting_date")}
            value={
              plot.cuttingDate
                ? formatLocalizedDate(
                    new Date(plot.cuttingDate),
                    locale,
                    "long",
                    false
                  )
                : ""
            }
          />
          {plot.additionalNotes ? (
            <>
              <Label style={{ marginTop: theme.spacing.m }}>
                {t("forms.labels.additional_notes")}
              </Label>

              <Label>
                <Body>{plot.additionalNotes}</Body>
              </Label>
            </>
          ) : null}
        </Card>
        <View
          style={{
            marginTop: theme.spacing.m,
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: theme.colors.white,
          }}
        >
          <ListItem
            style={{ backgroundColor: theme.colors.white }}
            onPress={() =>
              navigation.navigate("PlanCropRotations", {
                plotIds: [plotId],
                previousScreen: "PlotDetails",
              })
            }
          >
            <ListItem.Content>
              <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                {t("crop_rotations.crop_rotation")}
              </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <ListItem
            style={{ backgroundColor: theme.colors.white }}
            onPress={() =>
              navigation.navigate("PlotHarvests", {
                plotId: plotId,
                name: plot!.name,
              })
            }
          >
            <ListItem.Content>
              <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                {t("harvests.harvest")}
              </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <ListItem
            style={{ backgroundColor: theme.colors.white }}
            onPress={() =>
              navigation.navigate("PlotFertilizerApplications", {
                plotId: plotId,
                name: plot!.name,
              })
            }
          >
            <ListItem.Content>
              <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                {t("fertilizer_application.fertilizer_application")}
              </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <ListItem
            style={{ backgroundColor: theme.colors.white }}
            onPress={() =>
              navigation.navigate("PlotTillages", {
                plotId: plotId,
                name: plot!.name,
              })
            }
          >
            <ListItem.Content>
              <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                {t("tillages.tillage")}
              </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <ListItem
            style={{ backgroundColor: theme.colors.white }}
            onPress={() =>
              navigation.navigate("PlotCropProtectionApplications", {
                plotId: plotId,
                name: plot!.name,
              })
            }
            hideBottomDivider
          >
            <ListItem.Content>
              <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                {t("crop_protection_applications.crop_protection")}
              </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        </View>
      </ScrollView>
    </ContentView>
  );
}

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
      <Label style={{ flex: 1 }}>{label}</Label>
      <Label style={{ fontSize: 18 }}>{value}</Label>
    </View>
  );
}
