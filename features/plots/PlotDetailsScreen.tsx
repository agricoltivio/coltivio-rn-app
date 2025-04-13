import { FAB } from "@/components/buttons/FAB";
import { Card } from "@/components/card/Card";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import { ScrollView } from "@/components/views/ScrollView";
import { PlotDetailsScreenProps } from "@/navigation/rootStackTypes";
import { hexToRgba } from "@/theme/theme";
import { Body, H2, H3, Label } from "@/theme/Typography";
import * as turf from "@turf/turf";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { usePlotByIdQuery } from "./plots.hooks";
import { UsageCode } from "./usage-codes";
import { formatLocalizedDate } from "@/utils/date";
import { locale } from "@/locales/i18n";

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

  let initialRegion: Region | undefined;

  if (plot.geometry.coordinates.length > 0) {
    const centroid = turf.centroid(plot.geometry);
    const [longitude, latitude] = centroid.geometry.coordinates;
    initialRegion = {
      latitude,
      longitude,
      latitudeDelta: 0.0025,
      longitudeDelta: 0.0025,
    };
  }

  return (
    <ContentView>
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
        {initialRegion && (
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
              style={{
                flex: 1,
              }}
              initialRegion={initialRegion}
              mapType="satellite"
            >
              <MultiPolygon
                polygon={plot.geometry}
                strokeWidth={theme.map.defaultStrokeWidth}
                strokeColor={"white"}
                fillColor={hexToRgba(
                  theme.map.defaultFillColor,
                  theme.map.defaultFillAlpha
                )}
                tappable
              />
            </MapView>
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
          {plot.description ? (
            <>
              <Label style={{ marginTop: theme.spacing.m }}>
                {t("forms.labels.additional_notes")}
              </Label>

              <Label>
                <Body>{plot.description}</Body>
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
              navigation.navigate("PlotCropRotations", {
                plotId: plotId,
                name: plot!.name,
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
      <FAB
        icon={{ name: "pencil", color: theme.colors.white }}
        onPress={() => navigation.navigate("EditPlot", { plotId })}
      />
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
