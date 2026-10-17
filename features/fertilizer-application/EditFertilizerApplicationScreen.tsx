import { toLocalDateString } from "@/utils/date";
import {
  FertilizerApplication,
  FertilizerApplicationMethod,
  FertilizerApplicationUnit,
} from "@/api/fertilizerApplications.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { useFertilizersQuery } from "@/features/fertilizers/fertilizers.hooks";
import { H2 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useFertilizerApplicationQuery,
  useUpdateFertilizerApplicationMutation,
} from "./fertilizerApplications.hooks";
import { fertilizerApplicationMethods } from "./fertilizerApplications.utils";
import { EditFertilizerApplicationScreenProps } from "./navigation/fertilizer-application-routes";

type FormValues = {
  date: Date;
  fertilizerId: string;
  unit: FertilizerApplicationUnit;
  method?: FertilizerApplicationMethod | null;
  amountPerUnit: string;
  numberOfUnits: string;
  additionalNotes?: string;
};

type FertilizerOption = { label: string; value: string; unit: string };

export function EditFertilizerApplicationScreen({
  route,
  navigation,
}: EditFertilizerApplicationScreenProps) {
  const { fertilizerApplication } = useFertilizerApplicationQuery(
    route.params.fertilizerApplicationId,
  );
  const { fertilizers, isFetched: fertilizersLoaded } = useFertilizersQuery();

  if (!fertilizerApplication || !fertilizersLoaded) {
    return null;
  }

  return (
    <EditFertilizerApplicationForm
      fertilizerApplication={fertilizerApplication}
      fertilizerOptions={
        fertilizers?.map((fertilizer) => ({
          label: fertilizer.name,
          value: fertilizer.id,
          unit: fertilizer.unit ?? "kg",
        })) ?? []
      }
      onSaved={() => navigation.goBack()}
    />
  );
}

// Separate component so the form is initialized with loaded application values
function EditFertilizerApplicationForm({
  fertilizerApplication,
  fertilizerOptions,
  onSaved,
}: {
  fertilizerApplication: FertilizerApplication;
  fertilizerOptions: FertilizerOption[];
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const updateMutation = useUpdateFertilizerApplicationMutation(onSaved);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: new Date(fertilizerApplication.date),
      fertilizerId: fertilizerApplication.fertilizerId,
      unit: fertilizerApplication.unit,
      method: fertilizerApplication.method,
      amountPerUnit: fertilizerApplication.amountPerUnit.toString(),
      numberOfUnits: fertilizerApplication.numberOfUnits.toString(),
      additionalNotes: fertilizerApplication.additionalNotes ?? undefined,
    },
  });

  const unit = watch("unit");
  const fertilizerId = watch("fertilizerId");

  const unitOptions: { label: string; value: FertilizerApplicationUnit }[] = [
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

  const unitLabel = unitOptions.find((o) => o.value === unit)?.label ?? "";
  const fertilizerUnit =
    fertilizerOptions.find((option) => option.value === fertilizerId)?.unit ??
    "kg";

  // total_amount and amount_per_hectare derive the number of units, as in the add flow
  const hasDerivedNumberOfUnits =
    unit === "total_amount" || unit === "amount_per_hectare";

  function onSubmit(values: FormValues) {
    let numberOfUnits = Number(values.numberOfUnits);
    if (values.unit === "total_amount") {
      numberOfUnits = 1;
    } else if (values.unit === "amount_per_hectare") {
      numberOfUnits = fertilizerApplication.size / 10000;
    }
    updateMutation.mutate({
      fertilizerApplicationId: fertilizerApplication.id,
      input: {
        date: toLocalDateString(values.date),
        fertilizerId: values.fertilizerId,
        unit: values.unit,
        method: values.method ?? null,
        amountPerUnit: Number(values.amountPerUnit),
        numberOfUnits,
        additionalNotes: values.additionalNotes ?? null,
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
        headerTitleOnScroll={t("fertilizer_application.edit_application")}
        keyboardAware
      >
        <H2>{t("fertilizer_application.edit_application")}</H2>

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
            data={fertilizerOptions.map(({ label, value }) => ({
              label,
              value,
            }))}
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
