import { TillageEquipmentCreateInput } from "@/api/tillageEquipment.api";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHSelect } from "@/components/select/RHSelect";
import React from "react";
import { Control, FieldErrors } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { tillageActions, tillageReasons } from "../tillages/tillageUtils";

export type TillageEquipmentFormValues = TillageEquipmentCreateInput;

type TillageEquipmentFormProps = {
  control: Control<TillageEquipmentFormValues>;
  errors: FieldErrors<TillageEquipmentFormValues>;
};

export function TillageEquipmentForm({
  control,
  errors,
}: TillageEquipmentFormProps) {
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
        name="reason"
        control={control}
        label={t("forms.labels.reason")}
        data={tillageReasons.map((reason) => ({
          label: t(`tillages.reasons.${reason}`),
          value: reason,
        }))}
        rules={{
          required: {
            value: true,
            message: t("forms.validation.required"),
          },
        }}
        error={errors.reason?.message}
      />
      <RHSelect
        name="action"
        control={control}
        label={t("forms.labels.action")}
        data={tillageActions.map((action) => ({
          label: t(`tillages.actions.${action}`),
          value: action,
        }))}
        rules={{
          required: {
            value: true,
            message: t("forms.validation.required"),
          },
        }}
        error={errors.reason?.message}
      />
    </View>
  );
}
