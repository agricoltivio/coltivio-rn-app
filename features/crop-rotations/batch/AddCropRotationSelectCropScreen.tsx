import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import React from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropsQuery } from "../../crops/crops.hooks";
import { useCreateCropRotationStore } from "./crop-rotations.store";
import { AddCropRotationSelectCropScreenProps } from "../navigation/crop-rotations-routes";
import { useTranslation } from "react-i18next";

type FormValues = {
  cropId: string;
};
export function AddCropRotationSelectCropScreen({
  navigation,
}: AddCropRotationSelectCropScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { crops, isFetched } = useCropsQuery();
  const { setCropRotation, setSelectedCrop, cropRotations } =
    useCreateCropRotationStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ defaultValues: { cropId: cropRotations?.cropId } });

  function onSubmit({ cropId }: FormValues) {
    setCropRotation({ cropId });
    setSelectedCrop(crops?.find((crops) => crops.id === cropId)!);

    navigation.navigate("AddCropRotationSelectPlots");
  }

  if (!isFetched) {
    return null;
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button title={t("buttons.next")} onPress={handleSubmit(onSubmit)} />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("crop_rotations.select_crop.heading")}
        keyboardAware
      >
        <H2>{t("crop_rotations.select_crop.heading")}</H2>
        <View
          style={{ gap: theme.spacing.s, flex: 1, marginTop: theme.spacing.l }}
        >
          <RHSelect
            name="cropId"
            control={control}
            label={t("forms.labels.crop")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.cropId?.message}
            data={
              crops?.map((crop) => ({
                label: crop.name,
                value: crop.id,
              })) ?? []
            }
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
