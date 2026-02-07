import { CropProtectionApplicationPresetCreateInput } from "@/api/cropProtectionApplicationPresets.api";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import {
  ManagePresetsModal,
  ManagePresetsModalRef,
} from "@/components/presets/ManagePresetsModal";
import { PresetSelect } from "@/components/presets/PresetSelect";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { useCropProtectionProductsQuery } from "@/features/crop-protection-products/cropProtectionProduct.hooks";
import { H2, Body } from "@/theme/Typography";
import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View, Alert } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useCreateCropProtectionApplicationPresetMutation,
  useDeleteCropProtectionApplicationPresetMutation,
  useCropProtectionApplicationPresetsQuery,
  useUpdateCropProtectionApplicationPresetMutation,
} from "../cropProtectionApplicationPresets.hooks";
import { useAddCropProtectionApplicationStore } from "./cropProtectionApplication.store";
import { AddCropProtectionApplicationConfigurationScreenProps } from "../navigation/crop-protection-application-routes";

type CropProtectionAppUnit = CropProtectionApplicationPresetCreateInput["unit"];
type CropProtectionAppMethod =
  CropProtectionApplicationPresetCreateInput["method"];

const cropProtectionMethods: CropProtectionAppMethod[] = [
  "spraying",
  "misting",
  "broadcasting",
  "injecting",
  "other",
];

type FormValues = {
  date: Date;
  productId: string;
  presetId?: string;
  method: CropProtectionAppMethod;
  unit: CropProtectionAppUnit;
  customUnit?: string;
  amountPerUnit: string;
  numberOfApplications: string;
};

export function AddCropProtectionApplicationConfigurationScreen({
  navigation,
}: AddCropProtectionApplicationConfigurationScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const managePresetsRef = useRef<ManagePresetsModalRef>(null);

  const { cropProtectionProducts, isFetched: productsLoaded } =
    useCropProtectionProductsQuery();
  const { cropProtectionApplicationPresets, isFetched: presetsLoaded } =
    useCropProtectionApplicationPresetsQuery();
  const createPresetMutation =
    useCreateCropProtectionApplicationPresetMutation();
  const updatePresetMutation =
    useUpdateCropProtectionApplicationPresetMutation();
  const deletePresetMutation =
    useDeleteCropProtectionApplicationPresetMutation();

  const {
    setData,
    setSelectedProduct,
    setTotalNumberOfUnits,
    data,
    selectedProduct,
    totalNumberOfUnits,
    reset,
  } = useAddCropProtectionApplicationStore();

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
      productId: data?.productId ?? selectedProduct?.id,
      method: data?.method ?? "spraying",
      unit: "load",
      amountPerUnit: data?.amountPerUnit?.toString() ?? "",
      numberOfApplications: totalNumberOfUnits?.toString() ?? "",
    },
  });

  const presetId = watch("presetId");
  const productId = watch("productId");
  const unit = watch("unit");

  // Get current product to show its unit
  const currentProduct = cropProtectionProducts?.find(
    (p) => p.id === productId,
  );

  // When preset is selected, populate fields
  useEffect(() => {
    if (presetId && cropProtectionApplicationPresets) {
      const preset = cropProtectionApplicationPresets.find(
        (p) => p.id === presetId,
      );
      if (preset) {
        setValue("method", preset.method);
        setValue("unit", preset.unit);
        setValue("customUnit", preset.customUnit ?? undefined);
        setValue("amountPerUnit", preset.amountPerUnit.toString());
      }
    }
  }, [presetId, cropProtectionApplicationPresets, setValue]);

  // Reset preset when product changes
  useEffect(() => {
    setValue("presetId", undefined);
  }, [productId, setValue]);

  const unitOptions: { label: string; value: CropProtectionAppUnit }[] = [
    { label: t("units.long.load"), value: "load" },
    { label: t("fertilizer_application.units.bag"), value: "bag" },
    { label: t("common.total_amount"), value: "total_amount" },
    {
      label: t("fertilizer_application.units.amount_per_hectare"),
      value: "amount_per_hectare",
    },
    { label: t("harvests.labels.unit.other"), value: "other" },
  ];

  const methodOptions: { label: string; value: CropProtectionAppMethod }[] =
    cropProtectionMethods.map((method) => ({
      label: t(`crop_protection_applications.methods.${method}`) as string,
      value: method,
    }));

  const handleSaveAsPreset = () => {
    const values = watch();
    if (!values.method || !values.unit) return;
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
                method: values.method,
                unit: values.unit,
                customUnit:
                  values.unit === "other" ? values.customUnit : undefined,
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
    const product = cropProtectionProducts?.find(
      (p) => p.id === values.productId,
    );
    if (product) {
      setSelectedProduct(product);
    }

    setData({
      date: values.date,
      productId: values.productId,
      method: values.method,
      unit: unit,
      amountPerUnit: Number(values.amountPerUnit),
    });

    setTotalNumberOfUnits(Number(values.numberOfApplications));

    navigation.navigate("AddCropProtectionApplicationSelectPlots");
  }

  if (!productsLoaded || !presetsLoaded) return null;

  const unitLabel = unitOptions.find((o) => o.value === unit)?.label ?? "";
  // Use product unit for the amount label (e.g., "kg / Load")
  const productUnit = currentProduct?.unit ?? "kg";

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.next")}
            onPress={handleSubmit(onSubmit)}
            disabled={cropProtectionProducts?.length === 0}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("crop_protection_applications.add_application")}
        keyboardAware
      >
        <H2>{t("crop_protection_applications.add_application")}</H2>

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

          {cropProtectionProducts?.length === 0 ? (
            <Card
              elevated={false}
              style={{ alignItems: "center", marginBottom: theme.spacing.m }}
            >
              <Body>
                {t(
                  "crop_protection_applications.select_product.no_products_message",
                )}
              </Body>
              <Button
                style={{ marginTop: theme.spacing.m }}
                type="accent"
                fontSize={16}
                title={t("buttons.add")}
                onPress={() =>
                  navigation.navigate("CreateCropProtectionProduct")
                }
              />
            </Card>
          ) : (
            <RHSelect
              name="productId"
              control={control}
              label={t("forms.labels.crop_protection_product")}
              rules={{
                required: {
                  value: true,
                  message: t("forms.validation.required"),
                },
              }}
              error={errors.productId?.message}
              data={
                cropProtectionProducts?.map((p) => ({
                  label: p.name,
                  value: p.id,
                })) ?? []
              }
            />
          )}

          {productId && (
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
                    presets={cropProtectionApplicationPresets ?? []}
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

                {unit === "other" && (
                  <RHTextInput
                    name="customUnit"
                    control={control}
                    label={t("harvests.labels.unit.custom")}
                    rules={{
                      required: {
                        value: true,
                        message: t("forms.validation.required"),
                      },
                    }}
                    error={errors.customUnit?.message}
                  />
                )}

                <RHNumberInput
                  name="amountPerUnit"
                  control={control}
                  label={`${productUnit} / ${unitLabel}`}
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

          {productId && (
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
        presets={cropProtectionApplicationPresets ?? []}
        onRename={handleRenamePreset}
        onDelete={handleDeletePreset}
        title={t("presets.manage_crop_protection_presets")}
      />
    </ContentView>
  );
}
