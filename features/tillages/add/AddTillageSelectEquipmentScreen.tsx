import { Tillage } from "@/api/tillages.api";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { useTillageEquipmentsQuery } from "@/features/equipment/tillageEquipment.hooks";
import { AddTillageSelectEquipmentScreenProps } from "../navigation/tillages-routes";
import { Body, H2 } from "@/theme/Typography";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { tillageActions, tillageReasons } from "../tillageUtils";
import { useAddTillageStore } from "./add-tillage.store";

type FormValues = {
  equipmentId: string;
  action: Tillage["action"];
  reason: Tillage["reason"];
};
export function AddTillageSelectEquipmentScreen({
  navigation,
  route,
}: AddTillageSelectEquipmentScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { tillageEquipments, isFetched } = useTillageEquipmentsQuery();

  const { selectedEquipment, setSelectedEquipment, data, setData } =
    useAddTillageStore();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      equipmentId: selectedEquipment?.id,
      action: data?.action,
      reason: data?.reason,
    },
  });

  const createdEquipmentId = route.params.equipmentId;

  useEffect(() => {
    if (createdEquipmentId) {
      setValue("equipmentId", createdEquipmentId);
    }
  }, [createdEquipmentId]);

  const equipmentId = watch("equipmentId");

  const currentSelectedEquipment = tillageEquipments?.find(
    (config) => config.id === equipmentId
  );

  useEffect(() => {
    if (currentSelectedEquipment) {
      setValue("reason", currentSelectedEquipment.reason);
      setValue("action", currentSelectedEquipment.action);
    }
  }, [currentSelectedEquipment]);

  function onSubmit({ equipmentId, action, reason }: FormValues) {
    if (currentSelectedEquipment) {
      setSelectedEquipment(currentSelectedEquipment);
    }
    setData({
      equipmentId,
      action,
      reason,
    });

    navigation.navigate("AddTillageSelectPlots");
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
        headerTitleOnScroll={t("tillages.select_equipment.heading")}
        keyboardAware
      >
        <H2>{t("tillages.select_equipment.heading")}</H2>
        <View
          style={{ gap: theme.spacing.s, flex: 1, marginTop: theme.spacing.m }}
        >
          {tillageEquipments?.length === 0 && (
            <Card
              elevated={false}
              style={{
                alignItems: "center",
                marginBottom: theme.spacing.m,
              }}
            >
              <Body>{t("tillages.select_equipment.no_machinery")}</Body>
              <Button
                style={{ marginTop: theme.spacing.m }}
                type="accent"
                fontSize={16}
                title={t("buttons.add")}
                onPress={() => navigation.navigate("CreateTillageEquipment")}
              />
            </Card>
          )}
          <RHSelect
            name="equipmentId"
            control={control}
            label={t("forms.labels.machine")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.equipmentId?.message}
            data={[
              { label: t("forms.labels.none"), value: "none" },
              ...(tillageEquipments?.map((equipment) => ({
                label: equipment.name,
                value: equipment.id,
              })) ?? []),
            ]}
          />
          {equipmentId && (
            <>
              <RHSelect
                name="reason"
                control={control}
                label={t("forms.labels.reason")}
                data={tillageReasons.map((reason) => ({
                  label: t(`tillages.reasons.${reason}`),
                  value: reason,
                }))}
                rules={{
                  required: {
                    value: true,
                    message: t("forms.validation.required"),
                  },
                }}
                error={errors.reason?.message}
              />
              <RHSelect
                name="action"
                control={control}
                label={t("forms.labels.action")}
                data={tillageActions.map((action) => ({
                  label: t(`tillages.actions.${action}`),
                  value: action,
                }))}
                rules={{
                  required: {
                    value: true,
                    message: t("forms.validation.required"),
                  },
                }}
                error={errors.reason?.message}
              />
            </>
          )}
          {tillageEquipments?.length ? (
            <Button
              title={t("common.new_machine")}
              type="accent"
              style={{ marginTop: theme.spacing.m }}
              onPress={() => navigation.navigate("CreateTillageEquipment")}
            />
          ) : null}
        </View>
      </ScrollView>
    </ContentView>
  );
}
