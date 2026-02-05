import { ConservationMethod } from "@/api/harvestingMachinery.api";
import { ProcessingType } from "@/api/harvests.api";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { SelectHarvestingMachineryScreenProps } from "../navigation/harvest-routes";
import { Body, H2 } from "@/theme/Typography";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useHarvestingMachineryQuery } from "../../equipment/harvestingMachinery.hooks";
import { conservationsMethods, processingTypes } from "../harvestUtils";
import { useCreateHarvestStore } from "./harvest.store";

type FormValues = {
  machineId: string;
  conservationMethod: ConservationMethod;
  processingType: ProcessingType;
  kilosPerUnit: string;
};
export function SelectHarvestingMachineryScreen({
  navigation,
  route,
}: SelectHarvestingMachineryScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { harvestingMachinery, isFetched } = useHarvestingMachineryQuery();

  const { setSelectedHarvestingMachinery, setHarvest, harvest } =
    useCreateHarvestStore();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      processingType: harvest?.processingType,
      conservationMethod: harvest?.conservationMethod,
      kilosPerUnit: harvest?.kilosPerUnit?.toString(),
    },
  });
  const createdMachineId = route.params.machineId;

  useEffect(() => {
    if (createdMachineId) {
      setValue("machineId", createdMachineId);
    }
  }, [createdMachineId]);

  const machineId = watch("machineId");

  const currentSelectedHarvestingMachinery = harvestingMachinery?.find(
    (harvestingMachinery) => harvestingMachinery.id === machineId,
  );

  useEffect(() => {
    // if a machine got created, we take it instead of default machine
    if (createdMachineId) {
      return;
    }
    const defaultMachineConfig = harvestingMachinery?.find(
      (config) => config.default,
    );
    if (defaultMachineConfig) {
      setValue("machineId", defaultMachineConfig.id);
    }
  }, [harvestingMachinery]);

  useEffect(() => {
    if (currentSelectedHarvestingMachinery) {
      setValue(
        "processingType",
        currentSelectedHarvestingMachinery.defaultProcessingType,
      );
      setValue(
        "conservationMethod",
        currentSelectedHarvestingMachinery.defaultConservationMethod,
      );
      setValue(
        "kilosPerUnit",
        currentSelectedHarvestingMachinery.defaultKilosPerUnit.toString(),
      );
    }
  }, [currentSelectedHarvestingMachinery]);

  const processingType = watch("processingType");
  const [kilosPerUnitLabel, setKilosPerUnitLabel] = useState(
    `${t("units.short.kg")}/${t("harvests.labels.unit.other")}`,
  );

  useEffect(() => {
    if (processingType) {
      setKilosPerUnitLabel(
        `${t("units.short.kg")}/${t(`harvests.labels.unit.${processingType}`)}`,
      );
    }
    if (
      processingType !==
      currentSelectedHarvestingMachinery?.defaultProcessingType
    ) {
      setValue("kilosPerUnit", "");
    }
  }, [processingType]);

  function onSubmit({
    conservationMethod,
    kilosPerUnit,
    processingType,
  }: FormValues) {
    if (currentSelectedHarvestingMachinery) {
      setSelectedHarvestingMachinery(currentSelectedHarvestingMachinery);
    }
    setHarvest({
      conservationMethod,
      kilosPerUnit: Number(kilosPerUnit),
      processingType,
      machineryId: currentSelectedHarvestingMachinery?.id,
    });

    navigation.navigate("SelectHarvestQuantity");
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
        headerTitleOnScroll={t("harvests.labels.select_how.heading")}
        keyboardAware
      >
        {/* <H2>Neue Ernte</H2> */}
        <H2>{t("harvests.labels.select_how.heading")}</H2>
        <View
          style={{ gap: theme.spacing.s, flex: 1, marginTop: theme.spacing.m }}
        >
          {harvestingMachinery?.length === 0 && (
            <Card
              elevated={false}
              style={{
                alignItems: "center",
                marginBottom: theme.spacing.m,
              }}
            >
              <Body>{t("harvests.labels.select_machinery.no_machinery")}</Body>
              <Button
                style={{ marginTop: theme.spacing.m }}
                type="accent"
                fontSize={16}
                title={t("buttons.add")}
                onPress={() => navigation.navigate("CreateHarvestingMachinery")}
              />
            </Card>
          )}
          <RHSelect
            name="machineId"
            control={control}
            label="Maschine"
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.machineId?.message}
            data={[
              { label: t("forms.labels.none"), value: "none" },
              ...(harvestingMachinery?.map((harvestingMachinery) => ({
                label: harvestingMachinery.name,
                value: harvestingMachinery.id,
              })) ?? []),
            ]}
          />
          {machineId && (
            <>
              <RHSelect
                name="conservationMethod"
                control={control}
                label={t("forms.labels.conservation")}
                rules={{
                  required: {
                    value: true,
                    message: t("forms.validation.required"),
                  },
                }}
                error={errors.conservationMethod?.message}
                data={conservationsMethods.map((method) => ({
                  label: t(`harvests.labels.conservation_method.${method}`),
                  value: method,
                }))}
              />
              <RHSelect
                name="processingType"
                control={control}
                label={t("forms.labels.processing_type")}
                rules={{
                  required: {
                    value: true,
                    message: t("forms.validation.required"),
                  },
                }}
                error={errors.processingType?.message}
                data={processingTypes.map((type) => ({
                  label: t(`harvests.labels.processing_type.${type}`),
                  value: type,
                }))}
              />
              <RHNumberInput
                name="kilosPerUnit"
                control={control}
                label={kilosPerUnitLabel}
                rules={{
                  required: {
                    value: true,
                    message: t("forms.validation.required"),
                  },
                }}
                error={errors.kilosPerUnit?.message}
              />
            </>
          )}

          {harvestingMachinery?.length ? (
            <Button
              title={t("common.new_machine")}
              type="accent"
              style={{ marginTop: theme.spacing.m }}
              onPress={() => navigation.navigate("CreateHarvestingMachinery")}
            />
          ) : null}
        </View>
      </ScrollView>
    </ContentView>
  );
}
