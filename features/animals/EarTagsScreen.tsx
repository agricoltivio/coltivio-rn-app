import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useEarTagsQuery } from "./earTags.hooks";
import { EarTagsScreenProps } from "./navigation/animals-routes";
import { usePermissions } from "@/features/user/users.hooks";

export function EarTagsScreen({ navigation }: EarTagsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { earTags } = useEarTagsQuery();

  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("ear_tags.ear_tags")}
      >
        <H2>{t("ear_tags.ear_tags")}</H2>
        <View style={{ marginTop: theme.spacing.m }}>
          {earTags?.length === 0 && (
            <Subtitle>{t("common.no_entries")}</Subtitle>
          )}
          <View
            style={{
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: theme.colors.white,
            }}
          >
            {earTags?.map((earTag) => (
              <ListItem key={earTag.id} style={{ paddingVertical: 5 }}>
                <ListItem.Content>
                  <ListItem.Title>{earTag.number}</ListItem.Title>
                  <ListItem.Body>
                    {earTag.animal
                      ? earTag.animal.name
                      : t("ear_tags.no_animal_assigned")}
                  </ListItem.Body>
                </ListItem.Content>
              </ListItem>
            ))}
          </View>
        </View>
      </ScrollView>
      {canWrite("animals") && (
        <FAB
          icon={{ name: "add", color: "white" }}
          onPress={() => navigation.navigate("CreateEarTagRange")}
        />
      )}
    </ContentView>
  );
}
