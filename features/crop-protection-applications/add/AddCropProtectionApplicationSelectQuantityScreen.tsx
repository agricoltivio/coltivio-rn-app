import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import React from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { AddCropProtectionApplicationSelectQuantityScreenProps } from "../navigation/crop-protection-application-routes";
import { useAddCropProtectionApplicationStore } from "./cropProtectionApplication.store";
import { useTranslation } from "react-i18next";

type FormValues = {
  totalNumberOfApplications: string;
};
export function AddCropProtectionApplicationSelectQuantityScreen({
  navigation,
}: AddCropProtectionApplicationSelectQuantityScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { totalNumberOfApplications, setTotalNumberOfApplications } =
    useAddCropProtectionApplicationStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      totalNumberOfApplications: totalNumberOfApplications?.toString(),
    },
  });

  function onSubmit({ totalNumberOfApplications }: FormValues) {
    setTotalNumberOfApplications(Number(totalNumberOfApplications));

    navigation.navigate("AddCropProtectionApplicationSelectPlots");
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
          "crop_protection_applications.select_quantity.heading"
        )}
        keyboardAware
      >
        <H2>{t("crop_protection_applications.select_quantity.heading")}</H2>
        <View
          style={{ gap: theme.spacing.s, flex: 1, marginTop: theme.spacing.m }}
        >
          <RHNumberInput
            name="totalNumberOfApplications"
            keyboardType="number-pad"
            control={control}
            label={t("forms.labels.amount_of_loads")}
            float
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.totalNumberOfApplications?.message}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
