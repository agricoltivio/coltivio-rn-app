import { FertilizerSpreaderCreateInput } from "@/api/fertilizerSpreaders.api";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHSelect } from "@/components/select/RHSelect";
import React from "react";
import { Control, FieldErrors } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { fertilizerApplicationMethods } from "../fertilizer-application/fertilizerApplications.utils";

export type FertilizerSpreaderFormValues = Omit<
  FertilizerSpreaderCreateInput,
  "capacity"
> & {
  capacity: string;
};

type FertilizerSpreaderFormProps = {
  control: Control<FertilizerSpreaderFormValues>;
  errors: FieldErrors<FertilizerSpreaderFormValues>;
};

export function FertilizerSpreaderForm({
  control,
  errors,
}: FertilizerSpreaderFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const methodSelectOptions = fertilizerApplicationMethods.map((method) => ({
    label: t(`fertilizer_application.methods.${method}`),
    value: method,
  }));

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
        name="defaultMethod"
        control={control}
        label={t("forms.labels.method")}
        rules={{
          required: { value: true, message: t("forms.validation.required") },
        }}
        error={errors.defaultMethod?.message}
        data={methodSelectOptions}
      />
      <RHSelect
        name="unit"
        control={control}
        label={t("forms.labels.unit")}
        data={[
          { label: t("units.long.l"), value: "l" },
          { label: t("units.long.kg"), value: "kg" },
          { label: t("units.long.dt"), value: "dt" },
          { label: t("units.long.t"), value: "t" },
          { label: t("units.long.m3"), value: "m3" },
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
