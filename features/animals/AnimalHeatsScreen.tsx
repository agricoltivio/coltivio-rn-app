import { IonIconButton } from "@/components/buttons/IconButton";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate, parseDateOnly } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalByIdQuery } from "./animals.hooks";
import { useAnimalHeatsQuery } from "./breeding.hooks";
import { AnimalHeatsScreenProps } from "./navigation/animals-routes";

// Heats and matings of a female, the basis of the breeding calendar (a section of the
// animal details)
export function AnimalHeatsScreen({
  route,
  navigation,
}: AnimalHeatsScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { animalId } = route.params;
  const { animal } = useAnimalByIdQuery(animalId);
  const { heats } = useAnimalHeatsQuery(animalId, true);

  if (!animal) return null;

  return (
    <ContentView headerVisible>
      <ScrollView showHeaderOnScroll headerTitleOnScroll={t("breeding.heats")}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <H2>{t("breeding.heats")}</H2>
            <Subtitle>{animal.name}</Subtitle>
          </View>
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
          <Subtitle style={{ marginTop: theme.spacing.m }}>
            {t("breeding.no_heats")}
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
                      {formatLocalizedDate(parseDateOnly(heat.date), locale)}
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
      </ScrollView>
    </ContentView>
  );
}
