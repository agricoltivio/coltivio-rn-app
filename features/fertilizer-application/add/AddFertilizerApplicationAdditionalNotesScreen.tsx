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
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { AddFertilizerApplicationAdditionalNotesScreenProps } from "../navigation/fertilizer-application-routes";
import { useCreateFertilizerApplicationStore } from "./fertilizerApplication.store";

type FormValues = {
  additionalNotes?: string;
};
export function AddFertilizerApplicationAdditionalNotesScreen({
  navigation,
}: AddFertilizerApplicationAdditionalNotesScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { setFertilizerApplication } = useCreateFertilizerApplicationStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  function onSubmit({ additionalNotes }: FormValues) {
    setFertilizerApplication({ additionalNotes });

    navigation.navigate("AddFertilizerApplicationSummary");
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
