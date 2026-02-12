import { ConservationMethod, HarvestUnit } from "@/api/harvests.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import {
  ManagePresetsModal,
  ManagePresetsModalRef,
} from "@/components/presets/ManagePresetsModal";
import { PresetSelect } from "@/components/presets/PresetSelect";
import {
  SavePresetModal,
  SavePresetModalRef,
} from "@/components/presets/SavePresetModal";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useCreateHarvestPresetMutation,
  useDeleteHarvestPresetMutation,
  useHarvestPresetsQuery,
  useUpdateHarvestPresetMutation,
} from "../harvestPresets.hooks";
import { conservationsMethods } from "../harvestUtils";
import { ConfigureHarvestScreenProps } from "../navigation/harvest-routes";
import { useCreateHarvestStore } from "./harvest.store";

type FormValues = {
  presetId?: string;
  unit: HarvestUnit;
  conservationMethod?: ConservationMethod | null;
  kilosPerUnit: string;
  additionalNotes?: string;
};

export function ConfigureHarvestScreen({
  navigation,
}: ConfigureHarvestScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const managePresetsRef = useRef<ManagePresetsModalRef>(null);
  const savePresetRef = useRef<SavePresetModalRef>(null);

  const { harvestPresets, isFetched: presetsLoaded } = useHarvestPresetsQuery();
  const createPresetMutation = useCreateHarvestPresetMutation((preset) => {
    savePresetRef.current?.close();
    setValue("presetId", preset.id);
  });
  const updatePresetMutation = useUpdateHarvestPresetMutation();
  const deletePresetMutation = useDeleteHarvestPresetMutation();

  const { setHarvest, harvest, setTotalProducedUnits } = useCreateHarvestStore();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      unit: harvest?.unit ?? "load",
      conservationMethod: harvest?.conservationMethod,
      kilosPerUnit: harvest?.kilosPerUnit?.toString(),
      additionalNotes: harvest?.additionalNotes,
    },
  });

  const presetId = watch("presetId");
  const unit = watch("unit");

  // When preset is selected, populate fields; when cleared, reset them
  useEffect(() => {
    if (presetId && harvestPresets) {
      const preset = harvestPresets.find((p) => p.id === presetId);
      if (preset) {
        setValue("unit", preset.unit);
        setValue("conservationMethod", preset.conservationMethod ?? undefined);
        setValue("kilosPerUnit", preset.kilosPerUnit.toString());
      }
    } else if (!presetId) {
      setValue("unit", "load");
      setValue("conservationMethod", undefined);
      setValue("kilosPerUnit", "");
    }
  }, [presetId, harvestPresets, setValue]);

  const unitOptions: { label: string; value: HarvestUnit }[] = [
    { label: t("harvests.labels.unit.load"), value: "load" },
    { label: t("harvests.labels.unit.round_bale"), value: "round_bale" },
    { label: t("harvests.labels.unit.square_bale"), value: "square_bale" },
    { label: t("common.crate"), value: "crate" },
    { label: t("common.total_amount"), value: "total_amount" },
  ];

  const conservationOptions: { label: string; value: string }[] =
    conservationsMethods.map((method) => ({
      label: t(`harvests.labels.conservation_method.${method}`) as string,
      value: method,
    }));

  const handleSaveAsPreset = (name: string) => {
    const values = watch();
    createPresetMutation.mutate({
      name,
      unit: values.unit,
      conservationMethod: values.conservationMethod,
      kilosPerUnit: Number(values.kilosPerUnit) || 0,
    });
  };

  const handleRenamePreset = (id: string, newName: string) => {
    updatePresetMutation.mutate({ id, name: newName });
  };

  const handleDeletePreset = (id: string) => {
    deletePresetMutation.mutate(id);
    if (presetId === id) {
      setValue("presetId", undefined);
    }
  };

  function onSubmit(values: FormValues) {
    setHarvest({
      conservationMethod: values.conservationMethod,
      kilosPerUnit: Number(values.kilosPerUnit),
      unit: values.unit,
      additionalNotes: values.additionalNotes,
    });
    // If total_amount, skip quantity screen (set to 1)
    if (values.unit === "total_amount") {
      setTotalProducedUnits(1);
      navigation.navigate("SelectHarvestPlots");
    } else {
      navigation.navigate("SetHarvestQuantity");
    }
  }

  if (!presetsLoaded) {
    return null;
  }

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
        headerTitleOnScroll={t("harvests.harvest_configuration")}
        keyboardAware
      >
        <H2>{t("harvests.harvest_configuration")}</H2>

        <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.l }}>
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
                noneLabel={t("presets.no_preset")}
              />
            )}
          />

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

          <RHSelect
            name="conservationMethod"
            control={control}
            label={t("forms.labels.conservation_optional")}
            error={errors.conservationMethod?.message}
            data={conservationOptions}
          />

          <RHNumberInput
            name="kilosPerUnit"
            control={control}
            label={
              unit === "total_amount"
                ? `${t("common.total_amount")} (${t("units.short.kg")})`
                : `${t("units.short.kg")} / ${unitLabel}`
            }
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.kilosPerUnit?.message}
          />

          <Button
            title={t("presets.save_as_preset")}
            type="accent"
            onPress={() => savePresetRef.current?.open()}
          />

          <RHTextAreaInput
            name="additionalNotes"
            control={control}
            label={t("forms.labels.additional_notes_optional")}
          />
        </View>
      </ScrollView>

      <ManagePresetsModal
        ref={managePresetsRef}
        presets={harvestPresets ?? []}
        onRename={handleRenamePreset}
        onDelete={handleDeletePreset}
        title={t("presets.manage_harvest_presets")}
      />

      <SavePresetModal
        ref={savePresetRef}
        onSave={handleSaveAsPreset}
        loading={createPresetMutation.isPending}
      />
    </ContentView>
  );
}
