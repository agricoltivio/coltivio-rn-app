import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import { ScrollView } from "@/components/views/ScrollView";
import { hexToRgba } from "@/theme/theme";
import { H2, Subtitle } from "@/theme/Typography";
import * as turf from "@turf/turf";
import { useForm, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { SplitPlotSummaryScreenProps } from "./navigation/plots-routes";
import { useSplitPlotMutation } from "./plots.hooks";
import { useSplitPlotStore } from "./split-plot.store";

type SplitFormValues = {
  originalPlotName: string;
  subPlots: { name: string }[];
};

export function SplitPlotSummaryScreen({
  route,
  navigation,
}: SplitPlotSummaryScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plotId } = route.params;
  const { subPlots, originalPlotName } = useSplitPlotStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SplitFormValues>({
    defaultValues: {
      originalPlotName,
      subPlots: subPlots.map((_, i) => ({
        name: t("plots.split.summary.sub_plot_name", { index: i + 1 }),
      })),
    },
  });

  const { fields } = useFieldArray({ control, name: "subPlots" });

  const splitMutation = useSplitPlotMutation(
    () =>
      navigation.reset({
        index: 1,
        routes: [{ name: "Home" }, { name: "PlotsMap" }],
      }),
    (error) => console.error(error)
  );

  // Compute a region that covers all sub-plots
  const allCoords = subPlots.flatMap((sp) =>
    sp.geometry.coordinates.flatMap((poly) =>
      poly.flatMap((ring) => ring.map(([lng, lat]) => [lng, lat]))
    )
  );
  let initialRegion: Region | undefined;
  if (allCoords.length > 0) {
    const collection = turf.featureCollection(
      subPlots.map((sp) => turf.multiPolygon(sp.geometry.coordinates))
    );
    const center = turf.center(collection);
    const [lng, lat] = center.geometry.coordinates;
    initialRegion = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.003,
      longitudeDelta: 0.003,
    };
  }

  const subPlotColors = [
    theme.colors.success,
    theme.colors.accent,
    theme.colors.secondary,
    theme.colors.danger,
  ];

  function onSubmit(values: SplitFormValues) {
    splitMutation.mutate({
      plotId,
      data: {
        strategy: "keep_reference",
        originalPlotName: values.originalPlotName,
        subPlots: subPlots.map((sp, i) => ({
          geometry: sp.geometry,
          name: values.subPlots[i].name,
          size: sp.size,
        })),
      },
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
            disabled={splitMutation.isPending}
            loading={splitMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("plots.split.summary.heading")}
        keyboardAware
      >
        <H2>{t("plots.split.summary.heading")}</H2>
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
              initialRegion={initialRegion}
              mapType="satellite"
              style={{ height: "100%" }}
            >
              {subPlots.map((sp, i) => (
                <MultiPolygon
                  key={`sub-${i}`}
                  polygon={sp.geometry}
                  strokeWidth={2}
                  strokeColor="white"
                  fillColor={hexToRgba(
                    subPlotColors[i % subPlotColors.length],
                    0.6
                  )}
                />
              ))}
            </MapView>
          </View>
        )}
        <View
          style={{ gap: theme.spacing.xs, flex: 1, marginTop: theme.spacing.m }}
        >
          <RHTextInput
            name="originalPlotName"
            control={control}
            label={t("forms.labels.name")}
          />
          {fields.map((field, index) => (
            <View key={field.id}>
              <RHTextInput
                name={`subPlots.${index}.name`}
                control={control}
                label={t("plots.split.summary.sub_plot_name", {
                  index: index + 1,
                })}
                rules={{
                  required: {
                    value: true,
                    message: t("forms.validation.required"),
                  },
                }}
                error={errors.subPlots?.[index]?.name?.message}
              />
              <Subtitle style={{ marginTop: theme.spacing.xxs }}>
                {subPlots[index].size / 100}a ({subPlots[index].size}m²)
              </Subtitle>
            </View>
          ))}
        </View>
      </ScrollView>
    </ContentView>
  );
}
