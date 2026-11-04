import { Card } from "@/components/card/Card";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHSelect } from "@/components/select/RHSelect";
import { Body, H3 } from "@/theme/Typography";
import React, { useEffect } from "react";
import {
  Control,
  FieldErrors,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropsQuery } from "../crops/crops.hooks";
import { useSowingUnitsQuery } from "../sowings/sowings.hooks";
import { unitsForQuantityKind } from "../sowings/sowingUnits";

export type SeedFormValues = {
  name: string;
  description?: string;
  cropId: string;
  quantityKind: string;
  defaultAmount?: string;
  defaultUnit?: string | null;
};

type SeedFormProps = {
  control: Control<SeedFormValues>;
  errors: FieldErrors<SeedFormValues>;
  setValue: UseFormSetValue<SeedFormValues>;
  // quantity kind can't change after creation, sowings of a seed must stay summable
  quantityKindLocked?: boolean;
};

export function SeedForm({
  control,
  errors,
  setValue,
  quantityKindLocked = false,
}: SeedFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { crops } = useCropsQuery();
  const { sowingUnits } = useSowingUnitsQuery();

  const quantityKind = useWatch({ control, name: "quantityKind" });
  const defaultUnit = useWatch({ control, name: "defaultUnit" });
  const matchingQuantityKind =
    quantityKind === "weight" || quantityKind === "count"
      ? quantityKind
      : undefined;
  const availableUnits = unitsForQuantityKind(
    sowingUnits ?? [],
    matchingQuantityKind,
  );

  // drop a default unit that doesn't fit a newly chosen quantity kind
  useEffect(() => {
    if (
      defaultUnit &&
      sowingUnits &&
      !availableUnits.some((unitInfo) => unitInfo.unit === defaultUnit)
    ) {
      setValue("defaultUnit", null);
    }
  }, [quantityKind, sowingUnits]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View
      style={{ gap: theme.spacing.xs, flex: 1, marginTop: theme.spacing.m }}
    >
      <RHTextInput
        name="name"
        control={control}
        label={t("forms.labels.name")}
        rules={{
          required: { value: true, message: t("forms.validation.required") },
        }}
        error={errors.name?.message}
      />
      <RHSelect
        name="cropId"
        control={control}
        label={t("forms.labels.crop")}
        data={
          crops?.map((crop) => ({ label: crop.name, value: crop.id })) ?? []
        }
        rules={{
          required: { value: true, message: t("forms.validation.required") },
        }}
        error={errors.cropId?.message}
      />
      <RHSelect
        name="quantityKind"
        control={control}
        label={t("seeds.quantity_kind")}
        disabled={quantityKindLocked}
        data={[
          { label: t("seeds.quantity_kinds.weight"), value: "weight" },
          { label: t("seeds.quantity_kinds.count"), value: "count" },
        ]}
        rules={{
          required: { value: true, message: t("forms.validation.required") },
        }}
        error={errors.quantityKind?.message}
      />
      <Body style={{ color: theme.colors.gray2 }}>
        {quantityKindLocked ? (
          t("seeds.quantity_kind_locked_hint")
        ) : (
          <>
            {t("seeds.quantity_kind_hint")}{" "}
            <Body style={{ fontWeight: 700, color: theme.colors.gray2 }}>
              {t("seeds.quantity_kind_permanent")}
            </Body>
          </>
        )}
      </Body>

      <Card style={{ marginTop: theme.spacing.m, gap: theme.spacing.xs }}>
        <H3>{t("seeds.default_values_optional")}</H3>
        <Body style={{ color: theme.colors.gray2 }}>
          {t("seeds.default_values_description")}
        </Body>
        <RHNumberInput
          name="defaultAmount"
          control={control}
          float
          label={t("seeds.default_amount")}
          error={errors.defaultAmount?.message}
        />
        <RHSelect
          name="defaultUnit"
          control={control}
          label={t("seeds.default_unit")}
          clearable
          data={availableUnits.map((unitInfo) => ({
            label: t(`sowings.units.${unitInfo.unit}`),
            value: unitInfo.unit,
          }))}
          error={errors.defaultUnit?.message}
        />
      </Card>

      <RHTextInput
        name="description"
        control={control}
        label={t("forms.labels.description_optional")}
        error={errors.description?.message}
      />
    </View>
  );
}
