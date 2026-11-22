import { IonIconButton } from "@/components/buttons/IconButton";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalByIdQuery } from "./animals.hooks";
import { AnimalTreatmentsScreenProps } from "./navigation/animals-routes";

// Treatments of an animal (a section of the animal details)
export function AnimalTreatmentsScreen({
  route,
  navigation,
}: AnimalTreatmentsScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { animalId } = route.params;
  const { animal } = useAnimalByIdQuery(animalId);

  if (!animal) return null;

  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("treatments.treatments")}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <H2>{t("treatments.treatments")}</H2>
            <Subtitle>{animal.name}</Subtitle>
          </View>
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
        {animal.treatments.length === 0 ? (
          <Subtitle style={{ marginTop: theme.spacing.m }}>
            {t("treatments.no_treatments")}
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
                    {formatLocalizedDate(new Date(treatment.startDate), locale)}
                  </ListItem.Body>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            ))}
          </View>
        )}
      </ScrollView>
    </ContentView>
  );
}
