import {
  FertilizerApplication,
  FertilizerApplicationMethod,
} from "@/api/fertilizerApplications.api";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { useFertilizerSpreadersQuery } from "@/features/equipment/fertilizerSpreader.hooks";
import { AddFertilizerApplicationSelectSpreaderScreenProps } from "@/navigation/rootStackTypes";
import { Body, H2, H3 } from "@/theme/Typography";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCreateFertilizerApplicationStore } from "./fertilizerApplication.store";
import { fertilizerApplicationMethods } from "../fertilizerApplications.utils";

type FormValues = {
  spreaderId: string;
  method: FertilizerApplicationMethod;
  capacity: string;
  unit: FertilizerApplication["unit"];
};
export function AddFertilizerApplicationSelectSpreaderScreen({
  navigation,
}: AddFertilizerApplicationSelectSpreaderScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { fertilizerSpreaders, isFetched } = useFertilizerSpreadersQuery();

  const {
    setSelectedSpreader,
    selectedFertilizer,
    setFertilizerApplication,
    selectedSpreader,
    fertilizerApplication,
  } = useCreateFertilizerApplicationStore();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      unit: selectedFertilizer?.unit,
      spreaderId: selectedSpreader?.id || "none",
      capacity:
        selectedSpreader?.capacity.toString() ||
        fertilizerApplication?.amountPerApplication?.toString(),
    },
  });

  const spreaderId = watch("spreaderId");

  const currentSelectedSpreader = fertilizerSpreaders?.find(
    (config) => config.id === spreaderId
  );

  const availableSpreaders = fertilizerSpreaders?.filter(
    (config) => config.unit === selectedFertilizer?.unit
  );

  const methodSelectOptions = fertilizerApplicationMethods.map((method) => ({
    label: t(`fertilizer_application.methods.${method}`),
    value: method,
  }));

  useEffect(() => {
    if (currentSelectedSpreader) {
      setValue("capacity", currentSelectedSpreader.capacity.toString());
      setValue("method", currentSelectedSpreader.defaultMethod);
    }
  }, [spreaderId]);

  function onSubmit({ capacity, method, spreaderId }: FormValues) {
    if (currentSelectedSpreader) {
      setSelectedSpreader(currentSelectedSpreader);
    }
    setFertilizerApplication({
      method,
      spreaderId,
      amountPerApplication: Number(capacity),
    });

    navigation.navigate("AddFertilizerApplicationSelectQuantity");
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
        headerTitleOnScroll={t("fertilizer_application.select_machine.heading")}
        keyboardAware
      >
        {/* <H2>Neue Ernte</H2> */}
        <H2>{t("fertilizer_application.select_machine.heading")}</H2>
        <Card
          style={{
            backgroundColor: theme.colors.secondary,
            marginTop: theme.spacing.m,
          }}
        >
          <H3 style={{ color: theme.colors.white }}>
            {t("fertilizer_application.select_machine.only_same_unit_warning")}
          </H3>
        </Card>
        <View
          style={{ gap: theme.spacing.s, flex: 1, marginTop: theme.spacing.m }}
        >
          {fertilizerSpreaders?.length === 0 && (
            <Card
              elevated={false}
              style={{
                alignItems: "center",
                marginBottom: theme.spacing.m,
              }}
            >
              <Body>
                {t("fertilizer_application.select_machine.no_machines")}
              </Body>
              <Button
                style={{ marginTop: theme.spacing.m }}
                type="accent"
                fontSize={16}
                title={t("buttons.add")}
                onPress={() =>
                  navigation.navigate("CreateFertilizerSpreader", {
                    unit: selectedFertilizer?.unit,
                  })
                }
              />
            </Card>
          )}
          <RHSelect
            name="spreaderId"
            control={control}
            label={t("forms.labels.machine")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.spreaderId?.message}
            data={[
              { label: t("forms.labels.none"), value: "none" },
              ...(availableSpreaders?.map((config) => ({
                label: config.name,
                value: config.id,
              })) ?? []),
            ]}
          />
          {spreaderId && (
            <>
              <RHSelect
                name="method"
                control={control}
                label={t("forms.labels.method")}
                rules={{
                  required: {
                    value: true,
                    message: t("forms.validation.required"),
                  },
                }}
                error={errors.method?.message}
                data={methodSelectOptions}
              />
              {/* <RHSelect
                name="unit"
                control={control}
                label={t("forms.labels.unit")}
                disabled
                data={[
                  { label: t("units.short.l"), value: "l" },
                  { label: t("units.short.kg"), value: "kg" },
                  { label: t("units.short.dt"), value: "dt" },
                  { label: t("units.short.t"), value: "t" },
                  { label: t("units.short.m3"), value: "m3" },
                ]}
                rules={{
                  required: {
                    value: true,
                    message: t("forms.validation.required"),
                  },
                }}
                error={errors.unit?.message}
              /> */}
              <RHNumberInput
                name="capacity"
                control={control}
                keyboardType="numeric"
                label={t("forms.labels.unit_per_load", {
                  unit: selectedFertilizer?.unit,
                })}
                rules={{
                  required: {
                    value: true,
                    message: t("forms.validation.required"),
                  },
                }}
                error={errors.capacity?.message}
              />
            </>
          )}
        </View>
      </ScrollView>
    </ContentView>
  );
}
