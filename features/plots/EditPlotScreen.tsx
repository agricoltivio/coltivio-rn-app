import * as turf from "@turf/turf";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { EditPlotScreenProps } from "@/navigation/rootStackTypes";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useFarmPlotsQuery,
  usePlotByIdQuery,
  useUpdatePlotMutation,
} from "./plots.hooks";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { Button } from "@/components/buttons/Button";
import { useMemo } from "react";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import { hexToRgba } from "@/theme/theme";
import { Card } from "@/components/card/Card";
import { useTranslation } from "react-i18next";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHSelect } from "@/components/select/RHSelect";
import { getUsageCodeSelectData } from "./usage-codes";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";

type EditPlotFormValues = {
  name: string;
  description?: string | null;
  localId?: string | null;
  usage?: string | null;
  cuttingDate?: Date | null;
  size: string;
};

export function EditPlotScreen({ route, navigation }: EditPlotScreenProps) {
  const { t } = useTranslation();
  const { plotId, area, polygon } = route.params;
  const theme = useTheme();
  const { plots } = useFarmPlotsQuery();
  const { plot } = usePlotByIdQuery(plotId);

  const updatePlotMutation = useUpdatePlotMutation(
    () => navigation.goBack(),
    (error) => console.error(error)
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditPlotFormValues>({
    values: plot
      ? {
          name: plot.name,
          description: plot.description,
          size: area?.toString() || plot.size.toString(),
          usage: plot.usage?.toString(),
          localId: plot.localId,
          cuttingDate: plot.cuttingDate ? new Date(plot.cuttingDate) : null,
        }
      : undefined,
  });

  const affectedPlots = useMemo(() => {
    if (polygon) {
      return plots?.filter((plot) => {
        if (plot.id === plotId) {
          return false;
        }
        const bufferedPolygons = plot.geometry.coordinates.map((polygon) =>
          turf.buffer(turf.polygon(polygon), -2, { units: "meters" })
        );
        return bufferedPolygons.some(
          (feature) => feature && turf.booleanIntersects(polygon, feature)
        );
      });
    } else {
      [];
    }
  }, [plots, polygon]);

  if (!plot) {
    return null;
  }
  const centroid = turf.centroid(plot.geometry);
  const [longitude, latitude] = centroid.geometry.coordinates;
  const initialRegion: Region = {
    latitude,
    longitude,
    latitudeDelta: 0.0025,
    longitudeDelta: 0.0025,
  };

  function onSubmit({ size, usage, ...rest }: EditPlotFormValues) {
    updatePlotMutation.mutate({
      plotId,
      data: {
        ...rest,
        size: Number(size),
        usage: Number(usage),
        cuttingDate: rest.cuttingDate?.toISOString() ?? null,
        geometry: polygon,
      },
    });
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <View style={{ flexDirection: "row", gap: theme.spacing.xs }}>
            <Button
              style={{ flex: 1 }}
              type="danger"
              title={t("buttons.delete")}
              onPress={() =>
                navigation.navigate("DeletePlot", { plotId, name: plot!.name })
              }
              disabled={updatePlotMutation.isPending}
            />
            <Button
              style={{ flex: 1 }}
              type="primary"
              title={t("buttons.save")}
              onPress={handleSubmit(onSubmit)}
              disabled={(!isDirty && !polygon) || updatePlotMutation.isPending}
            />
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={plot?.name}
        keyboardAware
      >
        <H2>{t("plots.plot_name", { name: plot?.name })}</H2>

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
            initialRegion={initialRegion}
            mapType="satellite"
            style={{ height: "100%" }}
          >
            {affectedPlots?.map((plot) => (
              <MultiPolygon
                key={plot.id}
                polygon={plot.geometry}
                strokeWidth={theme.map.defaultStrokeWidth}
                strokeColor="white"
                fillColor={hexToRgba(
                  theme.colors.danger,
                  theme.map.defaultFillAlpha
                )}
              />
            ))}
            <MultiPolygon
              polygon={polygon || plot.geometry}
              strokeWidth={theme.map.defaultStrokeWidth}
              strokeColor={"white"}
              fillColor={hexToRgba(theme.map.defaultFillColor, 0.8)}
            />
          </MapView>
        </View>
        {affectedPlots?.length ? (
          <Card
            style={{
              marginTop: theme.spacing.m,
              backgroundColor: theme.colors.danger,
            }}
          >
            <Subtitle style={{ color: "white" }}>
              {t("plots.common.affected_plots_warning")}
            </Subtitle>
            <Subtitle style={{ marginTop: theme.spacing.s, color: "white" }}>
              {affectedPlots.map((plot) => plot.name).join(", ")}
            </Subtitle>
          </Card>
        ) : null}
        <Button
          style={{ marginTop: theme.spacing.m }}
          type="accent"
          title={t("buttons.edit_area")}
          onPress={() => navigation.navigate("EditPlotMap", { plotId })}
        />
        <View
          style={{ gap: theme.spacing.xs, flex: 1, marginTop: theme.spacing.m }}
        >
          <RHTextInput
            name="name"
            control={control}
            label={t("forms.labels.name")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.name?.message}
          />
          <RHTextInput
            name="localId"
            control={control}
            label={t("forms.labels.local_id_optional")}
          />
          <RHSelect
            name="usage"
            data={getUsageCodeSelectData(t)}
            enableSearch
            control={control}
            label={t("forms.labels.usage_optional")}
          />
          <RHDatePicker
            name="cuttingDate"
            control={control}
            mode="date"
            label={t("forms.labels.cutting_date_optional")}
          />
          <RHNumberInput
            name="size"
            control={control}
            label={t("forms.labels.size_m2")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.size?.message}
          />
          <RHTextAreaInput
            name="description"
            control={control}
            label={t("forms.labels.additional_notes_optional")}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
