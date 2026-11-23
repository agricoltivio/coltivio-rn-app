import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useId, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalByIdQuery, useUpdateAnimalMutation } from "./animals.hooks";
import { AnimalOffspringScreenProps } from "./navigation/animals-routes";

// Offspring of an animal (a section of the animal details): open, unlink, or add by
// creating a new animal or linking existing ones
export function AnimalOffspringScreen({
  route,
  navigation,
}: AnimalOffspringScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { animalId } = route.params;
  const { animal } = useAnimalByIdQuery(animalId);
  const removeChildMutation = useUpdateAnimalMutation();

  // Drawer to choose between creating a new offspring and selecting existing animals.
  // Rendered through a Portal at the app root (like DatePicker) so it covers the whole
  // window: a sheet provider inside the screen measures the screen's container, which
  // went stale after another screen was pushed on top.
  const addOffspringSheetRef = useRef<BottomSheetModal>(null);
  // Unique per screen instance: the same animal can be open twice in the stack
  const addOffspringPortalKey = useId();

  // Children from both mother and father relationships
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
    removeChildMutation.mutate({ id: childId, [parentField]: null });
  }

  if (!animal) return null;

  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("animals.children")}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <H2>{t("animals.children")}</H2>
            <Subtitle>{animal.name}</Subtitle>
          </View>
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
          <Subtitle style={{ marginTop: theme.spacing.m }}>
            {t("animals.no_children")}
          </Subtitle>
        ) : (
          <View
            style={{
              marginTop: theme.spacing.m,
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
                  navigation.push("AnimalDetails", { animalId: child.id })
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
    </ContentView>
  );
}
