import { TillagePresetCreateInput } from "@/api/tillagePresets.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import {
  ManagePresetsModal,
  ManagePresetsModalRef,
} from "@/components/presets/ManagePresetsModal";
import { PresetSelect } from "@/components/presets/PresetSelect";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
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
import { ConfigureTillageScreenProps } from "../navigation/tillages-routes";
import { tillageActions } from "../tillageUtils";

type FormValues = {
  presetId?: string;
  action: TillagePresetCreateInput["action"];
  customAction?: string;
  additionalNotes?: string;
};

export function ConfigureTillageScreen({
  navigation,
}: ConfigureTillageScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const managePresetsRef = useRef<ManagePresetsModalRef>(null);

  const { tillagePresets, isFetched: presetsLoaded } = useTillagePresetsQuery();
  const createPresetMutation = useCreateTillagePresetMutation();
  const updatePresetMutation = useUpdateTillagePresetMutation();
  const deletePresetMutation = useDeleteTillagePresetMutation();

  const { setData, data } = useAddTillageStore();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      action: data?.action,
      customAction: data?.customAction ?? undefined,
      additionalNotes: data?.additionalNotes ?? undefined,
    },
  });

  const presetId = watch("presetId");
  const action = watch("action");

  // When preset is selected, populate fields from preset
  useEffect(() => {
    if (presetId && tillagePresets) {
      const preset = tillagePresets.find((p) => p.id === presetId);
      if (preset) {
        setValue("action", preset.action);
        setValue("customAction", preset.customAction ?? undefined);
      }
    }
  }, [presetId, tillagePresets, setValue]);

  const actionOptions: { label: string; value: string }[] = tillageActions.map(
    (action) => ({
      label: t(`tillages.actions.${action}`) as string,
      value: action,
    }),
  );

  const handleSaveAsPreset = () => {
    const values = watch();
    if (!values.action) {
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
      action: values.action,
      customAction:
        values.action === "custom" ? values.customAction : undefined,
      additionalNotes: values.additionalNotes,
    });

    navigation.navigate("SelectTillagePlots");
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
        headerTitleOnScroll={t("tillages.tillage_configuration")}
        keyboardAware
      >
        <H2>{t("tillages.tillage_configuration")}</H2>

        <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.l }}>
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

          <RHTextAreaInput
            name="additionalNotes"
            control={control}
            label={t("forms.labels.additional_notes_optional")}
          />

          <Button
            title={t("presets.save_as_preset")}
            type="accent"
            onPress={handleSaveAsPreset}
            loading={createPresetMutation.isPending}
          />
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
