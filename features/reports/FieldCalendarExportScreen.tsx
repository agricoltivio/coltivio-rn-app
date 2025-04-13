import { Button } from "@/components/buttons/Button";
import { ContentView } from "@/components/containers/ContentView";
import { getYearRange } from "@/utils/date";
import { useGeneratePlotsReportMutation } from "./reports.hooks";
import { FieldCalendarExportScreenProps } from "@/navigation/rootStackTypes";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { GenerateFieldCalendarReportInput } from "@/api/reports.api";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { useTranslation } from "react-i18next";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3 } from "@/theme/Typography";
import { View } from "react-native";
import { RHSwitch } from "@/components/inputs/RHSwitch";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { useTheme } from "styled-components/native";
import { Card } from "@/components/card/Card";

type FormValues = Omit<
  GenerateFieldCalendarReportInput,
  "fromDate" | "toDate"
> & {
  fromDate: Date;
  toDate: Date;
};

export function FieldCalendarExportScreen({
  navigation,
  route,
}: FieldCalendarExportScreenProps) {
  const year = new Date().getFullYear();
  const { from, to } = getYearRange(year);
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      fromDate: from,
      toDate: to,
      generateCropRotations: true,
      generateTillages: true,
      generateFertilizerApplications: true,
      generateCropProtectionApplications: true,
      generateHarvests: true,
    },
  });
  const [error, setError] = useState<string | null>(null);

  const generateReportMutation = useGeneratePlotsReportMutation(
    () => {
      navigation.navigate("FieldCalendarExportSuccess");
    },
    (error) => {
      console.error(error);
      setError(t("errors.unexpected_retry_later"));
    }
  );

  function onSubmit(data: FormValues) {
    generateReportMutation.mutate({
      ...data,
      fromDate: data.fromDate.toISOString(),
      toDate: data.toDate.toISOString(),
    });
  }
  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.export")}
            onPress={handleSubmit(onSubmit)}
            disabled={generateReportMutation.isPending}
            loading={generateReportMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("reports.field_calendar.heading")}
      >
        <H2>{t("reports.field_calendar.heading")}</H2>
        <H3>{t("reports.field_calendar.subheading")}</H3>
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
          <H3>{t("reports.field_calendar.select_sections")}</H3>
          <RHSwitch
            control={control}
            name="generateCropRotations"
            label={t("crop_rotations.crop_rotation")}
          />
          <RHSwitch
            control={control}
            name="generateTillages"
            label={t("tillages.tillage")}
          />
          <RHSwitch
            control={control}
            name="generateFertilizerApplications"
            label={t("fertilizer_application.fertilizer_application")}
          />
          <RHSwitch
            control={control}
            name="generateCropProtectionApplications"
            label={t("crop_protection_applications.crop_protection")}
          />
          <RHSwitch
            control={control}
            name="generateHarvests"
            label={t("harvests.harvest")}
          />
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
