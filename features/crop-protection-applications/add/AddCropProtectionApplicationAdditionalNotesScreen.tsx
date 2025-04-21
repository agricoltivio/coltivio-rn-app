import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { AddCropProtectionApplicationAdditionalNotesScreenProps } from "../navigation/crop-protection-application-routes";
import { useAddCropProtectionApplicationStore } from "./cropProtectionApplication.store";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";

type FormValues = {
  additionalNotes?: string;
};
export function AddCropProtectionApplicationAdditionalNotesScreen({
  navigation,
}: AddCropProtectionApplicationAdditionalNotesScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { setData, reset } = useAddCropProtectionApplicationStore();

  useEffect(() => {
    return () => reset();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  function onSubmit({ additionalNotes }: FormValues) {
    setData({ additionalNotes });

    navigation.navigate("AddCropProtectionApplicationSummary");
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
        headerTitleOnScroll={t("forms.labels.additional_notes")}
        keyboardAware
      >
        <H2>{t("forms.labels.additional_notes")}</H2>
        <View
          style={{ gap: theme.spacing.s, flex: 1, marginTop: theme.spacing.l }}
        >
          <RHTextAreaInput
            name="additionalNotes"
            control={control}
            label={t("forms.labels.additional_notes_optional")}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
