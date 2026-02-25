import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { useFertilizersQuery } from "@/features/fertilizers/fertilizers.hooks";
import { H2 } from "@/theme/Typography";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { SelectFertilizerAndDateScreenProps } from "../navigation/fertilizer-application-routes";
import { useCreateFertilizerApplicationStore } from "./fertilizerApplication.store";

type FormValues = {
  date: Date;
  fertilizerId: string;
};

export function SelectFertilizerAndDateScreen({
  navigation,
  route,
}: SelectFertilizerAndDateScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { fertilizers, isFetched: fertilizersLoaded } = useFertilizersQuery();
  const {
    setFertilizerApplication,
    setSelectedFertilizer,
    fertilizerApplication,
    selectedFertilizer,
    reset,
  } = useCreateFertilizerApplicationStore();

  const preselectedFertilizerId = route.params?.fertilizerId;

  useEffect(() => {
    return () => reset();
  }, []);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: fertilizerApplication?.date ?? new Date(),
      fertilizerId: selectedFertilizer?.id ?? preselectedFertilizerId,
    },
  });

  useEffect(() => {
    if (preselectedFertilizerId) {
      setValue("fertilizerId", preselectedFertilizerId);
    }
  }, [preselectedFertilizerId, setValue]);

  function onSubmit(values: FormValues) {
    const fertilizer = fertilizers?.find((f) => f.id === values.fertilizerId);
    if (fertilizer) {
      setSelectedFertilizer(fertilizer);
    }

    setFertilizerApplication({
      date: values.date,
      fertilizerId: values.fertilizerId,
    });

    navigation.navigate("ConfigureFertilizerApplication");
  }

  if (!fertilizersLoaded) {
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
        headerTitleOnScroll={t(
          "fertilizer_application.add_fertilizer_application",
        )}
        keyboardAware
      >
        <H2>{t("fertilizer_application.add_fertilizer_application")}</H2>

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
                data={
                  fertilizers?.map((f) => ({ label: f.name, value: f.id })) ??
                  []
                }
              />
            </View>
            <IonIconButton
              icon="add"
              iconSize={24}
              color="black"
              type="accent"
              onPress={() => navigation.navigate("CreateFertilizer")}
            />
          </View>
        </View>
      </ScrollView>
    </ContentView>
  );
}
