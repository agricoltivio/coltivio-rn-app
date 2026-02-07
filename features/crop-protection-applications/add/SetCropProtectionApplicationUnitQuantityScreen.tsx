import { CropProtectionApplicationPresetCreateInput } from "@/api/cropProtectionApplicationPresets.api";
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
import { SetCropProtectionApplicationUnitQuantityScreenProps } from "../navigation/crop-protection-application-routes";
import { useAddCropProtectionApplicationStore } from "./cropProtectionApplication.store";

type CropProtectionAppUnit = CropProtectionApplicationPresetCreateInput["unit"];

type FormValues = {
  numberOfApplications: string;
};

export function SetCropProtectionApplicationUnitQuantityScreen({
  navigation,
}: SetCropProtectionApplicationUnitQuantityScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { setTotalNumberOfUnits, data, totalNumberOfUnits } =
    useAddCropProtectionApplicationStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      numberOfApplications: totalNumberOfUnits?.toString(),
    },
  });

  const unitOptions: { label: string; value: CropProtectionAppUnit }[] = [
    { label: t("units.long.load"), value: "load" },
    { label: t("fertilizer_application.units.bag"), value: "bag" },
    { label: t("common.total_amount"), value: "total_amount" },
    {
      label: t("fertilizer_application.units.amount_per_hectare"),
      value: "amount_per_hectare",
    },
    { label: t("harvests.labels.unit.other"), value: "other" },
  ];

  const unitLabel =
    unitOptions.find((o) => o.value === data?.unit)?.label ??
    t("harvests.labels.unit.other");

  function onSubmit(values: FormValues) {
    setTotalNumberOfUnits(Number(values.numberOfApplications));
    navigation.navigate("SelectCropProtectionApplicationPlots");
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
        headerTitleOnScroll={t(
          "crop_protection_applications.select_quantity.heading",
        )}
        keyboardAware
      >
        <H2>{t("crop_protection_applications.select_quantity.heading")}</H2>

        <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.l }}>
          <RHNumberInput
            name="numberOfApplications"
            control={control}
            label={t("forms.labels.amount_unit", { unit: unitLabel })}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.numberOfApplications?.message}
            float
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
