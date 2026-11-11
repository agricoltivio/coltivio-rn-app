import { ApiError } from "@/api/api";
import { EarTag } from "@/api/earTags.api";
import { Button } from "@/components/buttons/Button";
import { FAB } from "@/components/buttons/FAB";
import { IonIconButton } from "@/components/buttons/IconButton";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useDeleteEarTagMutation, useEarTagsQuery } from "./earTags.hooks";
import { EarTagsScreenProps } from "./navigation/animals-routes";
import { usePermissions } from "@/features/user/users.hooks";

export function EarTagsScreen({ navigation }: EarTagsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { earTags } = useEarTagsQuery();
  // ear_tag_assigned: the tag was assigned to an animal in the meantime, e.g. on another device
  const deleteEarTagMutation = useDeleteEarTagMutation((error) =>
    Alert.alert(
      t("common.error"),
      error instanceof ApiError && error.code === "ear_tag_assigned"
        ? t("ear_tags.delete_assigned_server")
        : t("common.unknown_error"),
    ),
  );

  // Only unassigned tags can be deleted, by id so any number format works
  function confirmDelete(earTag: EarTag) {
    Alert.alert(
      t("ear_tags.confirm_delete_title"),
      t("ear_tags.confirm_delete_message", { number: earTag.number }),
      [
        { text: t("buttons.cancel"), style: "cancel" },
        {
          text: t("buttons.delete"),
          style: "destructive",
          onPress: () => deleteEarTagMutation.mutate(earTag.id),
        },
      ],
    );
  }

  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("ear_tags.ear_tags")}
      >
        <H2>{t("ear_tags.ear_tags")}</H2>
        {canWrite("animals") && (earTags?.length ?? 0) > 0 && (
          <Button
            style={{ marginTop: theme.spacing.m }}
            type="accent"
            title={t("ear_tags.delete_range")}
            onPress={() => navigation.navigate("DeleteEarTagRange")}
          />
        )}
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
                {canWrite("animals") && !earTag.animal && (
                  // ListItem stretches its children to the row height, center the button
                  <View
                    style={{
                      justifyContent: "center",
                      paddingRight: theme.spacing.m,
                    }}
                  >
                    <IonIconButton
                      icon="trash-outline"
                      type="ghost"
                      iconSize={22}
                      color={theme.colors.danger}
                      disabled={deleteEarTagMutation.isPending}
                      onPress={() => confirmDelete(earTag)}
                    />
                  </View>
                )}
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
