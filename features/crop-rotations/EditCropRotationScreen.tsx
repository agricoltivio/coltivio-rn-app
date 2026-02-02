import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHSelect } from "@/components/select/RHSelect";
import { Switch } from "@/components/inputs/Switch";
import { ScrollView } from "@/components/views/ScrollView";
import { EditCropRotationScreenProps } from "./navigation/crop-rotations-routes";
import { H2, H3 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropsQuery } from "../crops/crops.hooks";
import {
  useCropRotationQuery,
  useDeleteCropRotationMutation,
  useUpdateCropRotationMutation,
} from "./crop-rotations.hooks";
import { useTranslation } from "react-i18next";
import { INFINITE_DATE, isInfiniteDate } from "@/utils/date";

type FormValues = {
  cropId: string;
  fromDate: Date;
  toDate?: Date | null;
  sowingDate?: Date | null;
};

export function EditCropRotationScreen({
  navigation,
  route,
}: EditCropRotationScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plotName, rotationId } = route.params;
  const { crops } = useCropsQuery();
  const { cropRotation } = useCropRotationQuery(rotationId);

  const updatePlotCropRotationMutation = useUpdateCropRotationMutation(() =>
    navigation.goBack(),
  );
  const deletePlotCropRotationMutation = useDeleteCropRotationMutation(() =>
    navigation.goBack(),
  );

  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { isDirty, errors },
  } = useForm<FormValues>({
    values: cropRotation
      ? {
          cropId: cropRotation.cropId,
          fromDate: new Date(cropRotation.fromDate),
          // If permanent, don't put the infinite date into the form — use null
          toDate: cropRotation.toDate ? new Date(cropRotation.toDate) : null,
          sowingDate: cropRotation.sowingDate
            ? new Date(cropRotation.sowingDate)
            : null,
        }
      : undefined,
  });
  const toDate = watch("toDate");
  const isPermanent = isInfiniteDate(toDate || new Date());

  function onSubmit({ cropId, fromDate, toDate, sowingDate }: FormValues) {
    updatePlotCropRotationMutation.mutate({
      rotationId,
      cropId,
      fromDate: fromDate.toISOString(),
      toDate: toDate?.toISOString(),
      sowingDate: sowingDate?.toISOString(),
    });
  }

  function onDelete() {
    deletePlotCropRotationMutation.mutate({ rotationId });
  }

  if (!cropRotation) {
    return null;
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer
          style={{ flexDirection: "row", gap: theme.spacing.s }}
        >
          <Button
            onPress={onDelete}
            title={t("buttons.delete")}
            type="danger"
            style={{ flexGrow: 1 }}
            disabled={
              updatePlotCropRotationMutation.isPending ||
              deletePlotCropRotationMutation.isPending
            }
          />
          <Button
            onPress={handleSubmit(onSubmit)}
            title={t("buttons.save")}
            style={{ flexGrow: 1 }}
            disabled={
              (!isDirty && updatePlotCropRotationMutation.isPending) ||
              deletePlotCropRotationMutation.isPending
            }
            loading={
              updatePlotCropRotationMutation.isPending ||
              deletePlotCropRotationMutation.isPending
            }
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        keyboardAware
        showHeaderOnScroll
        headerTitleOnScroll={`${plotName ? `${t("plots.plot_name", { name: plotName })} - ${cropRotation?.crop.name}` : cropRotation?.crop.name}`}
      >
        <H2>{t("crops.crop")}</H2>
        <H3>
          {`${plotName ? `${t("plots.plot_name", { name: plotName })} - ` : ""}`}
          {cropRotation?.crop.name}
        </H3>
        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.s }}>
          <RHSelect
            name="cropId"
            control={control}
            label={t("crops.crop")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.cropId?.message}
            data={
              crops?.map((crop) => ({
                label: crop.name,
                value: crop.id,
              })) ?? []
            }
          />
          <RHDatePicker
            name="fromDate"
            control={control}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.fromDate?.message}
            label={t("forms.labels.from")}
            mode="date"
          />
          {!isPermanent && (
            <RHDatePicker
              name="toDate"
              control={control}
              label={t("forms.labels.to")}
              mode="date"
            />
          )}
          <Switch
            style={{ marginTop: theme.spacing.m }}
            label={t("forms.labels.permanent")}
            value={isPermanent}
            onChange={(event) => {
              const newPermanent = event.nativeEvent.value;
              if (!newPermanent) {
                // When toggling off permanent, set toDate to fromDate
                setValue("toDate", getValues("fromDate"), {
                  shouldDirty: true,
                });
              } else {
                setValue("toDate", INFINITE_DATE, { shouldDirty: true });
              }
            }}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
