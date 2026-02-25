import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { H2, Subtitle } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { FlatList, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { UncategorizedAnimalsScreenProps } from "./navigation/animals-routes";
import { UncategorizedAnimal } from "@/api/outdoor-journal.api";

export function UncategorizedAnimalsScreen({
  route,
  navigation,
}: UncategorizedAnimalsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { animals } = route.params;

  return (
    <ContentView headerVisible>
      <H2>{t("animals.uncategorized_animals")}</H2>
      <View style={{ marginTop: theme.spacing.m, flex: 1 }}>
        <FlatList
          contentContainerStyle={{
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            overflow: "hidden",
            backgroundColor:
              animals.length > 0 ? theme.colors.white : undefined,
          }}
          data={animals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: UncategorizedAnimal }) => (
            <ListItem style={{ paddingVertical: 5 }}>
              <ListItem.Content>
                <ListItem.Title>{item.name}</ListItem.Title>
                <ListItem.Body>
                  {t(`animals.animal_types.${item.type}`)}
                </ListItem.Body>
              </ListItem.Content>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ManageAnimalCategories", {
                    animalId: item.id,
                  })
                }
                style={{
                  marginRight: theme.spacing.m,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 6,
                  backgroundColor: theme.colors.primary + "15",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Subtitle
                  style={{
                    fontSize: 13,
                    color: theme.colors.primary,
                    textAlign: "center",
                  }}
                >
                  {t("animals.fix")}
                </Subtitle>
              </TouchableOpacity>
            </ListItem>
          )}
        />
      </View>
    </ContentView>
  );
}
