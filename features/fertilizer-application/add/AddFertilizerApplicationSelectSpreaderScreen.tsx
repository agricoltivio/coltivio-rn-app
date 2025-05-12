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
import { Body, H2 } from "@/theme/Typography";
import { areUnitsCompatible, convertUnit } from "@/utils/units";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { fertilizerApplicationMethods } from "../fertilizerApplications.utils";
import { AddFertilizerApplicationSelectSpreaderScreenProps } from "../navigation/fertilizer-application-routes";
import { useCreateFertilizerApplicationStore } from "./fertilizerApplication.store";

type FormValues = {
  spreaderId: string;
  method: FertilizerApplicationMethod;
  capacity: string;
  unit: FertilizerApplication["unit"];
};
export function AddFertilizerApplicationSelectSpreaderScreen({
  navigation,
  route,
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
      spreaderId:
        selectedSpreader?.id || selectedFertilizer?.defaultSpreaderId || "none",
      capacity:
        selectedSpreader?.capacity.toString() ||
        fertilizerApplication?.amountPerApplication?.toString(),
    },
  });

  const createdSpreaderId = route.params.spreaderId;

  useEffect(() => {
    const createdSpreader = fertilizerSpreaders?.find(
      (config) => config.id === createdSpreaderId
    );
    if (
      createdSpreader &&
      areUnitsCompatible(createdSpreader.unit, selectedFertilizer!.unit)
    ) {
      setValue("spreaderId", createdSpreader.id);
    }
  }, [createdSpreaderId, fertilizerSpreaders, selectedFertilizer]);

  const spreaderId = watch("spreaderId");

  const currentSelectedSpreader = fertilizerSpreaders?.find(
    (config) => config.id === spreaderId
  );

  const availableSpreaders = fertilizerSpreaders?.filter((config) =>
    areUnitsCompatible(config.unit, selectedFertilizer!.unit)
  );

  const methodSelectOptions = fertilizerApplicationMethods.map((method) => ({
    label: t(`fertilizer_application.methods.${method}`),
    value: method,
  }));

  useEffect(() => {
    if (currentSelectedSpreader) {
      setValue(
        "capacity",
        convertUnit(
          currentSelectedSpreader.capacity,
          currentSelectedSpreader.unit,
          selectedFertilizer!.unit
        ).toString()
      );
      setValue("method", currentSelectedSpreader.defaultMethod);
    }
  }, [spreaderId, currentSelectedSpreader]);

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
        <H2>{t("fertilizer_application.select_machine.heading")}</H2>
        <View
          style={{ gap: theme.spacing.s, flex: 1, marginTop: theme.spacing.s }}
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
                float
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

          {fertilizerSpreaders?.length ? (
            <Button
              title={t("common.new_machine")}
              type="accent"
              style={{ marginTop: theme.spacing.m }}
              onPress={() =>
                navigation.navigate("CreateFertilizerSpreader", {
                  unit: selectedFertilizer?.unit,
                })
              }
            />
          ) : null}
        </View>
      </ScrollView>
    </ContentView>
  );
}
