import { Button } from "@/components/buttons/Button";
import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useAnimalByIdQuery,
  useDeleteAnimalMutation,
  useUpdateAnimalMutation,
} from "./animals.hooks";
import { usePermissions } from "@/features/user/users.hooks";
import { AnimalDetailsScreenProps } from "./navigation/animals-routes";
import { formatLocalizedDate, parseDateOnly } from "@/utils/date";
import { Switch } from "@/components/inputs/Switch";
import { useAnimalHeatsQuery, useAnimalWeightsQuery } from "./breeding.hooks";
import { AnimalWeightChartDrawer } from "./AnimalWeightField";
import { useAnimalParasiteHistoryQuery } from "./parasite-checks.hooks";

export function AnimalDetailsScreen({
  route,
  navigation,
}: AnimalDetailsScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const animalId = route.params.animalId;
  const { animal } = useAnimalByIdQuery(animalId);
  const { weights } = useAnimalWeightsQuery(animalId);
  const isFemale = animal?.sex === "female";
  const { heats } = useAnimalHeatsQuery(animalId, isFemale);
  const { history: parasiteHistory } = useAnimalParasiteHistoryQuery(animalId);

  const deleteAnimalMutation = useDeleteAnimalMutation(() =>
    navigation.goBack(),
  );

  // Drawer with the weight timeline chart
  const weightChartSheetRef = useRef<BottomSheetModal>(null);
  const updateRegisteredMutation = useUpdateAnimalMutation();

  // Combine children from both mother and father relationships
  const children = useMemo(() => {
    if (!animal) return [];
    return [
      ...(animal.childrenAsMother ?? []),
      ...(animal.childrenAsFather ?? []),
    ];
  }, [animal]);

  function onDelete() {
    deleteAnimalMutation.mutate(animalId);
  }

  if (!animal) {
    return null;
  }

  // Summaries of the sections
  const lastMatedHeat = (heats ?? [])
    .filter((heat) => heat.mated)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  // One line each: the expected birth if there is one, otherwise the last mating
  const heatsSummary = lastMatedHeat?.expectedBirthDate
    ? `${t("breeding.expected_birth")}: ${formatLocalizedDate(
        parseDateOnly(lastMatedHeat.expectedBirthDate),
        locale,
      )}`
    : lastMatedHeat
      ? t("breeding.last_mated", {
          date: formatLocalizedDate(parseDateOnly(lastMatedHeat.date), locale),
        })
      : t("breeding.n_heats", { count: heats?.length ?? 0 });
  const treatmentsSummary = t("treatments.n_treatments", {
    count: animal.treatments.length,
  });
  const parasiteChecks = parasiteHistory?.checks ?? [];
  const latestParasiteCheck = [...parasiteChecks].sort((a, b) =>
    b.date.localeCompare(a.date),
  )[0];
  const parasiteSummary = [
    t("parasite_checks.n_checks", { count: parasiteChecks.length }),
    latestParasiteCheck
      ? t("common.last_value", {
          value: formatLocalizedDate(
            new Date(latestParasiteCheck.date),
            locale,
          ),
        })
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const formattedDateOfBirth = animal.dateOfBirth
    ? new Date(animal.dateOfBirth).toLocaleDateString()
    : "-";

  const formattedDateOfDeath = animal.dateOfDeath
    ? new Date(animal.dateOfDeath).toLocaleDateString()
    : null;

  return (
    <ContentView
      headerVisible
      footerComponent={
        canWrite("animals") ? (
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
                disabled={deleteAnimalMutation.isPending}
                loading={deleteAnimalMutation.isPending}
              />
              <Button
                style={{ flexGrow: 1 }}
                title={t("buttons.edit")}
                onPress={() => navigation.navigate("EditAnimal", { animalId })}
              />
            </View>
          </BottomActionContainer>
        ) : undefined
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={animal.name}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <H2>{animal.name}</H2>
          <MaterialCommunityIconButton
            type="accent"
            icon="sitemap"
            iconSize={22}
            color={theme.colors.primary}
            onPress={() =>
              navigation.navigate("FamilyTree", {
                animalType: animal.type,
                focusedAnimalId: animal.id,
              })
            }
          />
        </View>

        {/* Basic info */}
        <View
          style={{
            marginTop: theme.spacing.m,
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: theme.colors.white,
          }}
        >
          <ListItem style={{ paddingVertical: 5 }}>
            <ListItem.Content>
              <ListItem.Title>{t("forms.labels.type")}</ListItem.Title>
              <ListItem.Body>
                {t(`animals.animal_types.${animal.type}`)}
              </ListItem.Body>
            </ListItem.Content>
          </ListItem>
          <ListItem style={{ paddingVertical: 5 }}>
            <ListItem.Content>
              <ListItem.Title>{t("ear_tags.ear_tag")}</ListItem.Title>
              <ListItem.Body>
                {animal.earTag?.number ?? t("ear_tags.no_ear_tag")}
              </ListItem.Body>
            </ListItem.Content>
          </ListItem>
          <ListItem style={{ paddingVertical: 5 }}>
            <ListItem.Content>
              <ListItem.Title>{t("forms.labels.sex")}</ListItem.Title>
              <ListItem.Body>{t(`animals.sex.${animal.sex}`)}</ListItem.Body>
            </ListItem.Content>
          </ListItem>
          <ListItem style={{ paddingVertical: 5 }}>
            <ListItem.Content>
              <ListItem.Title>{t("animals.date_of_birth")}</ListItem.Title>
              <ListItem.Body>{formattedDateOfBirth}</ListItem.Body>
            </ListItem.Content>
          </ListItem>
          <ListItem style={{ paddingVertical: 5 }}>
            <ListItem.Content>
              <ListItem.Title>{t("animals.registered")}</ListItem.Title>
            </ListItem.Content>
            <Switch
              value={animal.registered}
              disabled={!canWrite("animals")}
              onChange={() =>
                updateRegisteredMutation.mutate({
                  id: animalId,
                  registered: !animal.registered,
                })
              }
            />
          </ListItem>
          <ListItem style={{ paddingVertical: 5 }}>
            <ListItem.Content>
              <ListItem.Title>{t("animals.usage")}</ListItem.Title>
              <ListItem.Body>
                {t(`animals.usage_types.${animal.usage}`)}
              </ListItem.Body>
            </ListItem.Content>
          </ListItem>
          <ListItem style={{ paddingVertical: 5 }}>
            <ListItem.Content>
              <ListItem.Title>{t("breeding.weight")}</ListItem.Title>
              <ListItem.Body>
                {animal.latestWeight
                  ? `${animal.latestWeight.weightKg} kg (${formatLocalizedDate(
                      parseDateOnly(animal.latestWeight.date),
                      locale,
                    )})`
                  : t("breeding.no_weight")}
              </ListItem.Body>
            </ListItem.Content>
            {(weights?.length ?? 0) >= 2 && (
              // ListItem stretches its children to the row height, centering keeps the button square
              <View
                style={{
                  justifyContent: "center",
                  paddingRight: theme.spacing.m,
                }}
              >
                <MaterialCommunityIconButton
                  type="accent"
                  icon="chart-line"
                  iconSize={20}
                  color={theme.colors.primary}
                  onPress={() => weightChartSheetRef.current?.present()}
                />
              </View>
            )}
          </ListItem>
          {animal.color && (
            <ListItem style={{ paddingVertical: 5 }}>
              <ListItem.Content>
                <ListItem.Title>{t("animals.color")}</ListItem.Title>
                <ListItem.Body>{animal.color}</ListItem.Body>
              </ListItem.Content>
            </ListItem>
          )}
          {animal.notes && (
            <ListItem style={{ paddingVertical: 5 }}>
              <ListItem.Content>
                <ListItem.Title>{t("animals.notes")}</ListItem.Title>
                <ListItem.Body>{animal.notes}</ListItem.Body>
              </ListItem.Content>
            </ListItem>
          )}
          {animal.customOutdoorJournalCategories.length > 0 && (
            <ListItem
              style={{ paddingVertical: 5 }}
              onPress={() =>
                navigation.navigate("ManageAnimalCategories", {
                  animalId: animal.id,
                })
              }
            >
              <ListItem.Content>
                <ListItem.Title>
                  {t("animals.custom_animal_category")}
                </ListItem.Title>
                <ListItem.Body>
                  {(() => {
                    const today = new Date();
                    const active = animal.customOutdoorJournalCategories.find(
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
          )}
          {animal.herd && (
            <ListItem
              style={{ paddingVertical: 5 }}
              onPress={() =>
                navigation.navigate("HerdEdit", { herdId: animal.herd!.id })
              }
            >
              <ListItem.Content>
                <ListItem.Title>{t("animals.herd")}</ListItem.Title>
                <ListItem.Body>{animal.herd.name}</ListItem.Body>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          )}
          {formattedDateOfDeath && (
            <>
              <ListItem style={{ paddingVertical: 5 }}>
                <ListItem.Content>
                  <ListItem.Title>{t("animals.date_of_death")}</ListItem.Title>
                  <ListItem.Body>{formattedDateOfDeath}</ListItem.Body>
                </ListItem.Content>
              </ListItem>
              {animal.deathReason && (
                <ListItem style={{ paddingVertical: 5 }}>
                  <ListItem.Content>
                    <ListItem.Title>{t("animals.death_reason")}</ListItem.Title>
                    <ListItem.Body>
                      {t(`animals.death_reasons.${animal.deathReason}`)}
                    </ListItem.Body>
                  </ListItem.Content>
                </ListItem>
              )}
            </>
          )}
        </View>

        {/* Mother */}
        {animal.mother && (
          <View style={{ marginTop: theme.spacing.l }}>
            <H3>{t("animals.mother")}</H3>
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
                  navigation.push("AnimalDetails", {
                    animalId: animal.mother!.id,
                  })
                }
              >
                <ListItem.Content>
                  <ListItem.Title>{animal.mother.name}</ListItem.Title>
                  <ListItem.Body>
                    {t(`animals.animal_types.${animal.mother.type}`)}
                  </ListItem.Body>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            </View>
          </View>
        )}

        {/* Father */}
        {animal.father && (
          <View style={{ marginTop: theme.spacing.l }}>
            <H3>{t("animals.father")}</H3>
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
                  navigation.push("AnimalDetails", {
                    animalId: animal.father!.id,
                  })
                }
              >
                <ListItem.Content>
                  <ListItem.Title>{animal.father.name}</ListItem.Title>
                  <ListItem.Body>
                    {t(`animals.animal_types.${animal.father.type}`)}
                  </ListItem.Body>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            </View>
          </View>
        )}

        {/* Sections, each opening its own screen, with a one-line summary */}
        <View
          style={{
            marginTop: theme.spacing.l,
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: theme.colors.white,
          }}
        >
          {isFemale && (
            <ListItem
              style={{ paddingVertical: 5 }}
              onPress={() => navigation.navigate("AnimalHeats", { animalId })}
            >
              <Ionicons
                name="heart-outline"
                size={20}
                color={theme.colors.primary}
                style={{ alignSelf: "center", marginLeft: theme.spacing.s }}
              />
              <ListItem.Content>
                <ListItem.Title>{t("breeding.heats")}</ListItem.Title>
                <ListItem.Body numberOfLines={1}>{heatsSummary}</ListItem.Body>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          )}
          <ListItem
            style={{ paddingVertical: 5 }}
            onPress={() => navigation.navigate("AnimalOffspring", { animalId })}
          >
            <Ionicons
              name="git-branch-outline"
              size={20}
              color={theme.colors.primary}
              style={{ alignSelf: "center", marginLeft: theme.spacing.s }}
            />
            <ListItem.Content>
              <ListItem.Title>{t("animals.children")}</ListItem.Title>
              <ListItem.Body numberOfLines={1}>
                {t("animals.n_offspring", { count: children.length })}
              </ListItem.Body>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <ListItem
            style={{ paddingVertical: 5 }}
            onPress={() =>
              navigation.navigate("AnimalTreatments", { animalId })
            }
          >
            <Ionicons
              name="medkit-outline"
              size={20}
              color={theme.colors.primary}
              style={{ alignSelf: "center", marginLeft: theme.spacing.s }}
            />
            <ListItem.Content>
              <ListItem.Title>{t("treatments.treatments")}</ListItem.Title>
              <ListItem.Body numberOfLines={1}>
                {treatmentsSummary}
              </ListItem.Body>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <ListItem
            style={{ paddingVertical: 5 }}
            onPress={() =>
              navigation.navigate("AnimalParasiteHistory", { animalId })
            }
          >
            <Ionicons
              name="bug-outline"
              size={20}
              color={theme.colors.primary}
              style={{ alignSelf: "center", marginLeft: theme.spacing.s }}
            />
            <ListItem.Content>
              <ListItem.Title>
                {t("parasite_checks.parasite_history")}
              </ListItem.Title>
              <ListItem.Body numberOfLines={1}>{parasiteSummary}</ListItem.Body>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <ListItem
            style={{ paddingVertical: 5 }}
            onPress={() => navigation.navigate("AnimalJournal", { animalId })}
          >
            <Ionicons
              name="book-outline"
              size={20}
              color={theme.colors.primary}
              style={{ alignSelf: "center", marginLeft: theme.spacing.s }}
            />
            <ListItem.Content>
              <ListItem.Title>{t("animals.journal")}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        </View>
      </ScrollView>

      <AnimalWeightChartDrawer
        sheetRef={weightChartSheetRef}
        animalId={animalId}
        // View only, weights are edited in the edit form like the other fields
        canEdit={false}
      />
    </ContentView>
  );
}
