import { FertilizerCreateInput } from "@/api/fertilizers.api";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHSelect } from "@/components/select/RHSelect";
import React from "react";
import { Control, FieldErrors } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { FertilizerSpreader } from "@/api/fertilizerSpreaders.api";
import { useFertilizerSpreadersQuery } from "../equipment/fertilizerSpreader.hooks";

export type FertilizerFormValues = FertilizerCreateInput;

type FertilizerFormProps = {
  control: Control<FertilizerFormValues>;
  errors: FieldErrors<FertilizerFormValues>;
  restrictedMode?: boolean;
  spreaders: FertilizerSpreader[];
};

export function FertilizerForm({
  control,
  errors,
  restrictedMode = false,
  spreaders,
}: FertilizerFormProps) {
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
        <RHSelect
          name="unit"
          control={control}
          label={t("forms.labels.unit")}
          disabled={restrictedMode}
          data={[
            { label: t("units.long.l"), value: "l" },
            { label: t("units.long.kg"), value: "kg" },
            { label: t("units.long.dt"), value: "dt" },
            { label: t("units.long.t"), value: "t" },
            { label: t("units.long.m3"), value: "m3" },
          ]}
          rules={{
            required: {
              value: true,
              message: t("forms.validation.required"),
            },
          }}
          error={errors.unit?.message}
        />
        <RHSelect
          name="type"
          control={control}
          label="Typ"
          data={[
            { label: t("forms.labels.organic"), value: "organic" },
            { label: t("forms.labels.mineralic"), value: "mineralic" },
          ]}
          rules={{
            required: {
              value: true,
              message: t("forms.validation.required"),
            },
          }}
          error={errors.type?.message}
        />
        <RHSelect
          name="defaultSpreaderId"
          control={control}
          label={t("forms.labels.default_machine")}
          data={[
            { label: t("forms.labels.none"), value: "none" },
            ...spreaders!.map((config) => ({
              label: config.name,
              value: config.id,
            })),
          ]}
        />
      </View>
    </>
  );
}
