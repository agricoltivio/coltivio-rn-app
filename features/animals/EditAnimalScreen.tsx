import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/features/user/users.hooks";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { Switch } from "@/components/inputs/Switch";
import { Ionicons } from "@expo/vector-icons";
import { ListItem } from "@/components/list/ListItem";
import {
  useAnimalByIdQuery,
  useDeleteAnimalMutation,
  useSetCustomOutdoorJournalCategoriesMutation,
  useUpdateAnimalMutation,
} from "./animals.hooks";
import { useAvailableEarTagsQuery } from "./earTags.hooks";
import { AnimalForm, AnimalFormValues } from "./AnimalForm";
import { EditAnimalScreenProps } from "./navigation/animals-routes";

export function EditAnimalScreen({ route, navigation }: EditAnimalScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = usePermissions();
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

  const [customCategoryEnabled, setCustomCategoryEnabled] = useState(
    (animal?.customOutdoorJournalCategories.length ?? 0) > 0,
  );

  // Always sync toggle with actual animal data — covers initial load,
  // returning from ManageAnimalCategories (with or without saving),
  // and query refetches after mutations
  useEffect(() => {
    if (animal) {
      setCustomCategoryEnabled(
        animal.customOutdoorJournalCategories.length > 0,
      );
    }
  }, [animal]);

  const updateAnimalMutation = useUpdateAnimalMutation(() =>
    navigation.goBack(),
  );
  const deleteAnimalMutation = useDeleteAnimalMutation(() =>
    navigation.popTo("Animals"),
  );
  const clearCategoriesMutation =
    useSetCustomOutdoorJournalCategoriesMutation();

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
      dateOfDeath: data.dateOfDeath ? data.dateOfDeath.toISOString() : null,
      // clear deathReason when death date is removed
      deathReason: data.dateOfDeath ? (data.deathReason ?? null) : null,
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
            {canWrite("animals") && (
              <Button
                style={{ flexGrow: 1 }}
                type="danger"
                title={t("buttons.delete")}
                onPress={onDelete}
                disabled={
                  updateAnimalMutation.isPending ||
                  deleteAnimalMutation.isPending
                }
                loading={deleteAnimalMutation.isPending}
              />
            )}
            {canWrite("animals") && (
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
            )}
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
          onNavigateToCreateHerd={() =>
            navigation.navigate("CreateHerd", {
              previousScreen: "EditAnimal",
            })
          }
        />

        {/* Custom animal category section */}
        <View style={{ marginTop: theme.spacing.l }}>
          <H3>{t("animals.outdoor_journal_category")}</H3>
          <Subtitle style={{ marginTop: theme.spacing.xs }}>
            {t("animals.outdoor_journal_category_info")}
          </Subtitle>
          <Switch
            style={{ marginTop: theme.spacing.s }}
            value={customCategoryEnabled}
            onChange={() => {
              if (customCategoryEnabled) {
                // Toggling OFF: confirm if entries exist
                if (
                  animal &&
                  animal.customOutdoorJournalCategories.length > 0
                ) {
                  Alert.alert(
                    t("animals.custom_animal_category"),
                    t("animals.delete_custom_categories_confirm"),
                    [
                      { text: t("buttons.cancel"), style: "cancel" },
                      {
                        text: t("buttons.confirm"),
                        style: "destructive",
                        onPress: () => {
                          clearCategoriesMutation.mutate({
                            animalId,
                            input: { entries: [] },
                          });
                          setCustomCategoryEnabled(false);
                        },
                      },
                    ],
                  );
                } else {
                  setCustomCategoryEnabled(false);
                }
              } else {
                // Don't eagerly toggle ON — navigate to manage screen and let
                // the [animal] effect sync the toggle when entries are saved
                navigation.navigate("ManageAnimalCategories", { animalId });
              }
            }}
            label={t("animals.custom_category")}
          />
          {customCategoryEnabled &&
            animal &&
            animal.customOutdoorJournalCategories.length > 0 && (
              <View
                style={{
                  marginTop: theme.spacing.s,
                  borderRadius: 10,
                  overflow: "hidden",
                  backgroundColor: theme.colors.white,
                }}
              >
                <ListItem
                  style={{ paddingVertical: 5 }}
                  onPress={() =>
                    navigation.navigate("ManageAnimalCategories", { animalId })
                  }
                >
                  <ListItem.Content>
                    <ListItem.Title>
                      {t("animals.manage_categories")}
                    </ListItem.Title>
                    <ListItem.Body>
                      {(() => {
                        const today = new Date();
                        const active =
                          animal.customOutdoorJournalCategories.find(
                            (entry) => {
                              const start = new Date(entry.startDate);
                              const end = entry.endDate
                                ? new Date(entry.endDate)
                                : null;
                              return start <= today && (!end || end >= today);
                            },
                          );
                        return active
                          ? active.category
                          : t("animals.no_active_category");
                      })()}
                    </ListItem.Body>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
              </View>
            )}
        </View>
      </ScrollView>
    </ContentView>
  );
}
