import { toLocalDateString } from "@/utils/date";
import { Alert } from "react-native";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { useCreateAnimalMutation } from "./animals.hooks";
import { AnimalForm, AnimalFormValues } from "./AnimalForm";
import { DrawerWeight } from "./AnimalWeightDrawer";
import { useCreateAnimalWeightMutation } from "./breeding.hooks";
import { CreateAnimalScreenProps } from "./navigation/animals-routes";

export function CreateAnimalScreen({
  route,
  navigation,
}: CreateAnimalScreenProps) {
  const { t } = useTranslation();
  const motherId = route.params?.motherId;
  const fatherId = route.params?.fatherId;
  const herdId = route.params?.herdId;
  const animalType = route.params?.animalType;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AnimalFormValues>({
    defaultValues: {
      dateOfBirth: new Date(),
      registered: false,
      usage: "other",
      type: animalType,
      motherId: motherId ?? undefined,
      fatherId: fatherId ?? undefined,
      herdId: herdId ?? undefined,
    },
  });

  // Sync herdId from route params when returning from CreateHerd
  useEffect(() => {
    if (herdId) {
      setValue("herdId", herdId, { shouldDirty: true });
    }
  }, [herdId, setValue]);

  // Weight entered before the animal exists, saved as its first weight entry after creating it
  const [pendingWeight, setPendingWeight] = useState<DrawerWeight | null>(null);
  const createWeightMutation = useCreateAnimalWeightMutation();

  const createAnimalMutation = useCreateAnimalMutation(
    (animal) => {
      if (!pendingWeight) {
        navigation.goBack();
        return;
      }
      createWeightMutation.mutate(
        {
          animalId: animal.id,
          input: {
            date: toLocalDateString(pendingWeight.date),
            weightKg: pendingWeight.weightKg,
          },
        },
        // The animal exists either way, a failed weight can be added again on the animal
        { onSettled: () => navigation.goBack() },
      );
    },
    // A new animal has no herd history to overlap, so any failure is unexpected
    () => Alert.alert(t("common.error"), t("common.unknown_error")),
  );

  function onSubmit(data: AnimalFormValues) {
    createAnimalMutation.mutate({
      ...data,
      dateOfBirth: toLocalDateString(data.dateOfBirth),
      dateOfDeath: data.dateOfDeath
        ? toLocalDateString(data.dateOfDeath)
        : undefined,
      color: data.color?.trim() || null,
      notes: data.notes?.trim() || null,
      herdEffectiveDate:
        data.herdId && data.herdEffectiveDate
          ? toLocalDateString(data.herdEffectiveDate)
          : null,
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
            disabled={
              !isDirty ||
              createAnimalMutation.isPending ||
              createWeightMutation.isPending
            }
            loading={
              createAnimalMutation.isPending || createWeightMutation.isPending
            }
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("animals.new_animal")}
        keyboardAware
      >
        <H2>{t("animals.new_animal")}</H2>
        <AnimalForm
          control={control}
          errors={errors}
          setValue={setValue}
          currentWeight={pendingWeight}
          onPendingWeightChange={setPendingWeight}
          onNavigateToCreateHerd={() =>
            navigation.navigate("CreateHerd", {
              previousScreen: "CreateAnimal",
            })
          }
        />
      </ScrollView>
    </ContentView>
  );
}
