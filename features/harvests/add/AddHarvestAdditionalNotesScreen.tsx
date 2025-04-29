import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { useCreateHarvestStore } from "./harvest.store";
import { AddHarvestAdditionalNotesScreenProps } from "../navigation/harvest-routes";

type FormValues = {
  additionalNotes?: string;
};
export function AddHarvestAdditionalNotesScreen({
  navigation,
}: AddHarvestAdditionalNotesScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { setHarvest } = useCreateHarvestStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  function onSubmit({ additionalNotes }: FormValues) {
    setHarvest({ additionalNotes });

    navigation.navigate("HarvestSummary");
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
