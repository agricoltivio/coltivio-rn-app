import { ConservationMethod, HarvestUnit } from "@/api/harvests.api";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import {
  ManagePresetsModal,
  ManagePresetsModalRef,
} from "@/components/presets/ManagePresetsModal";
import { PresetSelect } from "@/components/presets/PresetSelect";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { Body, H2 } from "@/theme/Typography";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropsQuery } from "../../crops/crops.hooks";
import {
  useCreateHarvestPresetMutation,
  useDeleteHarvestPresetMutation,
  useHarvestPresetsQuery,
  useUpdateHarvestPresetMutation,
} from "../harvestPresets.hooks";
import { conservationsMethods } from "../harvestUtils";
import { AddHarvestConfigurationScreenProps } from "../navigation/harvest-routes";
import { useCreateHarvestStore } from "./harvest.store";

type FormValues = {
  date: Date;
  cropId: string;
  presetId?: string;
  unit: HarvestUnit;
  conservationMethod?: ConservationMethod;
  kilosPerUnit: string;
  totalProducedUnits: string;
};

export function AddHarvestConfigurationScreen({
  navigation,
}: AddHarvestConfigurationScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const managePresetsRef = useRef<ManagePresetsModalRef>(null);

  const { crops, isFetched: cropsLoaded } = useCropsQuery();
  const { harvestPresets, isFetched: presetsLoaded } = useHarvestPresetsQuery();
  const createPresetMutation = useCreateHarvestPresetMutation();
  const updatePresetMutation = useUpdateHarvestPresetMutation();
  const deletePresetMutation = useDeleteHarvestPresetMutation();

  const {
    setHarvest,
    setSelectedCrop,
    setTotalProducedUnits,
    harvest,
    reset,
    totalProducedUnits,
  } = useCreateHarvestStore();

  // Reset store on mount
  useEffect(() => {
    return () => reset();
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: harvest?.date ?? new Date(),
      cropId: harvest?.cropId,
      unit: "load",
      conservationMethod: undefined,
      kilosPerUnit: harvest?.kilosPerUnit?.toString() ?? undefined,
      totalProducedUnits: totalProducedUnits?.toString() ?? undefined,
    },
  });

  const presetId = watch("presetId");
  const unit = watch("unit");

  // When preset is selected, populate fields from preset
  useEffect(() => {
    if (presetId && harvestPresets) {
      const preset = harvestPresets.find((p) => p.id === presetId);
      if (preset) {
        setValue("unit", preset.unit);
        setValue("conservationMethod", preset.conservationMethod ?? undefined);
        setValue("kilosPerUnit", preset.kilosPerUnit.toString());
      }
    }
  }, [presetId, harvestPresets, setValue]);

  const unitOptions: { label: string; value: HarvestUnit }[] = [
    { label: t("harvests.labels.unit.load"), value: "load" },
    { label: t("harvests.labels.unit.round_bale"), value: "round_bale" },
    { label: t("harvests.labels.unit.square_bale"), value: "square_bale" },
    { label: t("common.crate"), value: "crate" },
    { label: t("common.total_amount"), value: "total_amount" },
    { label: t("harvests.labels.unit.other"), value: "other" },
  ];

  const conservationOptions: { label: string; value: string }[] =
    conservationsMethods.map((method) => ({
      label: t(`harvests.labels.conservation_method.${method}`) as string,
      value: method,
    }));

  const handleSaveAsPreset = () => {
    const values = watch();
    Alert.prompt(
      t("presets.save_as_preset"),
      t("presets.enter_preset_name"),
      [
        { text: t("buttons.cancel"), style: "cancel" },
        {
          text: t("buttons.save"),
          onPress: (name: string | undefined) => {
            if (name?.trim()) {
              createPresetMutation.mutate({
                name: name.trim(),
                unit: values.unit,
                conservationMethod: values.conservationMethod,
                kilosPerUnit: Number(values.kilosPerUnit) || 0,
              });
            }
          },
        },
      ],
      "plain-text",
    );
  };

  const handleRenamePreset = (id: string, newName: string) => {
    updatePresetMutation.mutate({ id, name: newName });
  };

  const handleDeletePreset = (id: string) => {
    deletePresetMutation.mutate(id);
    // If the deleted preset was selected, clear selection
    if (presetId === id) {
      setValue("presetId", undefined);
    }
  };

  function onSubmit(values: FormValues) {
    setHarvest({
      date: values.date,
      cropId: values.cropId,
      conservationMethod: values.conservationMethod,
      kilosPerUnit: Number(values.kilosPerUnit),
      unit: values.unit,
    });

    const selectedCrop = crops?.find((c) => c.id === values.cropId);
    if (selectedCrop) {
      setSelectedCrop(selectedCrop);
    }

    setTotalProducedUnits(Number(values.totalProducedUnits));

    navigation.navigate("SelectHarvstPlots");
  }

  if (!cropsLoaded || !presetsLoaded) {
    return null;
  }

  // Dynamic unit label for amount input
  const unitLabel =
    unitOptions.find((o) => o.value === unit)?.label ??
    t("harvests.labels.unit.other");

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
        headerTitleOnScroll={t("harvests.add_harvest")}
        keyboardAware
      >
        <H2>{t("harvests.add_harvest")}</H2>

        <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.l }}>
          {/* Date picker */}
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

          {/* Crop selector */}
          <RHSelect
            name="cropId"
            control={control}
            label={t("forms.labels.crop")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.cropId?.message}
            data={
              crops?.map((crop) => ({
                label: crop.name,
                value: crop.id,
              })) ?? []
            }
          />

          {/* Preset section */}
          <Card
            elevated={false}
            style={{ backgroundColor: theme.colors.gray4 }}
          >
            <Body style={{ fontWeight: "600", marginBottom: theme.spacing.s }}>
              {t("presets.preset_settings")}
            </Body>

            {/* Preset selector with manage button */}
            <Controller
              control={control}
              name="presetId"
              render={({ field: { value, onChange } }) => (
                <PresetSelect
                  label={t("presets.preset")}
                  value={value}
                  presets={harvestPresets ?? []}
                  onChange={onChange}
                  onManagePress={() => managePresetsRef.current?.open()}
                  placeholder={t("presets.select_preset")}
                />
              )}
            />

            <View style={{ gap: theme.spacing.s, marginTop: theme.spacing.m }}>
              {/* Unit selector */}
              <RHSelect
                name="unit"
                control={control}
                label={t("forms.labels.unit")}
                rules={{
                  required: {
                    value: true,
                    message: t("forms.validation.required"),
                  },
                }}
                error={errors.unit?.message}
                data={unitOptions}
              />

              {/* Conservation method */}
              <RHSelect
                name="conservationMethod"
                control={control}
                label={t("forms.labels.conservation")}
                error={errors.conservationMethod?.message}
                data={conservationOptions}
              />

              {/* Kilos per unit */}
              <RHNumberInput
                name="kilosPerUnit"
                control={control}
                label={`${t("units.short.kg")}/${unitLabel}`}
                rules={{
                  required: {
                    value: true,
                    message: t("forms.validation.required"),
                  },
                }}
                error={errors.kilosPerUnit?.message}
              />
            </View>

            {/* Save as preset button */}
            <Button
              title={t("presets.save_as_preset")}
              type="accent"
              style={{ marginTop: theme.spacing.m }}
              onPress={handleSaveAsPreset}
              loading={createPresetMutation.isPending}
            />
          </Card>

          {/* Amount of units */}
          <RHNumberInput
            name="totalProducedUnits"
            control={control}
            label={t("forms.labels.amount_unit", { unit: unitLabel })}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.totalProducedUnits?.message}
            float
          />
        </View>
      </ScrollView>

      {/* Manage presets modal */}
      <ManagePresetsModal
        ref={managePresetsRef}
        presets={harvestPresets ?? []}
        onRename={handleRenamePreset}
        onDelete={handleDeletePreset}
        title={t("presets.manage_harvest_presets")}
      />
    </ContentView>
  );
}
