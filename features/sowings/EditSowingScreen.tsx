import { Sowing } from "@/api/sowings.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { Body, H2 } from "@/theme/Typography";
import { toLocalDateString } from "@/utils/date";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropsQuery } from "../crops/crops.hooks";
import { useSeedsQuery } from "../seeds/seeds.hooks";
import { EditSowingScreenProps } from "./navigation/sowing-routes";
import {
  useSowingQuery,
  useSowingUnitsQuery,
  useUpdateSowingMutation,
} from "./sowings.hooks";
import {
  computeCounterpart,
  isPerAreaUnit,
  unitsForQuantityKind,
} from "./sowingUnits";

type FormValues = {
  date: Date;
  seedId?: string | null;
  cropId: string;
  unit: string;
  amount: string;
  additionalNotes?: string;
};

export function EditSowingScreen({ route, navigation }: EditSowingScreenProps) {
  const { sowing } = useSowingQuery(route.params.sowingId);
  const { isFetched: cropsLoaded } = useCropsQuery();
  const { isFetched: seedsLoaded } = useSeedsQuery();
  const { sowingUnits } = useSowingUnitsQuery();

  if (!sowing || !cropsLoaded || !seedsLoaded || !sowingUnits) {
    return null;
  }

  return <EditSowingForm sowing={sowing} onSaved={() => navigation.goBack()} />;
}

// Separate component so the form is initialized with the loaded sowing
function EditSowingForm({
  sowing,
  onSaved,
}: {
  sowing: Sowing;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { crops } = useCropsQuery();
  const { seeds } = useSeedsQuery();
  const { sowingUnits } = useSowingUnitsQuery();
  const units = sowingUnits ?? [];
  const updateSowingMutation = useUpdateSowingMutation(onSaved);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      date: new Date(sowing.date),
      seedId: sowing.seedId,
      cropId: sowing.cropId,
      unit: sowing.unit,
      amount: sowing.amount.toString(),
      additionalNotes: sowing.additionalNotes ?? undefined,
    },
  });

  const seedId = watch("seedId");
  const unitValue = watch("unit");
  const amountValue = watch("amount");
  const selectedSeed = seeds?.find((seed) => seed.id === seedId);
  const availableUnits = unitsForQuantityKind(
    units,
    selectedSeed?.quantityKind,
  );

  // the crop comes from the seed, a unit that doesn't fit the seed is dropped
  useEffect(() => {
    if (!selectedSeed) return;
    setValue("cropId", selectedSeed.cropId);
    if (!availableUnits.some((unitInfo) => unitInfo.unit === unitValue)) {
      setValue("unit", availableUnits[0]?.unit ?? "");
    }
  }, [selectedSeed]); // eslint-disable-line react-hooks/exhaustive-deps

  const unit = availableUnits.find(
    (unitInfo) => unitInfo.unit === unitValue,
  )?.unit;
  const amount = Number(amountValue) || 0;
  const perArea = unit ? isPerAreaUnit(units, unit) : false;
  const counterpart =
    unit && amount > 0
      ? computeCounterpart(units, amount, unit, sowing.size)
      : null;

  function onSubmit(values: FormValues) {
    if (!unit) return;
    updateSowingMutation.mutate({
      sowingId: sowing.id,
      input: {
        date: toLocalDateString(values.date),
        seedId: values.seedId ?? null,
        // with a seed the API takes the crop from the seed
        cropId: values.seedId ? undefined : values.cropId,
        unit,
        amount: Number(values.amount),
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
            disabled={!isDirty || updateSowingMutation.isPending}
            loading={updateSowingMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("sowings.edit_sowing")}
        keyboardAware
      >
        <H2>{t("sowings.edit_sowing")}</H2>

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
            name="seedId"
            control={control}
            label={t("sowings.seed_optional")}
            clearable
            data={
              seeds?.map((seed) => ({
                label: `${seed.name} · ${seed.crop.name}`,
                value: seed.id,
              })) ?? []
            }
          />

          <View style={{ gap: theme.spacing.xs }}>
            <RHSelect
              name="cropId"
              control={control}
              label={t("forms.labels.crop")}
              disabled={!!selectedSeed}
              rules={{
                required: {
                  value: true,
                  message: t("forms.validation.required"),
                },
              }}
              error={errors.cropId?.message}
              data={
                crops?.map((crop) => ({ label: crop.name, value: crop.id })) ??
                []
              }
            />
            {selectedSeed && (
              <Body style={{ color: theme.colors.gray2 }}>
                {t("sowings.crop_from_seed")}
              </Body>
            )}
          </View>

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
            data={availableUnits.map((unitInfo) => ({
              label: t(`sowings.units.${unitInfo.unit}`),
              value: unitInfo.unit,
            }))}
          />

          <View style={{ gap: theme.spacing.xs }}>
            <RHNumberInput
              name="amount"
              control={control}
              float
              label={
                unit
                  ? `${t("sowings.amount")} (${t(`sowings.units.${unit}`)})`
                  : t("sowings.amount")
              }
              rules={{
                required: {
                  value: true,
                  message: t("forms.validation.required"),
                },
              }}
              error={errors.amount?.message}
            />
            {counterpart && (
              <Body style={{ color: theme.colors.gray2 }}>
                {t(
                  perArea ? "sowings.computed_total" : "sowings.computed_rate",
                  {
                    amount: counterpart.amount.toLocaleString(),
                    unit: t(`sowings.units.${counterpart.unit}`),
                    area: counterpart.area,
                  },
                )}
              </Body>
            )}
          </View>

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
