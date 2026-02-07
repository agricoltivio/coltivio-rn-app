import { FertilizerApplicationPresetCreateInput } from "@/api/fertilizerApplicationPresets.api";
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
import { useFertilizersQuery } from "@/features/fertilizers/fertilizers.hooks";
import { H2, Body } from "@/theme/Typography";
import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View, Alert } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useCreateFertilizerApplicationPresetMutation,
  useDeleteFertilizerApplicationPresetMutation,
  useFertilizerApplicationPresetsQuery,
  useUpdateFertilizerApplicationPresetMutation,
} from "../fertilizerApplicationPresets.hooks";
import { useCreateFertilizerApplicationStore } from "./fertilizerApplication.store";
import { AddFertilizerApplicationConfigurationScreenProps } from "../navigation/fertilizer-application-routes";
import { fertilizerApplicationMethods } from "../fertilizerApplications.utils";

type FertilizerAppUnit = FertilizerApplicationPresetCreateInput["unit"];
type FertilizerAppMethod = FertilizerApplicationPresetCreateInput["method"];

type FormValues = {
  date: Date;
  fertilizerId: string;
  presetId?: string;
  unit: FertilizerAppUnit;
  method?: FertilizerAppMethod;
  amountPerUnit: string;
  numberOfApplications: string;
};

export function AddFertilizerApplicationConfigurationScreen({
  navigation,
}: AddFertilizerApplicationConfigurationScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const managePresetsRef = useRef<ManagePresetsModalRef>(null);

  const { fertilizers, isFetched: fertilizersLoaded } = useFertilizersQuery();
  const { fertilizerApplicationPresets, isFetched: presetsLoaded } =
    useFertilizerApplicationPresetsQuery();
  const createPresetMutation = useCreateFertilizerApplicationPresetMutation();
  const updatePresetMutation = useUpdateFertilizerApplicationPresetMutation();
  const deletePresetMutation = useDeleteFertilizerApplicationPresetMutation();

  const {
    setFertilizerApplication,
    setSelectedFertilizer,
    setTotalNumberOfApplications,
    fertilizerApplication,
    selectedFertilizer,
    totalNumberOfApplications,
    reset,
  } = useCreateFertilizerApplicationStore();

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
      date: fertilizerApplication?.date ?? new Date(),
      fertilizerId:
        fertilizerApplication?.fertilizerId ?? selectedFertilizer?.id,
      unit: "load",
      amountPerUnit: fertilizerApplication?.amountPerUnit?.toString() ?? "",
      numberOfApplications: totalNumberOfApplications?.toString() ?? "",
    },
  });

  const presetId = watch("presetId");
  const fertilizerId = watch("fertilizerId");
  const unit = watch("unit");

  // Get current fertilizer to show its unit
  const currentFertilizer = fertilizers?.find((f) => f.id === fertilizerId);

  // Filter presets by selected fertilizer
  const filteredPresets =
    fertilizerApplicationPresets?.filter(
      (p) => p.fertilizerId === fertilizerId,
    ) ?? [];

  // When preset is selected, populate fields
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
    }
  }, [presetId, fertilizerApplicationPresets, setValue]);

  // Reset preset when fertilizer changes
  useEffect(() => {
    setValue("presetId", undefined);
  }, [fertilizerId, setValue]);

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

  const handleSaveAsPreset = () => {
    const values = watch();
    if (!values.fertilizerId || !values.unit) return;
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
                fertilizerId: values.fertilizerId,
                unit: values.unit,
                method: values.method,
                amountPerUnit: Number(values.amountPerUnit) || 0,
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
    if (presetId === id) setValue("presetId", undefined);
  };

  function onSubmit(values: FormValues) {
    const fertilizer = fertilizers?.find((f) => f.id === values.fertilizerId);
    if (fertilizer) {
      setSelectedFertilizer(fertilizer);
    }

    setFertilizerApplication({
      date: values.date,
      fertilizerId: values.fertilizerId,
      unit: values.unit,
      method: values.method,
      amountPerUnit: Number(values.amountPerUnit),
    });

    setTotalNumberOfApplications(Number(values.numberOfApplications));

    navigation.navigate("AddFertilizerApplicationSelectPlots");
  }

  if (!fertilizersLoaded || !presetsLoaded) return null;

  const unitLabel = unitOptions.find((o) => o.value === unit)?.label ?? "";
  // Use fertilizer unit for the amount label (e.g., "kg / Load")
  const fertilizerUnit = currentFertilizer?.unit ?? "kg";

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
          "fertilizer_application.add_fertilizer_application",
        )}
        keyboardAware
      >
        <H2>{t("fertilizer_application.add_fertilizer_application")}</H2>

        <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.l }}>
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

          <RHSelect
            name="fertilizerId"
            control={control}
            label={t("forms.labels.fertiliser")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.fertilizerId?.message}
            data={
              fertilizers?.map((f) => ({ label: f.name, value: f.id })) ?? []
            }
          />

          {fertilizerId && (
            <Card
              elevated={false}
              style={{ backgroundColor: theme.colors.gray4 }}
            >
              <Body
                style={{ fontWeight: "600", marginBottom: theme.spacing.s }}
              >
                {t("presets.preset_settings")}
              </Body>

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
                  />
                )}
              />

              <View
                style={{ gap: theme.spacing.s, marginTop: theme.spacing.m }}
              >
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
                  label={`${fertilizerUnit} / ${unitLabel}`}
                  rules={{
                    required: {
                      value: true,
                      message: t("forms.validation.required"),
                    },
                  }}
                  error={errors.amountPerUnit?.message}
                  float
                />
              </View>

              <Button
                title={t("presets.save_as_preset")}
                type="accent"
                style={{ marginTop: theme.spacing.m }}
                onPress={handleSaveAsPreset}
                loading={createPresetMutation.isPending}
              />
            </Card>
          )}

          {fertilizerId && (
            <RHNumberInput
              name="numberOfApplications"
              control={control}
              label={t("forms.labels.amount_unit", { unit: unitLabel })}
              rules={{
                required: {
                  value: true,
                  message: t("forms.validation.required"),
                },
              }}
              error={errors.numberOfApplications?.message}
              float
            />
          )}
        </View>
      </ScrollView>

      <ManagePresetsModal
        ref={managePresetsRef}
        presets={filteredPresets}
        onRename={handleRenamePreset}
        onDelete={handleDeletePreset}
        title={t("presets.manage_fertilizer_presets")}
      />
    </ContentView>
  );
}
