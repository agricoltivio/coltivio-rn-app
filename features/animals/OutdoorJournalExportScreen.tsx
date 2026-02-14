import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { ScrollView } from "@/components/views/ScrollView";
import { Card } from "@/components/card/Card";
import { H2, H3 } from "@/theme/Typography";
import { getYearRange } from "@/utils/date";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { OutdoorJournalExportScreenProps } from "./navigation/animals-routes";
import { useDownloadOutdoorJournalReportMutation } from "./reports.hooks";

interface FormValues {
  fromDate: Date;
  toDate: Date;
}

export function OutdoorJournalExportScreen({
  navigation,
}: OutdoorJournalExportScreenProps) {
  const year = new Date().getFullYear();
  const { from, to } = getYearRange(year);
  const theme = useTheme();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      fromDate: from,
      toDate: to,
    },
  });

  const downloadMutation = useDownloadOutdoorJournalReportMutation(
    () => navigation.goBack(),
    () => setError(t("errors.unexpected_retry_later")),
  );

  function onSubmit(data: FormValues) {
    downloadMutation.mutate({
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
            disabled={downloadMutation.isPending}
            loading={downloadMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("reports.outdoor_journal.heading")}
      >
        <H2>{t("reports.outdoor_journal.heading")}</H2>
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
