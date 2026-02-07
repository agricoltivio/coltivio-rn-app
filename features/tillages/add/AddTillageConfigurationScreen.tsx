import {
  TillagePresetCreateInput,
} from "@/api/tillagePresets.api";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import {
  ManagePresetsModal,
  ManagePresetsModalRef,
} from "@/components/presets/ManagePresetsModal";
import { PresetSelect } from "@/components/presets/PresetSelect";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Body } from "@/theme/Typography";
import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View, Alert } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useCreateTillagePresetMutation,
  useDeleteTillagePresetMutation,
  useTillagePresetsQuery,
  useUpdateTillagePresetMutation,
} from "../tillagePresets.hooks";
import { useAddTillageStore } from "./add-tillage.store";
import { AddTillageConfigurationScreenProps } from "../navigation/tillages-routes";
import { tillageActions, tillageReasons } from "../tillageUtils";

type FormValues = {
  date: Date;
  presetId?: string;
  reason: TillagePresetCreateInput["reason"];
  action: TillagePresetCreateInput["action"];
  customAction?: string;
};

export function AddTillageConfigurationScreen({
  navigation,
}: AddTillageConfigurationScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const managePresetsRef = useRef<ManagePresetsModalRef>(null);

  const { tillagePresets, isFetched: presetsLoaded } = useTillagePresetsQuery();
  const createPresetMutation = useCreateTillagePresetMutation();
  const updatePresetMutation = useUpdateTillagePresetMutation();
  const deletePresetMutation = useDeleteTillagePresetMutation();

  const { setData, data, reset } = useAddTillageStore();

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
      date: data?.date ?? new Date(),
      reason: data?.reason,
      action: data?.action,
      customAction: data?.customAction ?? undefined,
    },
  });

  const presetId = watch("presetId");
  const action = watch("action");

  // When preset is selected, populate fields from preset
  useEffect(() => {
    if (presetId && tillagePresets) {
      const preset = tillagePresets.find((p) => p.id === presetId);
      if (preset) {
        setValue("reason", preset.reason);
        setValue("action", preset.action);
        setValue("customAction", preset.customAction ?? undefined);
      }
    }
  }, [presetId, tillagePresets, setValue]);

  const reasonOptions: { label: string; value: string }[] = tillageReasons.map(
    (reason) => ({
      label: t(`tillages.reasons.${reason}`) as string,
      value: reason,
    }),
  );

  const actionOptions: { label: string; value: string }[] = tillageActions.map(
    (action) => ({
      label: t(`tillages.actions.${action}`) as string,
      value: action,
    }),
  );

  const handleSaveAsPreset = () => {
    const values = watch();
    if (!values.reason || !values.action) {
      return;
    }
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
                reason: values.reason,
                action: values.action,
                customAction: values.customAction,
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
    if (presetId === id) {
      setValue("presetId", undefined);
    }
  };

  function onSubmit(values: FormValues) {
    setData({
      date: values.date,
      reason: values.reason,
      action: values.action,
      customAction: values.action === "custom" ? values.customAction : undefined,
    });

    navigation.navigate("AddTillageSelectPlots");
  }

  if (!presetsLoaded) {
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
        headerTitleOnScroll={t("tillages.add_tillage")}
        keyboardAware
      >
        <H2>{t("tillages.add_tillage")}</H2>

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
                  presets={tillagePresets ?? []}
                  onChange={onChange}
                  onManagePress={() => managePresetsRef.current?.open()}
                  placeholder={t("presets.select_preset")}
                />
              )}
            />

            <View style={{ gap: theme.spacing.s, marginTop: theme.spacing.m }}>
              {/* Reason selector */}
              <RHSelect
                name="reason"
                control={control}
                label={t("forms.labels.reason")}
                rules={{
                  required: {
                    value: true,
                    message: t("forms.validation.required"),
                  },
                }}
                error={errors.reason?.message}
                data={reasonOptions}
              />

              {/* Action selector */}
              <RHSelect
                name="action"
                control={control}
                label={t("forms.labels.action")}
                rules={{
                  required: {
                    value: true,
                    message: t("forms.validation.required"),
                  },
                }}
                error={errors.action?.message}
                data={actionOptions}
              />

              {/* Custom action input (only when action is "custom") */}
              {action === "custom" && (
                <RHTextInput
                  name="customAction"
                  control={control}
                  label={t("tillages.custom_action")}
                  rules={{
                    required: {
                      value: true,
                      message: t("forms.validation.required"),
                    },
                  }}
                  error={errors.customAction?.message}
                />
              )}
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
        </View>
      </ScrollView>

      {/* Manage presets modal */}
      <ManagePresetsModal
        ref={managePresetsRef}
        presets={tillagePresets ?? []}
        onRename={handleRenamePreset}
        onDelete={handleDeletePreset}
        title={t("presets.manage_tillage_presets")}
      />
    </ContentView>
  );
}
