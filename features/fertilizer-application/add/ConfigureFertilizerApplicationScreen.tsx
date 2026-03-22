import { FertilizerApplicationPresetCreateInput } from "@/api/fertilizerApplicationPresets.api";
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
  useCreateFertilizerApplicationPresetMutation,
  useDeleteFertilizerApplicationPresetMutation,
  useFertilizerApplicationPresetsQuery,
  useUpdateFertilizerApplicationPresetMutation,
} from "../fertilizerApplicationPresets.hooks";
import { fertilizerApplicationMethods } from "../fertilizerApplications.utils";
import { ConfigureFertilizerApplicationScreenProps } from "../navigation/fertilizer-application-routes";
import { useCreateFertilizerApplicationStore } from "./fertilizerApplication.store";

type FertilizerAppUnit = FertilizerApplicationPresetCreateInput["unit"];
type FertilizerAppMethod = FertilizerApplicationPresetCreateInput["method"];

type FormValues = {
  presetId?: string;
  unit: FertilizerAppUnit;
  method?: FertilizerAppMethod;
  amountPerUnit: string;
  additionalNotes?: string;
};

export function ConfigureFertilizerApplicationScreen({
  navigation,
}: ConfigureFertilizerApplicationScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const managePresetsRef = useRef<ManagePresetsModalRef>(null);
  const savePresetRef = useRef<SavePresetModalRef>(null);

  const { fertilizerApplicationPresets, isFetched: presetsLoaded } =
    useFertilizerApplicationPresetsQuery();
  const createPresetMutation = useCreateFertilizerApplicationPresetMutation(
    (preset) => {
      savePresetRef.current?.close();
      setValue("presetId", preset.id);
    },
  );
  const updatePresetMutation = useUpdateFertilizerApplicationPresetMutation();
  const deletePresetMutation = useDeleteFertilizerApplicationPresetMutation();

  const {
    setFertilizerApplication,
    fertilizerApplication,
    selectedFertilizer,
    setTotalNumberOfApplications,
  } = useCreateFertilizerApplicationStore();

  const fertilizerId = fertilizerApplication?.fertilizerId;

  // Filter presets by selected fertilizer
  const filteredPresets =
    fertilizerApplicationPresets?.filter(
      (p) => p.fertilizerId === fertilizerId,
    ) ?? [];

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      unit: fertilizerApplication?.unit ?? "load",
      method: fertilizerApplication?.method,
      amountPerUnit: fertilizerApplication?.amountPerUnit?.toString(),
      additionalNotes: fertilizerApplication?.additionalNotes,
    },
  });

  const presetId = watch("presetId");
  const unit = watch("unit");

  // When preset is selected, populate fields; when cleared, reset them
  useEffect(() => {
    if (presetId && fertilizerApplicationPresets) {
      const preset = fertilizerApplicationPresets.find(
        (p) => p.id === presetId,
      );
      if (preset) {
        setValue("unit", preset.unit);
        setValue("method", preset.method ?? undefined);
        setValue("amountPerUnit", preset.amountPerUnit.toString());
      }
    } else if (!presetId) {
      setValue("unit", "load");
      setValue("method", undefined);
      setValue("amountPerUnit", "");
    }
  }, [presetId, fertilizerApplicationPresets, setValue]);

  const unitOptions: { label: string; value: FertilizerAppUnit }[] = [
    { label: t("units.long.load"), value: "load" },
    { label: t("fertilizer_application.units.bag"), value: "bag" },
    { label: t("common.total_amount"), value: "total_amount" },
    {
      label: t("fertilizer_application.units.amount_per_hectare"),
      value: "amount_per_hectare",
    },
    { label: t("harvests.labels.unit.other"), value: "other" },
  ];

  const methodOptions: { label: string; value: string }[] =
    fertilizerApplicationMethods.map((method) => ({
      label: t(`fertilizer_application.methods.${method}`) as string,
      value: method,
    }));

  const handleSaveAsPreset = (name: string) => {
    const values = watch();
    if (!fertilizerId) return;
    createPresetMutation.mutate({
      name,
      fertilizerId,
      unit: values.unit,
      method: values.method,
      amountPerUnit: Number(values.amountPerUnit) || 0,
    });
  };

  const handleRenamePreset = (id: string, newName: string) => {
    updatePresetMutation.mutate({ id, name: newName });
  };

  const handleDeletePreset = (id: string) => {
    deletePresetMutation.mutate(id);
    if (presetId === id) setValue("presetId", undefined);
  };

  function onSubmit(values: FormValues) {
    setFertilizerApplication({
      unit: values.unit,
      method: values.method,
      amountPerUnit: Number(values.amountPerUnit),
      additionalNotes: values.additionalNotes,
    });

    // Skip quantity screen for special units
    if (
      values.unit === "total_amount" ||
      values.unit === "amount_per_hectare"
    ) {
      if (values.unit === "total_amount") {
        setTotalNumberOfApplications(1);
      }
      navigation.navigate("SelectFertilizerApplicationPlots");
      return;
    }
    navigation.navigate("SetFertilizerApplicationUnitQuantity");
  }

  if (!presetsLoaded) return null;

  const unitLabel = unitOptions.find((o) => o.value === unit)?.label ?? "";
  const fertilizerUnit = selectedFertilizer?.unit ?? "kg";

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
          "fertilizer_application.application_configuration",
        )}
        keyboardAware
      >
        <H2>{t("fertilizer_application.application_configuration")}</H2>

        <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.l }}>
          <Controller
            control={control}
            name="presetId"
            render={({ field: { value, onChange } }) => (
              <PresetSelect
                label={t("presets.preset")}
                value={value}
                presets={filteredPresets}
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
            name="method"
            control={control}
            label={t("forms.labels.method")}
            data={methodOptions}
          />

          <RHNumberInput
            name="amountPerUnit"
            control={control}
            label={
              unit === "total_amount"
                ? `${t("common.total_amount")} (${fertilizerUnit})`
                : unit === "amount_per_hectare"
                  ? `${fertilizerUnit} / ${t("units.short.ha")}`
                  : `${fertilizerUnit} / ${unitLabel}`
            }
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.amountPerUnit?.message}
            float
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
        presets={filteredPresets}
        onRename={handleRenamePreset}
        onDelete={handleDeletePreset}
        title={t("presets.manage_fertilizer_presets")}
      />

      <SavePresetModal
        ref={savePresetRef}
        onSave={handleSaveAsPreset}
        loading={createPresetMutation.isPending}
      />
    </ContentView>
  );
}
