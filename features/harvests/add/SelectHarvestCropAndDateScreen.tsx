import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropsQuery } from "../../crops/crops.hooks";
import { SelectHarvestCropAndDateScreenProps } from "../navigation/harvest-routes";
import { useCreateHarvestStore } from "./harvest.store";

type FormValues = {
  date: Date;
  cropId: string;
};

export function SelectHarvestCropAndDateScreen({
  navigation,
  route,
}: SelectHarvestCropAndDateScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { crops, isFetched: cropsLoaded } = useCropsQuery();
  const { setHarvest, setSelectedCrop, harvest, reset } = useCreateHarvestStore();

  const preselectedCropId = route.params?.cropId;

  // Reset store on mount
  useEffect(() => {
    return () => reset();
  }, []);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: harvest?.date ?? new Date(),
      cropId: harvest?.cropId ?? preselectedCropId,
    },
  });

  useEffect(() => {
    if (preselectedCropId) {
      setValue("cropId", preselectedCropId);
    }
  }, [preselectedCropId, setValue]);

  function onSubmit(values: FormValues) {
    setHarvest({
      date: values.date,
      cropId: values.cropId,
    });

    const selectedCrop = crops?.find((c) => c.id === values.cropId);
    if (selectedCrop) {
      setSelectedCrop(selectedCrop);
    }

    navigation.navigate("ConfigureHarvest");
  }

  if (!cropsLoaded) {
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
        headerTitleOnScroll={t("harvests.add_harvest")}
        keyboardAware
      >
        <H2>{t("harvests.add_harvest")}</H2>

        <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.l }}>
          <RHDatePicker
            name="date"
            control={control}
            label={t("forms.labels.date")}
            mode="date"
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.date?.message}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.xs,
            }}
          >
            <View style={{ flex: 1 }}>
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
            <IonIconButton
              icon="add"
              iconSize={24}
              color="black"
              type="accent"
              onPress={() => navigation.navigate("CreateCrop")}
            />
          </View>
        </View>
      </ScrollView>
    </ContentView>
  );
}
