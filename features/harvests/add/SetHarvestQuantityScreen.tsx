import { HarvestUnit } from "@/api/harvests.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { SetHarvestQuantityScreenProps } from "../navigation/harvest-routes";
import { useCreateHarvestStore } from "./harvest.store";

type FormValues = {
  totalProducedUnits: string;
};

export function SetHarvestQuantityScreen({
  navigation,
}: SetHarvestQuantityScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { setTotalProducedUnits, harvest, totalProducedUnits } =
    useCreateHarvestStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      totalProducedUnits: totalProducedUnits?.toString(),
    },
  });

  const unitOptions: { label: string; value: HarvestUnit }[] = [
    { label: t("harvests.labels.unit.load"), value: "load" },
    { label: t("harvests.labels.unit.round_bale"), value: "round_bale" },
    { label: t("harvests.labels.unit.square_bale"), value: "square_bale" },
    { label: t("common.crate"), value: "crate" },
    { label: t("common.total_amount"), value: "total_amount" },
    { label: t("harvests.labels.unit.other"), value: "other" },
  ];

  const unitLabel =
    unitOptions.find((o) => o.value === harvest?.unit)?.label ??
    t("harvests.labels.unit.other");

  function onSubmit(values: FormValues) {
    setTotalProducedUnits(Number(values.totalProducedUnits));
    navigation.navigate("SelectHarvestPlots");
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

        <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.l }}>
          <RHNumberInput
            name="totalProducedUnits"
            control={control}
            label={t("forms.labels.amount_unit", { unit: unitLabel })}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.totalProducedUnits?.message}
            float
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
