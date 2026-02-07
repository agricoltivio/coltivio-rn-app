import { CropFamilyCreateInput } from "@/api/crop-families.api";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import React from "react";
import { Control, FieldErrors } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

export type CropFamilyFormValues = CropFamilyCreateInput;

type CropFamilyFormProps = {
  control: Control<CropFamilyFormValues>;
  errors: FieldErrors<CropFamilyFormValues>;
};

export function CropFamilyForm({ control, errors }: CropFamilyFormProps) {
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
        <RHTextInput
          name="waitingTimeInYears"
          control={control}
          label={t("crop_families.waiting_time_in_years")}
          keyboardType="numeric"
          rules={{
            required: { value: true, message: t("forms.validation.required") },
            min: { value: 0, message: t("forms.validation.min", { min: 0 }) },
          }}
          error={errors.waitingTimeInYears?.message}
        />
        <RHTextAreaInput
          name="additionalNotes"
          control={control}
          label={t("forms.labels.additional_notes_optional")}
          error={errors.additionalNotes?.message}
        />
      </View>
    </>
  );
}
