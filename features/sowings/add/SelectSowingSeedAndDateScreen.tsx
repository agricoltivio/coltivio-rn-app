import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { Body, H2 } from "@/theme/Typography";
import { round } from "@/utils/math";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropsQuery } from "../../crops/crops.hooks";
import { useFarmPlotsQuery } from "../../plots/plots.hooks";
import { useSeedsQuery } from "../../seeds/seeds.hooks";
import { SelectSowingSeedAndDateScreenProps } from "../navigation/sowing-routes";
import { useCreateSowingStore } from "./sowing.store";

type FormValues = {
  date: Date;
  seedId?: string | null;
  cropId: string;
};

export function SelectSowingSeedAndDateScreen({
  navigation,
  route,
}: SelectSowingSeedAndDateScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { crops, isFetched: cropsLoaded } = useCropsQuery();
  const { seeds, isFetched: seedsLoaded } = useSeedsQuery();
  const { plots } = useFarmPlotsQuery();
  const {
    sowing,
    setSowing,
    setSelection,
    reset,
    putSowingPlot,
    setPreselectedPlotId,
    setReturnTo,
  } = useCreateSowingStore();

  const preselectedPlotId = route.params?.plotId;
  const returnTo = route.params?.returnTo;
  const returnedSeedId = route.params?.seedId;

  useEffect(() => {
    return () => reset();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Launched with a plot already chosen: preselect it so later steps skip the
  // plot picker and divide screens
  useEffect(() => {
    if (!preselectedPlotId) return;
    const plot = plots?.find((p) => p.id === preselectedPlotId);
    if (!plot) return;
    putSowingPlot({
      plotId: plot.id,
      name: plot.name,
      geometry: plot.geometry,
      size: round(plot.size, 0),
      amount: 0,
    });
    setPreselectedPlotId(plot.id);
    setReturnTo(returnTo);
  }, [preselectedPlotId, plots]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: sowing?.date ?? new Date(),
      seedId: sowing?.seedId,
      cropId: sowing?.cropId ?? route.params?.cropId,
    },
  });

  const seedId = watch("seedId");
  const selectedSeed = seeds?.find((seed) => seed.id === seedId);

  // the crop always comes from the seed
  useEffect(() => {
    if (selectedSeed) {
      setValue("cropId", selectedSeed.cropId, { shouldValidate: true });
    }
  }, [selectedSeed, setValue]);

  // a seed created from this screen is handed back as a route param
  useEffect(() => {
    if (returnedSeedId) {
      setValue("seedId", returnedSeedId);
    }
  }, [returnedSeedId, setValue]);

  function onSubmit(values: FormValues) {
    const crop = crops?.find((c) => c.id === values.cropId);
    if (!crop) return;
    const seed = seeds?.find((s) => s.id === values.seedId);
    setSelection(crop, seed);
    setSowing({
      date: values.date,
      cropId: crop.id,
      seedId: seed?.id,
    });
    navigation.navigate("ConfigureSowing");
  }

  if (!cropsLoaded || !seedsLoaded) {
    return null;
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
        headerTitleOnScroll={t("sowings.add_sowing")}
        keyboardAware
      >
        <H2>{t("sowings.add_sowing")}</H2>

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

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.xs,
            }}
          >
            <View style={{ flex: 1 }}>
              <RHSelect
                name="seedId"
                control={control}
                label={t("sowings.seed_optional")}
                clearable
                data={
                  seeds?.map((seed) => ({
                    label: `${seed.name} · ${seed.crop.name}`,
                    value: seed.id,
                  })) ?? []
                }
              />
            </View>
            <IonIconButton
              icon="add"
              iconSize={24}
              color="black"
              type="accent"
              onPress={() => navigation.navigate("CreateSeed")}
            />
          </View>

          <View style={{ gap: theme.spacing.xs }}>
            <RHSelect
              name="cropId"
              control={control}
              label={t("forms.labels.crop")}
              disabled={!!selectedSeed}
              rules={{
                required: {
                  value: true,
                  message: t("forms.validation.required"),
                },
              }}
              error={errors.cropId?.message}
              data={
                crops?.map((crop) => ({ label: crop.name, value: crop.id })) ??
                []
              }
            />
            {selectedSeed && (
              <Body style={{ color: theme.colors.gray2 }}>
                {t("sowings.crop_from_seed")}
              </Body>
            )}
          </View>
        </View>
      </ScrollView>
    </ContentView>
  );
}
