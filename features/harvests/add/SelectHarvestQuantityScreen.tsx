import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { ScrollView } from "@/components/views/ScrollView";
import { SelectHarvestQuantityScreenprops } from "../navigation/harvest-routes";
import { H2 } from "@/theme/Typography";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCreateHarvestStore } from "./harvest.store";

type FormValues = {
  totalProducedUnits: string;
};
export function SelectHarvestQuantityScreen({
  navigation,
}: SelectHarvestQuantityScreenprops) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { harvest, setTotalProducedUnits, totalProducedUnits } =
    useCreateHarvestStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: { totalProducedUnits: totalProducedUnits?.toString() },
  });

  function onSubmit({ totalProducedUnits }: FormValues) {
    setTotalProducedUnits(Number(totalProducedUnits));

    navigation.navigate("SelectHarvstPlots");
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button title={t("buttons.next")} onPress={handleSubmit(onSubmit)} />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("harvests.select_quantity.heading")}
        keyboardAware
      >
        <H2>{t("harvests.select_quantity.heading")}</H2>
        <View
          style={{ gap: theme.spacing.s, flex: 1, marginTop: theme.spacing.m }}
        >
          <RHNumberInput
            name="totalProducedUnits"
            keyboardType="numeric"
            control={control}
            label={t("forms.labels.amount_unit", {
              unit: t(`harvests.labels.unit.${harvest?.processingType!}`),
            })}
            float
            rules={{ required: true }}
            error={
              errors.totalProducedUnits &&
              "Produzierte Einheiten sind erforderlich"
            }
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
