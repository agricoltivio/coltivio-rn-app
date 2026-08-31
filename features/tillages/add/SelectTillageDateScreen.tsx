import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { ScrollView } from "@/components/views/ScrollView";
import { useFarmPlotsQuery } from "@/features/plots/plots.hooks";
import { round } from "@/utils/math";
import { H2 } from "@/theme/Typography";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { SelectTillageDateScreenProps } from "../navigation/tillages-routes";
import { useAddTillageStore } from "./add-tillage.store";

type FormValues = {
  date: Date;
};

export function SelectTillageDateScreen({
  navigation,
  route,
}: SelectTillageDateScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { plots } = useFarmPlotsQuery();
  const { setData, data, reset, putPlot, setPreselectedPlotId, setReturnTo } =
    useAddTillageStore();

  const preselectedPlotId = route.params?.plotId;
  const returnTo = route.params?.returnTo;

  // Reset store on mount
  useEffect(() => {
    return () => reset();
  }, []);

  // Launched with a plot already chosen (plot details drawer, or the FAB on the
  // plot-scoped tillages list) — preselect it in the store so later steps can skip
  // the plot-picker screen.
  useEffect(() => {
    if (!preselectedPlotId) return;
    const plot = plots?.find((p) => p.id === preselectedPlotId);
    if (!plot) return;
    putPlot({
      plotId: plot.id,
      name: plot.name,
      geometry: plot.geometry,
      size: round(plot.size, 0),
    });
    setPreselectedPlotId(plot.id);
    setReturnTo(returnTo);
  }, [preselectedPlotId, plots]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: data?.date ?? new Date(),
    },
  });

  function onSubmit(values: FormValues) {
    setData({
      date: values.date,
    });

    navigation.navigate("ConfigureTillage");
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
        headerTitleOnScroll={t("tillages.add_tillage")}
        keyboardAware
      >
        <H2>{t("tillages.add_tillage")}</H2>

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
        </View>
      </ScrollView>
    </ContentView>
  );
}
