import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { usePlotByIdQuery, useUpdatePlotMutation } from "./plots.hooks";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { Button } from "@/components/buttons/Button";
import { useTranslation } from "react-i18next";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHSelect } from "@/components/select/RHSelect";
import { getUsageCodeSelectData } from "./usage-codes";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";

type EditPlotFormValues = {
  name: string;
  additionalNotes?: string;
  localId?: string;
  usage?: string;
  cuttingDate?: Date;
  size: string;
};

export function EditPlotScreen({
  route,
  navigation,
}: {
  route: { params: { plotId: string } };
  navigation: { goBack: () => void; navigate: (...args: unknown[]) => void };
}) {
  const { t } = useTranslation();
  const { plotId } = route.params;
  const theme = useTheme();
  const { plot } = usePlotByIdQuery(plotId);

  const updatePlotMutation = useUpdatePlotMutation(
    () => navigation.goBack(),
    (error) => console.error(error),
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditPlotFormValues>({
    values: plot
      ? {
          name: plot.name,
          additionalNotes: plot.additionalNotes ?? undefined,
          size: plot.size.toString(),
          usage: plot.usage?.toString(),
          localId: plot.localId ?? undefined,
          cuttingDate: plot.cuttingDate
            ? new Date(plot.cuttingDate)
            : undefined,
        }
      : undefined,
  });

  if (!plot) {
    return null;
  }

  function onSubmit({ size, usage, ...rest }: EditPlotFormValues) {
    updatePlotMutation.mutate({
      plotId,
      data: {
        ...rest,
        size: Number(size),
        usage: Number(usage),
        cuttingDate: rest.cuttingDate?.toISOString() ?? null,
      },
    });
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <View style={{ flexDirection: "row", gap: theme.spacing.xs }}>
            <Button
              style={{ flex: 1 }}
              type="danger"
              title={t("buttons.delete")}
              onPress={() =>
                navigation.navigate("DeletePlot", { plotId, name: plot!.name })
              }
              disabled={updatePlotMutation.isPending}
            />
            <Button
              style={{ flex: 1 }}
              type="primary"
              title={t("buttons.save")}
              onPress={handleSubmit(onSubmit)}
              disabled={!isDirty || updatePlotMutation.isPending}
              loading={updatePlotMutation.isPending}
            />
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={plot?.name}
        keyboardAware
      >
        <H2>{t("plots.plot_name", { name: plot?.name })}</H2>

        <View
          style={{ gap: theme.spacing.xs, flex: 1, marginTop: theme.spacing.m }}
        >
          <RHTextInput
            name="name"
            control={control}
            label={t("forms.labels.name")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.name?.message}
          />
          <RHTextInput
            name="localId"
            control={control}
            label={t("forms.labels.local_id_optional")}
          />
          <RHSelect
            name="usage"
            data={getUsageCodeSelectData(t)}
            enableSearch
            control={control}
            label={t("forms.labels.usage_optional")}
          />
          <RHDatePicker
            name="cuttingDate"
            control={control}
            mode="date"
            label={t("forms.labels.cutting_date_optional")}
          />
          <RHNumberInput
            name="size"
            control={control}
            label={t("forms.labels.size_m2")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.size?.message}
          />
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
