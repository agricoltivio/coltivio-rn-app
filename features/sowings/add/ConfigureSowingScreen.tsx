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
import { Body, H2 } from "@/theme/Typography";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { ConfigureSowingScreenProps } from "../navigation/sowing-routes";
import {
  useCreateSowingPresetMutation,
  useDeleteSowingPresetMutation,
  useSowingPresetsQuery,
  useSowingUnitsQuery,
  useUpdateSowingPresetMutation,
} from "../sowings.hooks";
import {
  computeCounterpart,
  isPerAreaUnit,
  unitsForQuantityKind,
} from "../sowingUnits";
import { useCreateSowingStore } from "./sowing.store";

type FormValues = {
  presetId?: string;
  unit: string;
  amount: string;
  additionalNotes?: string;
};

export function ConfigureSowingScreen({
  navigation,
}: ConfigureSowingScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const managePresetsRef = useRef<ManagePresetsModalRef>(null);
  const savePresetRef = useRef<SavePresetModalRef>(null);

  const { sowingUnits } = useSowingUnitsQuery();
  const { sowingPresets, isFetched: presetsLoaded } = useSowingPresetsQuery();
  const createPresetMutation = useCreateSowingPresetMutation((preset) => {
    savePresetRef.current?.close();
    setValue("presetId", preset.id);
  });
  const updatePresetMutation = useUpdateSowingPresetMutation();
  const deletePresetMutation = useDeleteSowingPresetMutation();

  const {
    sowing,
    setSowing,
    selectedSeed,
    selectedPlotsById,
    putSowingPlot,
    preselectedPlotId,
  } = useCreateSowingStore();

  const units = sowingUnits ?? [];
  const availableUnits = unitsForQuantityKind(
    units,
    selectedSeed?.quantityKind,
  );

  // Only presets of this crop whose seed (if any) is the chosen one and whose
  // unit fits the chosen seed can be applied without changing the seed
  const matchingPresets = (sowingPresets ?? []).filter(
    (preset) =>
      preset.cropId === sowing?.cropId &&
      (preset.seedId === null || preset.seedId === selectedSeed?.id) &&
      availableUnits.some((unitInfo) => unitInfo.unit === preset.unit),
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      // the seed's default rate prefills a new sowing
      unit: sowing?.unit ?? selectedSeed?.defaultUnit ?? undefined,
      amount: (sowing?.amount ?? selectedSeed?.defaultAmount)?.toString(),
      additionalNotes: sowing?.additionalNotes,
    },
  });

  const presetId = watch("presetId");
  const unitValue = watch("unit");
  const amountValue = watch("amount");

  useEffect(() => {
    const preset = sowingPresets?.find((p) => p.id === presetId);
    if (preset) {
      setValue("unit", preset.unit);
      setValue("amount", preset.amount.toString());
    }
  }, [presetId, sowingPresets, setValue]);

  const unit = availableUnits.find(
    (unitInfo) => unitInfo.unit === unitValue,
  )?.unit;
  const amount = Number(amountValue) || 0;
  const plots = Object.values(selectedPlotsById);
  const totalSize = plots.reduce((sum, plot) => sum + plot.size, 0);
  const perArea = unit ? isPerAreaUnit(units, unit) : false;
  const counterpart =
    unit && amount > 0
      ? computeCounterpart(units, amount, unit, totalSize)
      : null;

  const handleSaveAsPreset = (name: string) => {
    if (!unit || !sowing?.cropId) return;
    createPresetMutation.mutate({
      name,
      // with a seed the API takes the crop from the seed
      cropId: selectedSeed ? undefined : sowing.cropId,
      seedId: selectedSeed?.id,
      unit,
      amount,
    });
  };

  const handleDeletePreset = (id: string) => {
    deletePresetMutation.mutate(id);
    if (presetId === id) {
      setValue("presetId", undefined);
    }
  };

  function onSubmit(values: FormValues) {
    if (!unit) return;
    setSowing({
      unit,
      amount: Number(values.amount),
      additionalNotes: values.additionalNotes,
    });
    // started from a plot: it's the only plot, so it gets the whole amount
    const preselectedPlot = preselectedPlotId
      ? selectedPlotsById[preselectedPlotId]
      : undefined;
    if (preselectedPlot) {
      putSowingPlot({ ...preselectedPlot, amount: Number(values.amount) });
      navigation.navigate("SowingSummary");
    } else {
      navigation.navigate("SelectSowingPlots");
    }
  }

  if (!presetsLoaded || !sowingUnits) {
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
        headerTitleOnScroll={t("sowings.sowing_configuration")}
        keyboardAware
      >
        <H2>{t("sowings.sowing_configuration")}</H2>

        <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.l }}>
          <Controller
            control={control}
            name="presetId"
            render={({ field: { value, onChange } }) => (
              <PresetSelect
                label={t("presets.preset")}
                value={value}
                presets={matchingPresets}
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
            data={availableUnits.map((unitInfo) => ({
              label: t(`sowings.units.${unitInfo.unit}`),
              value: unitInfo.unit,
            }))}
          />

          <View style={{ gap: theme.spacing.xs }}>
            <RHNumberInput
              name="amount"
              control={control}
              float
              label={
                unit
                  ? `${t("sowings.amount")} (${t(`sowings.units.${unit}`)})`
                  : t("sowings.amount")
              }
              rules={{
                required: {
                  value: true,
                  message: t("forms.validation.required"),
                },
              }}
              error={errors.amount?.message}
            />
            {counterpart && (
              <Body style={{ color: theme.colors.gray2 }}>
                {t(
                  perArea ? "sowings.computed_total" : "sowings.computed_rate",
                  {
                    amount: counterpart.amount.toLocaleString(),
                    unit: t(`sowings.units.${counterpart.unit}`),
                    area: counterpart.area,
                  },
                )}
              </Body>
            )}
          </View>

          <Button
            title={t("presets.save_as_preset")}
            type="accent"
            disabled={!unit || amountValue === undefined || amountValue === ""}
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
        presets={sowingPresets ?? []}
        onRename={(id, name) => updatePresetMutation.mutate({ id, name })}
        onDelete={handleDeletePreset}
        title={t("presets.manage_sowing_presets")}
      />

      <SavePresetModal
        ref={savePresetRef}
        onSave={handleSaveAsPreset}
        loading={createPresetMutation.isPending}
      />
    </ContentView>
  );
}
