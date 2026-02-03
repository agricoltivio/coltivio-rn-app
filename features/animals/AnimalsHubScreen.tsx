import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { AnimalsHubScreenProps } from "./navigation/animals-routes";
import { H2 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components/native";
import { List } from "@/components/list/List";

export function AnimalsHubScreen({ navigation }: AnimalsHubScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <ScrollView
      headerTitleOnScroll={t("animals.animal_husbandry")}
      showHeaderOnScroll
    >
      <ContentView>
        <H2>{t("animals.animal_husbandry")}</H2>
        <List style={{ marginTop: theme.spacing.l }}>
          <List.Item
            title={t("ear_tags.ear_tags")}
            onPress={() => navigation.navigate("EarTags")}
          />
          <List.Item
            title={t("animals.animals")}
            onPress={() => navigation.navigate("Animals")}
            hideBottomDivider
          />
        </List>
      </ContentView>
    </ScrollView>
  );
}
