import { toLocalDateString } from "@/utils/date";
import { ConservationMethod, Harvest, HarvestUnit } from "@/api/harvests.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropsQuery } from "../crops/crops.hooks";
import { useHarvestQuery, useUpdateHarvestMutation } from "./harvests.hooks";
import { conservationsMethods } from "./harvestUtils";
import { EditHarvestScreenProps } from "./navigation/harvest-routes";

type FormValues = {
  date: Date;
  cropId: string;
  unit: HarvestUnit;
  conservationMethod?: ConservationMethod | null;
  kilosPerUnit: string;
  numberOfUnits: string;
  additionalNotes?: string;
};

export function EditHarvestScreen({
  route,
  navigation,
}: EditHarvestScreenProps) {
  const harvestId = route.params.harvestId;
  const { harvest } = useHarvestQuery(harvestId);
  const { crops, isFetched: cropsLoaded } = useCropsQuery();

  if (!harvest || !cropsLoaded) {
    return null;
  }

  return (
    <EditHarvestForm
      harvest={harvest}
      cropOptions={
        crops?.map((crop) => ({ label: crop.name, value: crop.id })) ?? []
      }
      onSaved={() => navigation.goBack()}
    />
  );
}

// Separate component so the form is initialized with loaded harvest values
function EditHarvestForm({
  harvest,
  cropOptions,
  onSaved,
}: {
  harvest: Harvest;
  cropOptions: { label: string; value: string }[];
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const updateHarvestMutation = useUpdateHarvestMutation(onSaved);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: new Date(harvest.date),
      cropId: harvest.crop.id,
      unit: harvest.unit,
      conservationMethod: harvest.conservationMethod,
      kilosPerUnit: harvest.kilosPerUnit.toString(),
      numberOfUnits: harvest.numberOfUnits.toString(),
      additionalNotes: harvest.additionalNotes ?? undefined,
    },
  });

  const unit = watch("unit");

  const unitOptions: { label: string; value: HarvestUnit }[] = [
    { label: t("harvests.labels.unit.load"), value: "load" },
    { label: t("harvests.labels.unit.round_bale"), value: "round_bale" },
    { label: t("harvests.labels.unit.square_bale"), value: "square_bale" },
    { label: t("common.crate"), value: "crate" },
    { label: t("common.total_amount"), value: "total_amount" },
  ];

  const conservationOptions: { label: string; value: string }[] =
    conservationsMethods.map((method) => ({
      label: t(`harvests.labels.conservation_method.${method}`) as string,
      value: method,
    }));

  const unitLabel =
    unitOptions.find((o) => o.value === unit)?.label ??
    t("harvests.labels.unit.other");

  function onSubmit(values: FormValues) {
    updateHarvestMutation.mutate({
      harvestId: harvest.id,
      input: {
        date: toLocalDateString(values.date),
        cropId: values.cropId,
        unit: values.unit,
        conservationMethod: values.conservationMethod ?? null,
        kilosPerUnit: Number(values.kilosPerUnit),
        // total_amount stores the whole amount in kilosPerUnit with a single unit
        numberOfUnits:
          values.unit === "total_amount" ? 1 : Number(values.numberOfUnits),
        additionalNotes: values.additionalNotes ?? null,
      },
    });
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmit)}
            disabled={updateHarvestMutation.isPending}
            loading={updateHarvestMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("harvests.edit_harvest")}
        keyboardAware
      >
        <H2>{t("harvests.edit_harvest")}</H2>

        <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.l }}>
          <RHDatePicker
            name="date"
            control={control}
            label={t("forms.labels.date")}
            mode="date"
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.date?.message}
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
            data={cropOptions}
          />

          <RHSelect
            name="unit"
            control={control}
            label={t("forms.labels.unit")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.unit?.message}
            data={unitOptions}
          />

          <RHSelect
            name="conservationMethod"
            control={control}
            label={t("forms.labels.conservation_optional")}
            error={errors.conservationMethod?.message}
            data={conservationOptions}
          />

          <RHNumberInput
            name="kilosPerUnit"
            control={control}
            float
            label={
              unit === "total_amount"
                ? `${t("common.total_amount")} (${t("units.short.kg")})`
                : `${t("units.short.kg")} / ${unitLabel}`
            }
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.kilosPerUnit?.message}
          />

          {unit !== "total_amount" && (
            <RHNumberInput
              name="numberOfUnits"
              control={control}
              float
              label={t("forms.labels.amount_unit", { unit: unitLabel })}
              rules={{
                required: {
                  value: true,
                  message: t("forms.validation.required"),
                },
              }}
              error={errors.numberOfUnits?.message}
            />
          )}

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
