import {
  CropProtectionApplication,
  CropProtectionApplicationMethod,
  CropProtectionApplicationUnit,
} from "@/api/cropProtectionApplications.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { useCropProtectionProductsQuery } from "@/features/crop-protection-products/cropProtectionProduct.hooks";
import { H2 } from "@/theme/Typography";
import { combineDateAndTime } from "@/utils/date";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useCropProtectionApplicationQuery,
  useUpdateCropProtectionApplicationMutation,
} from "./cropProtectionApplications.hooks";
import { EditCropProtectionApplicationScreenProps } from "./navigation/crop-protection-application-routes";

const cropProtectionMethods: CropProtectionApplicationMethod[] = [
  "spraying",
  "misting",
  "broadcasting",
  "injecting",
  "other",
];

type FormValues = {
  date: Date;
  time: Date;
  productId: string;
  method: CropProtectionApplicationMethod | null;
  unit: CropProtectionApplicationUnit;
  amountPerUnit: string;
  numberOfUnits: string;
  additionalNotes?: string;
};

type ProductOption = { label: string; value: string; unit: string };

export function EditCropProtectionApplicationScreen({
  route,
  navigation,
}: EditCropProtectionApplicationScreenProps) {
  const { cropProtectionApplication } = useCropProtectionApplicationQuery(
    route.params.cropProtectionApplicationId,
  );
  const { cropProtectionProducts, isFetched: productsLoaded } =
    useCropProtectionProductsQuery();

  if (!cropProtectionApplication || !productsLoaded) {
    return null;
  }

  return (
    <EditCropProtectionApplicationForm
      cropProtectionApplication={cropProtectionApplication}
      productOptions={
        cropProtectionProducts?.map((product) => ({
          label: product.name,
          value: product.id,
          unit: product.unit ?? "kg",
        })) ?? []
      }
      onSaved={() => navigation.goBack()}
    />
  );
}

// Separate component so the form is initialized with loaded application values
function EditCropProtectionApplicationForm({
  cropProtectionApplication,
  productOptions,
  onSaved,
}: {
  cropProtectionApplication: CropProtectionApplication;
  productOptions: ProductOption[];
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const updateMutation = useUpdateCropProtectionApplicationMutation(onSaved);

  const applicationDateTime = new Date(cropProtectionApplication.dateTime);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: applicationDateTime,
      time: applicationDateTime,
      productId: cropProtectionApplication.productId,
      method: cropProtectionApplication.method,
      unit: cropProtectionApplication.unit,
      amountPerUnit: cropProtectionApplication.amountPerUnit.toString(),
      numberOfUnits: cropProtectionApplication.numberOfUnits.toString(),
      additionalNotes: cropProtectionApplication.additionalNotes ?? undefined,
    },
  });

  const unit = watch("unit");
  const productId = watch("productId");

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

  const unitLabel = unitOptions.find((o) => o.value === unit)?.label ?? "";
  const productUnit =
    productOptions.find((option) => option.value === productId)?.unit ?? "kg";

  // total_amount and amount_per_hectare derive the number of units, as in the add flow
  const hasDerivedNumberOfUnits =
    unit === "total_amount" || unit === "amount_per_hectare";

  function onSubmit(values: FormValues) {
    let numberOfUnits = Number(values.numberOfUnits);
    if (values.unit === "total_amount") {
      numberOfUnits = 1;
    } else if (values.unit === "amount_per_hectare") {
      numberOfUnits = cropProtectionApplication.size / 10000;
    }
    updateMutation.mutate({
      cropProtectionApplicationId: cropProtectionApplication.id,
      input: {
        dateTime: combineDateAndTime(values.date, values.time).toISOString(),
        productId: values.productId,
        method: values.method,
        unit: values.unit,
        amountPerUnit: Number(values.amountPerUnit),
        numberOfUnits,
        additionalNotes: values.additionalNotes,
      },
    });
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmit)}
            disabled={updateMutation.isPending}
            loading={updateMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("crop_protection_applications.edit_application")}
        keyboardAware
      >
        <H2>{t("crop_protection_applications.edit_application")}</H2>

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

          <RHDatePicker
            name="time"
            control={control}
            label={t("forms.labels.time")}
            mode="time"
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.time?.message}
          />

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
            data={productOptions.map(({ label, value }) => ({ label, value }))}
          />

          <RHSelect
            name="method"
            control={control}
            label={t("forms.labels.method")}
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

          {!hasDerivedNumberOfUnits && (
            <RHNumberInput
              name="numberOfUnits"
              control={control}
              label={t("forms.labels.amount_unit", { unit: unitLabel })}
              rules={{
                required: {
                  value: true,
                  message: t("forms.validation.required"),
                },
              }}
              error={errors.numberOfUnits?.message}
              float
            />
          )}

          <RHTextAreaInput
            name="additionalNotes"
            control={control}
            label={t("forms.labels.additional_notes_optional")}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
