import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { SelectTillageDateScreenProps } from "../navigation/tillages-routes";
import { useAddTillageStore } from "./add-tillage.store";

type FormValues = {
  date: Date;
};

export function SelectTillageDateScreen({
  navigation,
}: SelectTillageDateScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { setData, data, reset } = useAddTillageStore();

  // Reset store on mount
  useEffect(() => {
    return () => reset();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: data?.date ?? new Date(),
    },
  });

  function onSubmit(values: FormValues) {
    setData({
      date: values.date,
    });

    navigation.navigate("ConfigureTillage");
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
        headerTitleOnScroll={t("tillages.add_tillage")}
        keyboardAware
      >
        <H2>{t("tillages.add_tillage")}</H2>

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
        </View>
      </ScrollView>
    </ContentView>
  );
}
