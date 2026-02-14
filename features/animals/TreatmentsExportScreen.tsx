import { AnimalType } from "@/api/animals.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHSwitch } from "@/components/inputs/RHSwitch";
import { ScrollView } from "@/components/views/ScrollView";
import { Card } from "@/components/card/Card";
import { H2, H3 } from "@/theme/Typography";
import { getYearRange } from "@/utils/date";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalsQuery } from "./animals.hooks";
import { TreatmentsExportScreenProps } from "./navigation/animals-routes";
import { useDownloadTreatmentsReportMutation } from "./reports.hooks";

const ALL_ANIMAL_TYPES: AnimalType[] = [
  "cow",
  "goat",
  "sheep",
  "horse",
  "donkey",
  "pig",
  "deer",
];

interface FormValues {
  fromDate: Date;
  toDate: Date;
  // Dynamic animal type switches
  cow: boolean;
  goat: boolean;
  sheep: boolean;
  horse: boolean;
  donkey: boolean;
  pig: boolean;
  deer: boolean;
}

export function TreatmentsExportScreen({
  navigation,
}: TreatmentsExportScreenProps) {
  const year = new Date().getFullYear();
  const { from, to } = getYearRange(year);
  const theme = useTheme();
  const { t } = useTranslation();
  const { animals } = useAnimalsQuery();
  const [error, setError] = useState<string | null>(null);

  // Determine which animal types the user actually has
  const usedAnimalTypes = useMemo(() => {
    if (!animals) return [];
    const types = new Set(animals.map((a) => a.type));
    return ALL_ANIMAL_TYPES.filter((type) => types.has(type));
  }, [animals]);

  const defaultAnimalTypeSwitches = Object.fromEntries(
    ALL_ANIMAL_TYPES.map((type) => [type, true]),
  ) as Record<AnimalType, boolean>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      fromDate: from,
      toDate: to,
      ...defaultAnimalTypeSwitches,
    },
  });

  const downloadMutation = useDownloadTreatmentsReportMutation(
    () => navigation.goBack(),
    () => setError(t("errors.unexpected_retry_later")),
  );

  function onSubmit(data: FormValues) {
    const selectedTypes = ALL_ANIMAL_TYPES.filter((type) => data[type]);
    downloadMutation.mutate({
      fromDate: data.fromDate.toISOString(),
      toDate: data.toDate.toISOString(),
      animalTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
    });
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.export")}
            onPress={handleSubmit(onSubmit)}
            disabled={downloadMutation.isPending}
            loading={downloadMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("reports.treatments.heading")}
      >
        <H2>{t("reports.treatments.heading")}</H2>
        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.s }}>
          <RHDatePicker
            control={control}
            name="fromDate"
            mode="date"
            label={t("forms.labels.from")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.fromDate?.message}
          />
          <RHDatePicker
            control={control}
            name="toDate"
            mode="date"
            label={t("forms.labels.to")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.toDate?.message}
          />
        </View>
        <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.m }}>
          <H3>{t("reports.treatments.select_animal_types")}</H3>
          {usedAnimalTypes.map((type) => (
            <RHSwitch
              key={type}
              control={control}
              name={type}
              label={t(`animals.animal_types.${type}`)}
            />
          ))}
        </View>
        {error ? (
          <Card
            style={{
              backgroundColor: theme.colors.danger,
              marginTop: theme.spacing.m,
            }}
          >
            <H3 style={{ color: theme.colors.white }}>{error}</H3>
          </Card>
        ) : null}
      </ScrollView>
    </ContentView>
  );
}
