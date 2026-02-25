import { CropCreateInput } from "@/api/crops.api";
import { IonIconButton } from "@/components/buttons/IconButton";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHSelect } from "@/components/select/RHSelect";
import { useCropFamiliesQuery } from "@/features/crop-families/cropFamilies.hooks";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Control, FieldErrors } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

export type CropFormValues = Omit<CropCreateInput, "waitingTimeInYears"> & {
  waitingTimeInYears?: string;
};

type CropFormProps = {
  control: Control<CropFormValues>;
  errors: FieldErrors<CropFormValues>;
};

export function CropForm({ control, errors }: CropFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const { cropFamilies } = useCropFamiliesQuery();

  const familyOptions = (cropFamilies ?? []).map((family) => ({
    label: family.name,
    value: family.id,
  }));

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
        {/* Family select with add button */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.xs,
          }}
        >
          <View style={{ flex: 1 }}>
            <RHSelect
              name="familyId"
              control={control}
              label={t("crops.family_optional")}
              error={errors.familyId?.message}
              enableSearch
              data={familyOptions}
            />
          </View>
          <IonIconButton
            icon="add"
            type="accent"
            color="black"
            iconSize={24}
            onPress={() => navigation.navigate("CreateCropFamily")}
            style={{ marginBottom: 1 }}
          />
        </View>
        <RHNumberInput
          name="waitingTimeInYears"
          control={control}
          label={t("crops.waiting_time_in_years_optional")}
          keyboardType="numbers-and-punctuation"
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
