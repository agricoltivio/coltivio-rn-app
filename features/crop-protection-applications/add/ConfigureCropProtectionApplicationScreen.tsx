import { CropProtectionApplicationPresetCreateInput } from "@/api/cropProtectionApplicationPresets.api";
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
  useCreateCropProtectionApplicationPresetMutation,
  useDeleteCropProtectionApplicationPresetMutation,
  useCropProtectionApplicationPresetsQuery,
  useUpdateCropProtectionApplicationPresetMutation,
} from "../cropProtectionApplicationPresets.hooks";
import { ConfigureCropProtectionApplicationScreenProps } from "../navigation/crop-protection-application-routes";
import { useAddCropProtectionApplicationStore } from "./cropProtectionApplication.store";
import {
  CropProtectionApplicationMethod,
  CropProtectionApplicationUnit,
} from "@/api/cropProtectionApplications.api";

const cropProtectionMethods: CropProtectionApplicationMethod[] = [
  "spraying",
  "misting",
  "broadcasting",
  "injecting",
  "other",
];

type FormValues = {
  presetId?: string;
  method: CropProtectionApplicationMethod | null;
  unit: CropProtectionApplicationUnit;
  amountPerUnit: string;
  additionalNotes?: string;
};

export function ConfigureCropProtectionApplicationScreen({
  navigation,
}: ConfigureCropProtectionApplicationScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const managePresetsRef = useRef<ManagePresetsModalRef>(null);
  const savePresetRef = useRef<SavePresetModalRef>(null);

  const { cropProtectionApplicationPresets, isFetched: presetsLoaded } =
    useCropProtectionApplicationPresetsQuery();
  const createPresetMutation = useCreateCropProtectionApplicationPresetMutation(
    (preset) => {
      savePresetRef.current?.close();
      setValue("presetId", preset.id);
    },
  );
  const updatePresetMutation =
    useUpdateCropProtectionApplicationPresetMutation();
  const deletePresetMutation =
    useDeleteCropProtectionApplicationPresetMutation();

  const { setData, data, selectedProduct, setTotalNumberOfUnits } =
    useAddCropProtectionApplicationStore();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      method: data?.method ?? "spraying",
      unit: data?.unit ?? "load",
      amountPerUnit: data?.amountPerUnit?.toString(),
      additionalNotes: data?.additionalNotes,
    },
  });

  const presetId = watch("presetId");
  const unit = watch("unit");

  // When preset is selected, populate fields; when cleared, reset them
  useEffect(() => {
    if (presetId && cropProtectionApplicationPresets) {
      const preset = cropProtectionApplicationPresets.find(
        (p) => p.id === presetId,
      );
      if (preset) {
        setValue("method", preset.method);
        setValue("unit", preset.unit);
        setValue("amountPerUnit", preset.amountPerUnit.toString());
      }
    } else if (!presetId) {
      setValue("method", "spraying");
      setValue("unit", "load");
      setValue("amountPerUnit", "");
    }
  }, [presetId, cropProtectionApplicationPresets, setValue]);

  const unitOptions: { label: string; value: CropProtectionApplicationUnit }[] =
    [
      { label: t("units.long.load"), value: "load" },
      { label: t("fertilizer_application.units.bag"), value: "bag" },
      { label: t("common.total_amount"), value: "total_amount" },
      {
        label: t("fertilizer_application.units.amount_per_hectare"),
        value: "amount_per_hectare",
      },
      { label: t("harvests.labels.unit.other"), value: "other" },
    ];

  const methodOptions: {
    label: string;
    value: CropProtectionApplicationMethod;
  }[] = cropProtectionMethods.map((method) => ({
    label: t(`crop_protection_applications.methods.${method}`) as string,
    value: method,
  }));

  const handleSaveAsPreset = (name: string) => {
    const values = watch();
    createPresetMutation.mutate({
      name,
      method: values.method,
      unit: values.unit,
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
    setData({
      method: values.method ?? undefined,
      unit: values.unit,
      amountPerUnit: Number(values.amountPerUnit),
      additionalNotes: values.additionalNotes,
    });

    // Skip quantity screen for special units
    if (values.unit === "total_amount" || values.unit === "amount_per_hectare") {
      if (values.unit === "total_amount") {
        setTotalNumberOfUnits(1);
      }
      navigation.navigate("SelectCropProtectionApplicationPlots");
      return;
    }
    navigation.navigate("SetCropProtectionApplicationUnitQuantity");
  }

  if (!presetsLoaded) return null;

  const unitLabel = unitOptions.find((o) => o.value === unit)?.label ?? "";
  const productUnit = selectedProduct?.unit ?? "kg";

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
          "crop_protection_applications.application_configuration",
        )}
        keyboardAware
      >
        <H2>{t("crop_protection_applications.application_configuration")}</H2>

        <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.l }}>
          <Controller
            control={control}
            name="presetId"
            render={({ field: { value, onChange } }) => (
              <PresetSelect
                label={t("presets.preset")}
                value={value}
                presets={cropProtectionApplicationPresets ?? []}
                onChange={onChange}
                onManagePress={() => managePresetsRef.current?.open()}
                placeholder={t("presets.select_preset")}
                noneLabel={t("presets.no_preset")}
              />
            )}
          />

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
            data={methodOptions}
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

          <RHNumberInput
            name="amountPerUnit"
            control={control}
            label={
              unit === "total_amount"
                ? `${t("common.total_amount")} (${productUnit})`
                : unit === "amount_per_hectare"
                  ? `${productUnit} / ${t("units.short.ha")}`
                  : `${productUnit} / ${unitLabel}`
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
        presets={cropProtectionApplicationPresets ?? []}
        onRename={handleRenamePreset}
        onDelete={handleDeletePreset}
        title={t("presets.manage_crop_protection_presets")}
      />

      <SavePresetModal
        ref={savePresetRef}
        onSave={handleSaveAsPreset}
        loading={createPresetMutation.isPending}
      />
    </ContentView>
  );
}
