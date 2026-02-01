import { CropCreateInput } from "@/api/crops.api";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHSelect } from "@/components/select/RHSelect";
import React from "react";
import { Control, FieldErrors } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

export type CropFormValues = CropCreateInput;

type CropFormProps = {
  control: Control<CropFormValues>;
  errors: FieldErrors<CropFormValues>;
};

export function CropForm({ control, errors }: CropFormProps) {
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
          name="variety"
          control={control}
          label={t("forms.labels.kind_optional")}
          error={errors.variety?.message}
        />
        <RHSelect
          name="category"
          control={control}
          label={t("forms.labels.category")}
          rules={{
            required: { value: true, message: t("forms.validation.required") },
          }}
          error={errors.category?.message}
          data={[
            { label: t("crops.categories.grass"), value: "grass" },
            { label: t("crops.categories.grain"), value: "grain" },
            { label: t("crops.categories.vegetable"), value: "vegetable" },
            { label: t("crops.categories.fruit"), value: "fruit" },
            { label: t("crops.categories.other"), value: "other" },
          ]}
        />

        <RHTextAreaInput
          name="additionalNotes"
          control={control}
          label={t("forms.labels.additional_notes_optional")}
          error={errors.name?.message}
        />
      </View>
    </>
  );
}
