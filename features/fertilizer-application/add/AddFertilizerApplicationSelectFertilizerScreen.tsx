import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { useFertilizersQuery } from "@/features/fertilizers/fertilizers.hooks";
import { AddFertilizerApplicationSelectFertilizerScreenProps } from "@/navigation/rootStackTypes";
import { Body, H2 } from "@/theme/Typography";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCreateFertilizerApplicationStore } from "./fertilizerApplication.store";

type FormValues = {
  fertilizerId: string;
};
export function AddFertilizerApplicationSelectFertilizerScreen({
  navigation,
  route,
}: AddFertilizerApplicationSelectFertilizerScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { fertilizers } = useFertilizersQuery();

  const {
    setFertilizerApplication,
    setSelectedFertilizer,
    selectedFertilizer,
  } = useCreateFertilizerApplicationStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    defaultValues: { fertilizerId: selectedFertilizer?.id },
  });

  const createdFertilizerId = route.params.fertilizerId;

  useEffect(() => {
    if (createdFertilizerId) {
      setValue("fertilizerId", createdFertilizerId);
    }
  }, [createdFertilizerId]);

  function onSubmit({ fertilizerId }: FormValues) {
    const selectedFertilizer = fertilizers?.find(
      (fertilizer) => fertilizer.id === fertilizerId
    )!;
    setFertilizerApplication({ fertilizerId, unit: selectedFertilizer.unit });
    setSelectedFertilizer(selectedFertilizer);

    navigation.navigate("AddFertilizerApplicationSelectSpreader", {});
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.next")}
            onPress={handleSubmit(onSubmit)}
            disabled={fertilizers?.length === 0}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t(
          "fertilizer_application.select_fertilizer.header_title"
        )}
        keyboardAware
      >
        <H2>{t("fertilizer_application.select_fertilizer.heading")}</H2>
        <View
          style={{ gap: theme.spacing.s, flex: 1, marginTop: theme.spacing.l }}
        >
          {fertilizers?.length === 0 ? (
            <Card
              elevated={false}
              style={{
                alignItems: "center",
                marginBottom: theme.spacing.m,
              }}
            >
              <Body>
                {t("fertilizer_application.select_fertilizer.no_fertilizers")}
              </Body>
              <Button
                style={{ marginTop: theme.spacing.m }}
                type="accent"
                fontSize={16}
                title={t("buttons.add")}
                onPress={() => navigation.navigate("CreateFertilizer")}
              />
            </Card>
          ) : (
            <RHSelect
              name="fertilizerId"
              control={control}
              label={t("forms.labels.fertiliser")}
              rules={{
                required: {
                  value: true,
                  message: t("forms.validation.required"),
                },
              }}
              error={errors.fertilizerId?.message}
              data={
                fertilizers?.map((fertilizer) => ({
                  label: fertilizer.name,
                  value: fertilizer.id,
                })) ?? []
              }
            />
          )}

          {fertilizers?.length ? (
            <Button
              title={t("fertilizers.new_fertilizer")}
              type="accent"
              style={{ marginTop: theme.spacing.m }}
              onPress={() => navigation.navigate("CreateFertilizer")}
            />
          ) : null}
        </View>
      </ScrollView>
    </ContentView>
  );
}
