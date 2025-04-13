import { CropProtectionEquipmentCreateInput } from "@/api/cropProtectionEquipments.api";
import { Fertilizer } from "@/api/fertilizers.api";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHSelect } from "@/components/select/RHSelect";
import React from "react";
import { Control, FieldErrors } from "react-hook-form";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  getUnitLabel,
  methodSelectData,
} from "../crop-protection-applications/cropProtectionApplication.utils";
import { useTranslation } from "react-i18next";

export type CropProtectionEquipmentFormValues = Omit<
  CropProtectionEquipmentCreateInput,
  "capacity"
> & { capacity: string };

type CropProtectionEquipmentFormProps = {
  control: Control<CropProtectionEquipmentFormValues>;
  errors: FieldErrors<CropProtectionEquipmentFormValues>;
  restrictedMode?: boolean;
};

export function CropProtectionEquipmentForm({
  control,
  errors,
  restrictedMode,
}: CropProtectionEquipmentFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();

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
        name="method"
        control={control}
        label={t("forms.labels.method")}
        data={methodSelectData}
      />
      <RHSelect
        name="unit"
        control={control}
        label={t("forms.labels.unit")}
        disabled={restrictedMode}
        data={[
          { label: t("units.long.ml"), value: "ml" },
          { label: t("units.long.l"), value: "l" },
          { label: t("units.long.g"), value: "g" },
          { label: t("units.long.kg"), value: "kg" },
        ]}
      />
      <RHNumberInput
        name="capacity"
        control={control}
        label={t("forms.labels.amount_per_load")}
      />
    </View>
  );
}
