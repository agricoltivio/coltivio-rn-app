import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { SelectHarvestPlantScreenProps } from "@/navigation/rootStackTypes";
import { H2 } from "@/theme/Typography";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropsQuery } from "../../crops/crops.hooks";
import { useCreateHarvestStore } from "./harvest.store";

type FormValues = {
  cropId: string;
};
export function SelectHarvestCropScreen({
  navigation,
}: SelectHarvestPlantScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { crops, isFetched } = useCropsQuery();
  const { setHarvest, setSelectedCrop, harvest } = useCreateHarvestStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ defaultValues: { cropId: harvest?.cropId } });

  function onSubmit({ cropId }: FormValues) {
    setHarvest({ cropId });
    setSelectedCrop(crops?.find((crops) => crops.id === cropId)!);

    navigation.navigate("SelectHarvestingMachinery");
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
        headerTitleOnScroll={t("harvests.select_crop.heading")}
        keyboardAware
      >
        <H2>{t("harvests.select_crop.heading")}</H2>
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
