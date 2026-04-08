import { Button } from "@/components/buttons/Button";
import { IonIconButton, MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useAnimalByIdQuery,
  useDeleteAnimalMutation,
  useUpdateAnimalMutation,
} from "./animals.hooks";
import { useMembership } from "@/features/farms/farms.hooks";
import { usePermissions } from "@/features/user/users.hooks";
import { AnimalDetailsScreenProps } from "./navigation/animals-routes";
import { formatLocalizedDate } from "@/utils/date";
import { locale } from "@/locales/i18n";
import { Switch } from "@/components/inputs/Switch";

export function AnimalDetailsScreen({
  route,
  navigation,
}: AnimalDetailsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const animalId = route.params.animalId;
  const { animal } = useAnimalByIdQuery(animalId);
  const { isActive: isMember } = useMembership();

  const deleteAnimalMutation = useDeleteAnimalMutation(() =>
    navigation.goBack(),
  );

  const removeChildMutation = useUpdateAnimalMutation();
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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <H2>{animal.name}</H2>
          <MaterialCommunityIconButton
            type="accent"
            icon="sitemap"
            iconSize={22}
            color={theme.colors.primary}
            onPress={() => navigation.navigate("FamilyTree", { animalType: animal.type, focusedAnimalId: animal.id })}
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

        {/* Journal — members only */}
        {isMember && (
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
            <Ionicons name="book-outline" size={18} color={theme.colors.primary} />
            <Subtitle style={{ color: theme.colors.primary, fontWeight: "600", fontSize: 16 }}>
              {t("animals.journal")}
            </Subtitle>
          </TouchableOpacity>
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
                onPress={() =>
                  navigation.navigate("SelectChildren", {
                    animalId,
                    sex: animal.sex,
                  })
                }
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
    </ContentView>
  );
}
