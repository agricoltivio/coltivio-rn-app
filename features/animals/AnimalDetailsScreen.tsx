import { Button } from "@/components/buttons/Button";
import {
  IonIconButton,
  MaterialCommunityIconButton,
} from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useId, useMemo, useRef } from "react";
import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
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

  const deleteAnimalMutation = useDeleteAnimalMutation(() =>
    navigation.goBack(),
  );

  const removeChildMutation = useUpdateAnimalMutation();

  // Drawer to choose between creating a new offspring and selecting existing animals.
  // Rendered through a Portal at the app root (like DatePicker) so it covers the whole
  // window: a sheet provider inside the screen measures the screen's container, which
  // went stale after another screen was pushed on top.
  const addOffspringSheetRef = useRef<BottomSheetModal>(null);
  // Unique per screen instance: the same animal can be open twice in the stack
  const addOffspringPortalKey = useId();
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

  function handleRemoveChild(childId: string) {
    if (!animal) return;
    const parentField = animal.sex === "female" ? "motherId" : "fatherId";
    removeChildMutation.mutate({
      id: childId,
      [parentField]: null,
    });
  }

  function onDelete() {
    deleteAnimalMutation.mutate(animalId);
  }

  if (!animal) {
    return null;
  }

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

        <View style={{ marginTop: theme.spacing.l }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("AnimalJournal", { animalId })}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: theme.spacing.xs,
              padding: 12,
              borderRadius: theme.radii.m,
              borderWidth: 1.5,
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.white,
            }}
          >
            <Ionicons
              name="book-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Subtitle
              style={{
                color: theme.colors.primary,
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              {t("animals.journal")}
            </Subtitle>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("AnimalParasiteHistory", { animalId })
            }
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: theme.spacing.xs,
              padding: 12,
              marginTop: theme.spacing.s,
              borderRadius: theme.radii.m,
              borderWidth: 1.5,
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.white,
            }}
          >
            <Ionicons
              name="bug-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Subtitle
              style={{
                color: theme.colors.primary,
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              {t("parasite_checks.parasite_history")}
            </Subtitle>
          </TouchableOpacity>
        </View>

        {/* Heats and matings, the basis of the breeding calendar */}
        {isFemale && (
          <View style={{ marginTop: theme.spacing.l }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <H3>{t("breeding.heats")}</H3>
              {canWrite("animals") && (
                <IonIconButton
                  icon="add"
                  color="black"
                  iconSize={25}
                  type="accent"
                  onPress={() =>
                    navigation.navigate("AnimalHeatForm", { animalId })
                  }
                />
              )}
            </View>
            {!heats || heats.length === 0 ? (
              <Subtitle style={{ marginTop: theme.spacing.s }}>
                {t("breeding.no_heats")}
              </Subtitle>
            ) : (
              <View
                style={{
                  marginTop: theme.spacing.s,
                  borderRadius: 10,
                  overflow: "hidden",
                  backgroundColor: theme.colors.white,
                }}
              >
                {heats.map((heat) => {
                  // Computed on the server, also knows when a later heat showed the mating didn't work
                  const expectedBirthDate = heat.expectedBirthDate
                    ? parseDateOnly(heat.expectedBirthDate)
                    : null;
                  return (
                    <ListItem
                      key={heat.id}
                      style={{ paddingVertical: 5 }}
                      onPress={
                        canWrite("animals")
                          ? () =>
                              navigation.navigate("AnimalHeatForm", {
                                animalId,
                                heatId: heat.id,
                              })
                          : undefined
                      }
                    >
                      <ListItem.Content>
                        <ListItem.Title>
                          {formatLocalizedDate(
                            parseDateOnly(heat.date),
                            locale,
                          )}
                          {` · ${t(`breeding.heat_by_type.${animal.type}`)}`}
                          {heat.mated ? ` · ${t("breeding.mated")}` : ""}
                        </ListItem.Title>
                        {expectedBirthDate && (
                          <ListItem.Body>
                            {t("breeding.expected_birth")}:{" "}
                            {formatLocalizedDate(expectedBirthDate, locale)}
                          </ListItem.Body>
                        )}
                        {heat.conceptionFailed && (
                          <ListItem.Body>
                            {t("breeding.conception_failed")}
                          </ListItem.Body>
                        )}
                      </ListItem.Content>
                      {heat.mated && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={theme.colors.primary}
                        />
                      )}
                      {canWrite("animals") && <ListItem.Chevron />}
                    </ListItem>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Children */}
        <View style={{ marginTop: theme.spacing.l }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <H3>{t("animals.children")}</H3>
            {canWrite("animals") && (
              <IonIconButton
                icon="add"
                color="black"
                iconSize={25}
                type="accent"
                onPress={() => addOffspringSheetRef.current?.present()}
              />
            )}
          </View>
          {children.length === 0 ? (
            <Subtitle style={{ marginTop: theme.spacing.s }}>
              {t("animals.no_children")}
            </Subtitle>
          ) : (
            <View
              style={{
                marginTop: theme.spacing.s,
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
            >
              {children.map((child) => (
                <ListItem
                  key={child.id}
                  style={{ paddingVertical: 5 }}
                  onPress={() =>
                    navigation.push("AnimalDetails", {
                      animalId: child.id,
                    })
                  }
                >
                  <ListItem.Content>
                    <ListItem.Title>{child.name}</ListItem.Title>
                    <ListItem.Body>
                      {t(`animals.animal_types.${child.type}`)}
                    </ListItem.Body>
                  </ListItem.Content>
                  {canWrite("animals") && (
                    <TouchableOpacity
                      onPress={() => handleRemoveChild(child.id)}
                      style={{ padding: theme.spacing.xs }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={theme.colors.danger}
                      />
                    </TouchableOpacity>
                  )}
                  <ListItem.Chevron />
                </ListItem>
              ))}
            </View>
          )}
        </View>

        {/* Treatments */}
        <View style={{ marginTop: theme.spacing.l }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <H3>{t("treatments.treatments")}</H3>
            {canWrite("animals") && (
              <IonIconButton
                icon="add"
                color="black"
                iconSize={25}
                type="accent"
                onPress={() =>
                  navigation.navigate("CreateTreatment", {
                    animalIds: [animalId],
                  })
                }
              />
            )}
          </View>
          {animal?.treatments.length === 0 ? (
            <Subtitle style={{ marginTop: theme.spacing.s }}>
              {t("treatments.no_treatments")}
            </Subtitle>
          ) : (
            <View
              style={{
                marginTop: theme.spacing.s,
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
            >
              {animal.treatments.map((treatment) => (
                <ListItem
                  key={treatment.id}
                  style={{ paddingVertical: 5 }}
                  onPress={() =>
                    navigation.navigate("EditTreatment", {
                      treatmentId: treatment.id,
                    })
                  }
                >
                  <ListItem.Content>
                    <ListItem.Title>{treatment.name}</ListItem.Title>
                    <ListItem.Body>
                      {formatLocalizedDate(
                        new Date(treatment.startDate),
                        locale,
                      )}
                    </ListItem.Body>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add offspring: create a new animal with this parent preset, or link existing ones */}
      <Portal>
        {/* PortalHost renders portals as an unkeyed list, so without a key React can hand
            this sheet's state to another portal (e.g. a DatePicker) when portals are
            added or removed */}
        <BottomSheetModalProvider key={addOffspringPortalKey}>
          <BottomDrawerModal ref={addOffspringSheetRef}>
            <View style={{ gap: theme.spacing.s }}>
              <H3>{t("animals.add_offspring")}</H3>
              <View>
                <ListItem
                  onPress={() => {
                    addOffspringSheetRef.current?.dismiss();
                    navigation.navigate("CreateAnimal", {
                      animalType: animal.type,
                      ...(animal.sex === "female"
                        ? { motherId: animal.id }
                        : { fatherId: animal.id }),
                    });
                  }}
                >
                  <ListItem.Content>
                    <ListItem.Title>
                      {t("animals.create_new_offspring")}
                    </ListItem.Title>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
                <ListItem
                  onPress={() => {
                    addOffspringSheetRef.current?.dismiss();
                    navigation.navigate("SelectChildren", {
                      animalId,
                      sex: animal.sex,
                    });
                  }}
                >
                  <ListItem.Content>
                    <ListItem.Title>
                      {t("animals.select_existing_offspring")}
                    </ListItem.Title>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
              </View>
            </View>
          </BottomDrawerModal>
        </BottomSheetModalProvider>
      </Portal>

      <AnimalWeightChartDrawer
        sheetRef={weightChartSheetRef}
        animalId={animalId}
        // View only, weights are edited in the edit form like the other fields
        canEdit={false}
      />
    </ContentView>
  );
}
