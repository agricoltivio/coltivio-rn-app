import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import {
  useAnimalByIdQuery,
  useDeleteAnimalMutation,
  useUpdateAnimalMutation,
} from "./animals.hooks";
import { useAvailableEarTagsQuery } from "./earTags.hooks";
import { AnimalForm, AnimalFormValues } from "./AnimalForm";
import { EditAnimalScreenProps } from "./navigation/animals-routes";

export function EditAnimalScreen({ route, navigation }: EditAnimalScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const animalId = route.params!.animalId!;
  const herdIdParam = route.params?.herdId;
  const { animal } = useAnimalByIdQuery(animalId);
  const { availableEarTags } = useAvailableEarTagsQuery();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AnimalFormValues>({
    values: animal
      ? {
          name: animal.name,
          type: animal.type,
          sex: animal.sex,
          dateOfBirth: animal.dateOfBirth
            ? new Date(animal.dateOfBirth)
            : new Date(),
          registered: animal.registered,
          usage: animal.usage,
          categoryOverride: animal.categoryOverride ?? undefined,
          earTagId: animal.earTagId ?? undefined,
          motherId: animal.motherId ?? undefined,
          fatherId: animal.fatherId ?? undefined,
          herdId: herdIdParam ?? animal.herdId ?? undefined,
          dateOfDeath: animal.dateOfDeath
            ? new Date(animal.dateOfDeath)
            : undefined,
          deathReason: animal.deathReason ?? undefined,
        }
      : undefined,
  });

  // Sync herdId from route params when returning from CreateHerd
  useEffect(() => {
    if (herdIdParam) {
      setValue("herdId", herdIdParam, { shouldDirty: true });
    }
  }, [herdIdParam, setValue]);

  const updateAnimalMutation = useUpdateAnimalMutation(() =>
    navigation.goBack(),
  );
  const deleteAnimalMutation = useDeleteAnimalMutation(() =>
    navigation.popTo("Animals"),
  );

  // Build ear tag data including the currently assigned ear tag alongside available ones
  const earTagData = [
    ...(animal?.earTag
      ? [{ label: animal.earTag.number, value: animal.earTag.id }]
      : []),
    ...(availableEarTags?.map((earTag) => ({
      label: earTag.number,
      value: earTag.id,
    })) ?? []),
  ];

  function onSubmit(data: AnimalFormValues) {
    updateAnimalMutation.mutate({
      id: animalId,
      ...data,
      dateOfBirth: data.dateOfBirth?.toISOString(),
      dateOfDeath: data.dateOfDeath?.toISOString(),
    });
  }

  function onDelete() {
    deleteAnimalMutation.mutate(animalId);
  }

  if (!animal) {
    return null;
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <View
            style={{
              flexDirection: "row",
              gap: theme.spacing.s,
            }}
          >
            <Button
              style={{ flexGrow: 1 }}
              type="danger"
              title={t("buttons.delete")}
              onPress={onDelete}
              disabled={
                updateAnimalMutation.isPending || deleteAnimalMutation.isPending
              }
              loading={deleteAnimalMutation.isPending}
            />
            <Button
              style={{ flexGrow: 1 }}
              title={t("buttons.save")}
              onPress={handleSubmit(onSubmit)}
              disabled={
                !isDirty ||
                updateAnimalMutation.isPending ||
                deleteAnimalMutation.isPending
              }
              loading={updateAnimalMutation.isPending}
            />
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={animal.name}
        keyboardAware
      >
        <H2>{animal.name}</H2>
        <AnimalForm
          control={control}
          errors={errors}
          setValue={setValue}
          earTagData={earTagData}
          showDeathFields
          requiresCategoryOverride={animal.requiresCategoryOverride}
          onNavigateToCreateHerd={() =>
            navigation.navigate("CreateHerd", {
              previousScreen: "EditAnimal",
            })
          }
        />
      </ScrollView>
    </ContentView>
  );
}
