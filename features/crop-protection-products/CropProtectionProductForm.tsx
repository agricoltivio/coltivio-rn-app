import { CropProtectionProductCreateInput } from "@/api/cropProtectionProducts.api";
import { Card } from "@/components/card/Card";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHSelect } from "@/components/select/RHSelect";
import { H4 } from "@/theme/Typography";
import React from "react";
import { Control, FieldErrors } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

export type CropProtectionProductFormValues = CropProtectionProductCreateInput;

type CropProtectionProductFormProps = {
  control: Control<CropProtectionProductFormValues>;
  errors: FieldErrors<CropProtectionProductFormValues>;
  restrictedMode?: boolean;
};

export function CropProtectionProductForm({
  control,
  errors,
  restrictedMode = false,
}: CropProtectionProductFormProps) {
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
          name="description"
          control={control}
          label={t("forms.labels.description_optional")}
          error={errors.description?.message}
        />
        <Card
          elevated
          style={{
            backgroundColor: theme.colors.accent,
            margin: theme.spacing.s,
          }}
        >
          <H4>{t("crop_protection_product.unit_info")}</H4>
        </Card>
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
          rules={{
            required: {
              value: true,
              message: t("forms.validation.required"),
            },
          }}
          error={errors.unit?.message}
        />
      </View>
    </>
  );
}
