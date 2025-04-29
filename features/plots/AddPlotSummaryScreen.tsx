import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { AddPlotSummaryScreenProps } from "./navigation/plots-routes";
import { hexToRgba } from "@/theme/theme";
import { H2, Subtitle } from "@/theme/Typography";
import * as turf from "@turf/turf";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { useCropsQuery } from "../crops/crops.hooks";
import { useCreatePlotMutation, useFarmPlotsQuery } from "./plots.hooks";
import { useTranslation } from "react-i18next";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { getUsageCodeSelectData } from "./usage-codes";
import { useAddPlotStore } from "./add-plots.store";

type AddPlotFormValues = {
  name: string;
  additionalNotes?: string;
  localId?: string;
  usage?: string;
  cuttingDate?: Date;
  size: string;
  cropId: string;
};

export function AddPlotSummaryScreen({
  route,
  navigation,
}: AddPlotSummaryScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { cropId } = route.params;

  const { data } = useAddPlotStore();
  const { geometry, centroid, size, localId, cuttingDate, usage } = data!;

  const { plots } = useFarmPlotsQuery();
  const { crops } = useCropsQuery();

  const [longitude, latitude] = centroid.coordinates;
  const initialRegion: Region = {
    latitude,
    longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AddPlotFormValues>({
    defaultValues: {
      size: size.toString(),
      localId,
      usage: usage?.toString(),
      cuttingDate: cuttingDate ? new Date(cuttingDate) : undefined,
    },
  });

  useEffect(() => {
    if (cropId) {
      setValue("cropId", cropId);
    }
  }, [cropId]);

  const createPlotMutation = useCreatePlotMutation(
    () =>
      navigation.reset({
        index: 1,
        routes: [{ name: "Home" }, { name: "PlotsMap" }],
      }),
    (error) => console.log(error)
  );

  const affectedPlots = useMemo(
    () =>
      plots?.filter((plot) => {
        const bufferedPolygons = plot.geometry.coordinates.map((polygon) =>
          turf.buffer(turf.polygon(polygon), -2, { units: "meters" })
        );
        return bufferedPolygons.some(
          (feature) => feature && turf.booleanIntersects(geometry, feature)
        );
      }),
    [plots]
  );

  function onSubmit({ size, usage, cuttingDate, ...rest }: AddPlotFormValues) {
    createPlotMutation.mutate({
      ...rest,
      geometry,
      usage: Number(usage),
      size: Number(size),
      cuttingDate: cuttingDate?.toISOString(),
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
            disabled={createPlotMutation.isPending}
            loading={createPlotMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("plots.add.summary.heading")}
        keyboardAware
      >
        <H2>{t("plots.add.summary.heading")}</H2>
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
              polygon={geometry}
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
          <RHSelect
            name="cropId"
            control={control}
            label={t("forms.labels.crop")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.cropId?.message}
            data={
              crops?.map((crop) => ({
                label: crop.name,
                value: crop.id,
              })) ?? []
            }
          />
          <Button
            title={t("crops.new_crop")}
            onPress={() => navigation.navigate("CreateCrop")}
            type="accent"
            style={{ marginBottom: theme.spacing.m }}
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
