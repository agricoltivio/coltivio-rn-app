import { SplitPlotInput } from "@/api/plots.api";
import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { InsetsProps } from "@/constants/Screen";
import { indexToDistinctColor } from "@/theme/theme";
import { Body, H2, H3, Subtitle } from "@/theme/Typography";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled, { useTheme } from "styled-components/native";
import { SplitPlotSummaryScreenProps } from "./navigation/plots-routes";
import { useSplitPlotMutation } from "./plots.hooks";
import { useSplitPlotStore } from "./split-plot.store";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type Strategy = "keep_reference" | "delete_and_migrate";

type SplitFormValues = {
  originalPlotName: string;
  strategy: Strategy;
  subPlots: { name: string }[];
};

export function SplitPlotSummaryScreen({
  route,
  navigation,
}: SplitPlotSummaryScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { plotId } = route.params;
  const { subPlots, originalPlotName, reset: resetSplitStore } = useSplitPlotStore();

  const [migrateToIndex, setMigrateToIndex] = useState(0);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SplitFormValues>({
    defaultValues: {
      originalPlotName,
      strategy: "keep_reference",
      subPlots: subPlots.map((_, i) => ({
        name: `${originalPlotName} ${LETTERS[i] ?? i + 1}`,
      })),
    },
  });

  const strategy = watch("strategy");

  const { fields } = useFieldArray({ control, name: "subPlots" });

  const splitMutation = useSplitPlotMutation(
    (plots) => {
      resetSplitStore();
      navigation.popTo("PlotsMap", { selectedPlotId: plots[0]?.id });
    },
    (error) => console.error(error),
  );

  function onSubmit(values: SplitFormValues) {
    const subPlotsPayload = subPlots.map((sp, i) => ({
      geometry: sp.geometry,
      name: values.subPlots[i].name,
      size: sp.size,
    }));

    let data: SplitPlotInput;
    if (values.strategy === "delete_and_migrate") {
      data = {
        strategy: "delete_and_migrate",
        migrateToIndex,
        subPlots: subPlotsPayload,
      };
    } else {
      data = {
        strategy: "keep_reference",
        originalPlotName: values.originalPlotName,
        subPlots: subPlotsPayload,
      };
    }

    splitMutation.mutate({ plotId, data });
  }

  const strategySelectData = [
    {
      value: "keep_reference",
      label: t("plots.split.summary.strategy_keep_reference"),
    },
    {
      value: "delete_and_migrate",
      label: t("plots.split.summary.strategy_delete_and_migrate"),
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

        {/* Strategy selector + info */}
        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.m }}>
          <RHSelect
            name="strategy"
            data={strategySelectData}
            control={control}
            label={t("plots.split.summary.strategy_label")}
          />
          <Card>
            <Body>
              {strategy === "keep_reference"
                ? t("plots.split.summary.strategy_keep_reference_info")
                : t("plots.split.summary.strategy_delete_and_migrate_info")}
            </Body>
          </Card>

          {/* Original plot name — only for keep_reference */}
          {strategy === "keep_reference" && (
            <RHTextInput
              name="originalPlotName"
              control={control}
              label={t("plots.split.summary.original_plot_name")}
            />
          )}
        </View>

        {/* Sub-plot cards */}
        <View style={{ gap: theme.spacing.s, marginTop: theme.spacing.m }}>
          {fields.map((field, index) => {
            const letter = LETTERS[index] ?? `${index + 1}`;
            return (
              <Card
                key={field.id}
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: indexToDistinctColor(index),
                }}
              >
                <H3>{t("plots.split.summary.sub_plot_name", { letter })}</H3>
                <Subtitle style={{ marginBottom: theme.spacing.xs }}>
                  {subPlots[index].size / 100}a ({subPlots[index].size}m²)
                </Subtitle>
                <RHTextInput
                  name={`subPlots.${index}.name`}
                  control={control}
                  label={t("forms.labels.name")}
                  rules={{
                    required: {
                      value: true,
                      message: t("forms.validation.required"),
                    },
                  }}
                  error={errors.subPlots?.[index]?.name?.message}
                />
                {/* Migrate-to toggle — only for delete_and_migrate */}
                {strategy === "delete_and_migrate" && (
                  <TouchableOpacity
                    onPress={() => setMigrateToIndex(index)}
                    style={{
                      marginTop: theme.spacing.xs,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: theme.spacing.xs,
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: theme.colors.primary,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {migrateToIndex === index && (
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: theme.colors.primary,
                          }}
                        />
                      )}
                    </View>
                    <Body>{t("plots.split.summary.migrate_to_label")}</Body>
                  </TouchableOpacity>
                )}
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </ContentView>
  );
}
