import { MergePlotsInput } from "@/api/plots.api";
import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { InsetsProps } from "@/constants/Screen";
import { Body, H2 } from "@/theme/Typography";
import { round } from "@/utils/math";
import * as turf from "@turf/turf";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled, { useTheme } from "styled-components/native";
import { MergePlotSummaryScreenProps } from "./navigation/plots-routes";
import { useFarmPlotsQuery, useMergePlotsMutation } from "./plots.hooks";
import { getUsageCodeSelectData } from "./usage-codes";

type Strategy = "keep_reference" | "delete_and_migrate";

type MergeFormValues = {
  name: string;
  localId?: string;
  usage?: string;
  cuttingDate?: Date;
  size: string;
  additionalNotes?: string;
  strategy: Strategy;
};

export function MergePlotSummaryScreen({
  route,
  navigation,
}: MergePlotSummaryScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { plotIds, primaryPlotId } = route.params;
  const { plots } = useFarmPlotsQuery();

  const selectedPlots = useMemo(
    () => plots?.filter((p) => plotIds.includes(p.id)) ?? [],
    [plots, plotIds],
  );

  const primaryPlot = selectedPlots.find((p) => p.id === primaryPlotId);

  // Compute merged geometry by unioning all selected plots
  const mergedGeometry = useMemo(() => {
    if (selectedPlots.length === 0) return null;
    const features = selectedPlots.map((p) =>
      turf.multiPolygon(p.geometry.coordinates),
    );
    let merged = features[0];
    for (let i = 1; i < features.length; i++) {
      const result = turf.union(turf.featureCollection([merged, features[i]]));
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
  const mergedName = selectedPlots.map((p) => p.localId ?? p.name).join(" + ");
  const mergedLocalIds = selectedPlots
    .map((p) => p.localId)
    .filter(Boolean)
    .join(" + ");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MergeFormValues>({
    defaultValues: {
      name: mergedName,
      localId: mergedLocalIds,
      size: mergedSize.toString(),
      strategy: "keep_reference",
      usage: primaryPlot?.usage?.toString(),
      cuttingDate: primaryPlot?.cuttingDate
        ? new Date(primaryPlot.cuttingDate)
        : undefined,
    },
  });

  const strategy = watch("strategy");

  const mergeMutation = useMergePlotsMutation(
    (plot) =>
      navigation.reset({
        index: 1,
        routes: [
          { name: "Home" },
          { name: "PlotsMap", params: { selectedPlotId: plot.id } },
        ],
      }),
    (error) => console.error(error),
  );

  function onSubmit({
    size,
    usage,
    cuttingDate,
    strategy,
    ...rest
  }: MergeFormValues) {
    const base = {
      plotIds,
      ...rest,
      usage: usage ? Number(usage) : undefined,
      cuttingDate: cuttingDate?.toISOString(),
      geometry: mergedGeometry,
    };

    const data: MergePlotsInput =
      strategy === "delete_and_migrate"
        ? { ...base, strategy: "delete_and_migrate" }
        : { ...base, strategy: "keep_reference" };

    mergeMutation.mutate(data);
  }

  const strategySelectData = [
    {
      value: "keep_reference",
      label: t("plots.merge.summary.strategy_keep_reference"),
    },
    {
      value: "delete_and_migrate",
      label: t("plots.merge.summary.strategy_delete_and_migrate"),
    },
  ];

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

        {/* Strategy selector + info */}
        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.m }}>
          <RHSelect
            name="strategy"
            data={strategySelectData}
            control={control}
            label={t("plots.merge.summary.strategy_label")}
          />
          <Card>
            <Body>
              {strategy === "keep_reference"
                ? t("plots.merge.summary.strategy_keep_reference_info")
                : t("plots.merge.summary.strategy_delete_and_migrate_info")}
            </Body>
            {strategy === "delete_and_migrate" && (
              <Body style={{ fontWeight: "bold", marginTop: theme.spacing.xs }}>
                {t("plots.merge.summary.strategy_delete_crop_rotation_warning")}
              </Body>
            )}
          </Card>
        </View>

        {/* Form fields */}
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
            disabled
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
