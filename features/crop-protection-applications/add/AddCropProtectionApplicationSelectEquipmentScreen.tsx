import { CropProtectionApplication } from "@/api/cropProtectionApplications.api";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { useCropProtectionEquipmentsQuery } from "@/features/equipment/cropProtectionEquipment.hooks";
import { AddCropProtectionApplicationSelectMachineConfigScreenProps } from "../navigation/crop-protection-application-routes";
import { Body, H2, H3, H4 } from "@/theme/Typography";
import React, { createElement, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  getUnitLabel,
  methodSelectData,
} from "../cropProtectionApplication.utils";
import { useAddCropProtectionApplicationStore } from "./cropProtectionApplication.store";

type FormValues = {
  equipmentId: string;
  capacity: string;
  method: CropProtectionApplication["method"];
  unit: CropProtectionApplication["unit"];
};
export function AddCropProtectionApplicationSelectMachineConfigScreen({
  navigation,
  route,
}: AddCropProtectionApplicationSelectMachineConfigScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { cropProtectionEquipments, isFetched } =
    useCropProtectionEquipmentsQuery();

  const {
    data,
    setData,
    selectedProduct,
    selectedEquipment,
    setSelectedEquipment,
  } = useAddCropProtectionApplicationStore();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      unit: selectedProduct?.unit,
      equipmentId:
        selectedEquipment?.id || data?.amountPerApplication
          ? "none"
          : undefined,
      capacity:
        selectedEquipment?.capacity.toString() ||
        data?.amountPerApplication?.toString(),
      method: selectedEquipment?.method,
    },
  });

  const createdEquipment = route.params.equipmentId;

  useEffect(() => {
    if (createdEquipment) {
      setValue("equipmentId", createdEquipment);
    }
  }, [createdEquipment]);

  const equipmentId = watch("equipmentId");

  const currentSelectedEquipment = cropProtectionEquipments?.find(
    (config) => config.id === equipmentId
  );

  const availableEquipments = cropProtectionEquipments?.filter(
    (equipment) => equipment.unit === selectedProduct?.unit
  );
  useEffect(() => {
    if (currentSelectedEquipment) {
      setValue("capacity", currentSelectedEquipment.capacity.toString());
      setValue("method", currentSelectedEquipment.method);
    }
  }, [currentSelectedEquipment]);

  function onSubmit({ capacity, method }: FormValues) {
    if (currentSelectedEquipment) {
      setSelectedEquipment(currentSelectedEquipment);
    }
    setData({
      amountPerApplication: Number(capacity),
      method,
    });

    navigation.navigate("AddCropProtectionApplicationSelectQuantity");
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
        headerTitleOnScroll={t(
          "crop_protection_applications.select_equipment.heading"
        )}
        keyboardAware
      >
        {/* <H2>Neue Ernte</H2> */}
        <H2>{t("crop_protection_applications.select_equipment.heading")}</H2>
        <Card
          style={{
            backgroundColor: theme.colors.secondary,
            marginTop: theme.spacing.m,
          }}
        >
          <H4 style={{ color: theme.colors.white }}>
            {t(
              "crop_protection_applications.select_equipment.only_same_unit_warning"
            )}
          </H4>
        </Card>
        <View
          style={{ gap: theme.spacing.s, flex: 1, marginTop: theme.spacing.m }}
        >
          {availableEquipments?.length === 0 && (
            <Card
              elevated={false}
              style={{
                alignItems: "center",
                marginBottom: theme.spacing.m,
              }}
            >
              <Body>
                {t(
                  "crop_protection_applications.select_equipment.no_matching_equipment_message"
                )}
              </Body>
              <Button
                style={{ marginTop: theme.spacing.m }}
                type="accent"
                fontSize={16}
                title={t("buttons.add")}
                onPress={() =>
                  navigation.navigate("CreateCropProtectionEquipment", {
                    unit: selectedProduct?.unit,
                  })
                }
              />
            </Card>
          )}
          <RHSelect
            name="equipmentId"
            control={control}
            label={t("forms.labels.device")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.equipmentId?.message}
            data={[
              { label: t("forms.labels.none"), value: "none" },
              ...(availableEquipments?.map((config) => ({
                label: config.name,
                value: config.id,
              })) ?? []),
            ]}
          />
          {equipmentId && (
            <>
              {/* <RHSelect
                name="unit"
                control={control}
                label={t('forms.labels.unit')}
                disabled
                data={[
                  { label: "ml", value: "ml" },
                  { label: "l", value: "l" },
                  { label: "g", value: "g" },
                  { label: "kg", value: "kg" },
                ]}
                rules={{
                  required: {
                    value: true,
                    message: "Einheit ist erforderlich",
                  },
                }}
                error={errors.unit?.message}
              /> */}
              <RHSelect
                name="method"
                control={control}
                label={t("forms.labels.method")}
                data={methodSelectData}
                rules={{
                  required: {
                    value: true,
                    message: t("forms.validation.required"),
                  },
                }}
                error={errors.method?.message}
              />

              <RHNumberInput
                name="capacity"
                control={control}
                keyboardType="numeric"
                label={t("forms.labels.capacity_per_unit", {
                  unit: t(`units.long.${selectedProduct!.unit}`),
                  loadUnit: t(`units.long.load`),
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
          {availableEquipments?.length ? (
            <Button
              title={t("common.new_device")}
              type="accent"
              style={{ marginTop: theme.spacing.m }}
              onPress={() =>
                navigation.navigate("CreateCropProtectionEquipment", {
                  unit: selectedProduct?.unit,
                })
              }
            />
          ) : null}
        </View>
      </ScrollView>
    </ContentView>
  );
}
