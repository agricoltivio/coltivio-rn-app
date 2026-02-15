import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { InsetsProps } from "@/constants/Screen";
import { H2 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled, { useTheme } from "styled-components/native";
import { useAddPlotStore } from "./add-plots.store";
import { AddPlotSummaryScreenProps } from "./navigation/plots-routes";
import { useCreatePlotMutation } from "./plots.hooks";
import { getUsageCodeSelectData } from "./usage-codes";

type AddPlotFormValues = {
  name: string;
  additionalNotes?: string;
  localId?: string;
  usage?: string;
  cuttingDate?: Date;
  size: string;
  cropId: string;
};

export function AddPlotSummaryScreen({
  navigation,
}: AddPlotSummaryScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { data } = useAddPlotStore();
  const { geometry, size, localId, cuttingDate, usage } = data!;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddPlotFormValues>({
    defaultValues: {
      size: size.toString(),
      localId,
      usage: usage?.toString(),
      cuttingDate: cuttingDate ? new Date(cuttingDate) : undefined,
    },
  });

  const createPlotMutation = useCreatePlotMutation(
    () =>
      navigation.reset({
        index: 1,
        routes: [{ name: "Home" }, { name: "PlotsMap" }],
      }),
    (error) => console.log(error),
  );

  function onSubmit({ size, usage, cuttingDate, ...rest }: AddPlotFormValues) {
    createPlotMutation.mutate({
      ...rest,
      geometry,
      usage: Number(usage),
      size: Number(size),
      cuttingDate: cuttingDate?.toISOString(),
    });
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            type="primary"
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmit)}
            disabled={createPlotMutation.isPending}
            loading={createPlotMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("plots.add.summary.heading")}
        keyboardAware
      >
        <H2>{t("plots.add.summary.heading")}</H2>
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
          <Button
            title={t("crops.new_crop")}
            onPress={() => navigation.navigate("CreateCrop")}
            type="accent"
            style={{ marginBottom: theme.spacing.m }}
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
