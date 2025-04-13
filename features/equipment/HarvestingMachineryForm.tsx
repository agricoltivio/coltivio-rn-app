import { HarvestingMachineryCreateInput } from "@/api/harvestingMachinery.api";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHSwitch } from "@/components/inputs/RHSwitch";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHSelect } from "@/components/select/RHSelect";
import React from "react";
import { Control, FieldErrors } from "react-hook-form";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  conservationsMethods,
  processingTypes,
} from "../harvests/harvestUtils";
import { useTranslation } from "react-i18next";

export type HarvestingMachineryFormValues = Omit<
  HarvestingMachineryCreateInput,
  "defaultKilosPerUnit"
> & {
  defaultKilosPerUnit: string;
};

type HarvestingMachineryFormProps = {
  control: Control<HarvestingMachineryFormValues, any>;
  errors: FieldErrors<HarvestingMachineryFormValues>;
};

export function HarvestingMachineryForm({
  control,
  errors,
}: HarvestingMachineryFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <>
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
          name="defaultConservationMethod"
          control={control}
          label={t("forms.labels.conservation")}
          rules={{
            required: { value: true, message: t("forms.validation.required") },
          }}
          error={errors.defaultProcessingType?.message}
          data={conservationsMethods.map((method) => ({
            label: t(`harvests.labels.conservation_method.${method}`),
            value: method,
          }))}
        />
        <RHSelect
          name="defaultProcessingType"
          control={control}
          label={t("forms.labels.processing_type")}
          rules={{
            required: { value: true, message: t("forms.validation.required") },
          }}
          error={errors.defaultProcessingType?.message}
          data={processingTypes.map((type) => ({
            label: t(`harvests.labels.processing_type.${type}`),
            value: type,
          }))}
        />
        <RHNumberInput
          name="defaultKilosPerUnit"
          control={control}
          label={t("forms.labels.weight_kg_per_harvest_unit")}
          rules={{
            required: { value: true, message: t("forms.validation.required") },
          }}
          placeholder={t("forms.placeholders.weight_kg_per_harvest_unit")}
          error={errors.defaultKilosPerUnit?.message}
        />
      </View>
      <RHSwitch
        name="default"
        label={t("forms.labels.default_machine")}
        control={control}
        style={{ marginTop: theme.spacing.xl }}
      />
    </>
  );
}
