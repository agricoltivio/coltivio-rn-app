import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { hexToRgba } from "@/theme/theme";
import { H2 } from "@/theme/Typography";
import { round } from "@/utils/math";
import * as turf from "@turf/turf";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { MergePlotSummaryScreenProps } from "./navigation/plots-routes";
import { useFarmPlotsQuery, useMergePlotsMutation } from "./plots.hooks";
import { getUsageCodeSelectData } from "./usage-codes";

type MergeFormValues = {
  name: string;
  localId?: string;
  usage?: string;
  cuttingDate?: Date;
  size: string;
  additionalNotes?: string;
};

export function MergePlotSummaryScreen({
  route,
  navigation,
}: MergePlotSummaryScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plotIds } = route.params;
  const { plots } = useFarmPlotsQuery();

  const selectedPlots = useMemo(
    () => plots?.filter((p) => plotIds.includes(p.id)) ?? [],
    [plots, plotIds]
  );

  // Compute merged geometry by unioning all selected plots
  const mergedGeometry = useMemo(() => {
    if (selectedPlots.length === 0) return null;
    const features = selectedPlots.map((p) =>
      turf.multiPolygon(p.geometry.coordinates)
    );
    let merged = features[0];
    for (let i = 1; i < features.length; i++) {
      const result = turf.union(
        turf.featureCollection([merged, features[i]])
      );
      if (result) {
        merged =
          result.geometry.type === "Polygon"
            ? turf.multiPolygon([[...result.geometry.coordinates]])
            : turf.multiPolygon(result.geometry.coordinates);
      }
    }
    return merged.geometry as GeoJSON.MultiPolygon;
  }, [selectedPlots]);

  const mergedSize = mergedGeometry ? round(turf.area(mergedGeometry), 0) : 0;

  const mergedName = selectedPlots.map((p) => p.name).join(" + ");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MergeFormValues>({
    defaultValues: {
      name: mergedName,
      size: mergedSize.toString(),
    },
  });

  const mergeMutation = useMergePlotsMutation(
    () =>
      navigation.reset({
        index: 1,
        routes: [{ name: "Home" }, { name: "PlotsMap" }],
      }),
    (error) => console.error(error)
  );

  let initialRegion: Region | undefined;
  if (mergedGeometry) {
    const center = turf.center(turf.multiPolygon(mergedGeometry.coordinates));
    const [lng, lat] = center.geometry.coordinates;
    initialRegion = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
  }

  function onSubmit({ size, usage, cuttingDate, ...rest }: MergeFormValues) {
    if (!mergedGeometry) return;
    mergeMutation.mutate({
      strategy: "keep_reference",
      plotIds,
      ...rest,
      usage: usage ? Number(usage) : undefined,
      cuttingDate: cuttingDate?.toISOString(),
      geometry: mergedGeometry,
      size: Number(size),
    });
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            type="primary"
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmit)}
            disabled={mergeMutation.isPending}
            loading={mergeMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("plots.merge.summary.heading")}
        keyboardAware
      >
        <H2>{t("plots.merge.summary.heading")}</H2>
        {initialRegion && mergedGeometry && (
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
              <MultiPolygon
                polygon={mergedGeometry}
                strokeWidth={theme.map.defaultStrokeWidth}
                strokeColor="white"
                fillColor={hexToRgba(theme.map.defaultFillColor, 0.8)}
              />
            </MapView>
          </View>
        )}
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
            name="additionalNotes"
            control={control}
            label={t("forms.labels.additional_notes_optional")}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
