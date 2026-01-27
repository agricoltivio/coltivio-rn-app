import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { H2 } from "@/theme/Typography";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "styled-components/native";
import { useCreateCropRotationStore } from "./crop-rotations.store";
import { ScrollView } from "@/components/views/ScrollView";
import { View } from "react-native";
import { AddCropRotationSelectStartDateScreenProps } from "../navigation/crop-rotations-routes";
import { useTranslation } from "react-i18next";

type FormValues = {
  date: Date;
};

export function AddCropRotationSelectStartDateScreen({
  navigation,
}: AddCropRotationSelectStartDateScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { reset, setCropRotation } = useCreateCropRotationStore();

  useEffect(() => {
    return () => reset();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: new Date(),
    },
  });

  function onSubmit({ date }: FormValues) {
    setCropRotation({ fromDate: date.toISOString().split("T")[0] });

    navigation.navigate("AddCropRotationSelectCrop");
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
        headerTitleOnScroll={t(
          "crop_protection_applications.select_date.heading",
        )}
        keyboardAware
      >
        <H2>{t("crop_protection_applications.select_date.heading")}</H2>
        <View
          style={{ gap: theme.spacing.s, flex: 1, marginTop: theme.spacing.l }}
        >
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
        </View>
      </ScrollView>
    </ContentView>
  );
}
