import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { AddCropRotationScreenProps } from "./navigation/crop-rotations-routes";
import { H2 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropsQuery } from "../crops/crops.hooks";
import { useCreateCropRotationMutation } from "./crop-rotations.hooks";
import { useTranslation } from "react-i18next";

type FormValues = {
  cropId: string;
  fromDate: Date;
  toDate?: Date | null;
  sowingDate?: Date;
};

export function AddCropRotationScreen({
  navigation,
  route,
}: AddCropRotationScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plotId } = route.params;
  const { crops } = useCropsQuery();

  const createPlotCropRotationMutation = useCreateCropRotationMutation(() =>
    navigation.goBack()
  );

  const {
    handleSubmit,
    control,
    formState: { isDirty, errors },
  } = useForm<FormValues>();

  function onSubmit({ cropId, fromDate, toDate, sowingDate }: FormValues) {
    createPlotCropRotationMutation.mutate({
      plotId,
      cropId,
      fromDate: fromDate.toISOString(),
      toDate: toDate?.toDateString(),
      sowingDate: sowingDate?.toISOString(),
    });
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            onPress={handleSubmit(onSubmit)}
            title={t("buttons.save")}
            style={{ flexGrow: 1 }}
            disabled={!isDirty || createPlotCropRotationMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        keyboardAware
        showHeaderOnScroll
        headerTitleOnScroll={t("crop_rotations.new_crop")}
      >
        <H2>{t("crop_rotations.new_crop")}</H2>
        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.s }}>
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
          <RHDatePicker
            name="fromDate"
            control={control}
            rules={{ required: true }}
            label={t("crop_rotations.sowing")}
            mode="date"
          />
          <RHDatePicker
            name="toDate"
            control={control}
            label={t("forms.labels.end_optional")}
            mode="date"
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
