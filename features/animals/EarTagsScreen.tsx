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
import { Alert, FlatList, View } from "react-native";
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
      {/* Virtualized: a farm can have hundreds of ear tags */}
      <FlatList
        data={earTags ?? []}
        keyExtractor={(earTag) => earTag.id}
        // Our ScrollView, for the title in the navigation header
        renderScrollComponent={(scrollProps) => (
          <ScrollView
            {...scrollProps}
            showHeaderOnScroll
            headerTitleOnScroll={t("ear_tags.ear_tags")}
          />
        )}
        // room for the FAB below the last tag
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={
          <View style={{ marginBottom: theme.spacing.m }}>
            <H2>{t("ear_tags.ear_tags")}</H2>
            {canWrite("animals") && (earTags?.length ?? 0) > 0 && (
              <Button
                style={{ marginTop: theme.spacing.m }}
                type="accent"
                title={t("ear_tags.delete_range")}
                onPress={() => navigation.navigate("DeleteEarTagRange")}
              />
            )}
          </View>
        }
        ListEmptyComponent={
          earTags ? <Subtitle>{t("common.no_entries")}</Subtitle> : undefined
        }
        renderItem={({ item: earTag, index }) => {
          // One white block: rounded corners on the first and last tag
          const isFirst = index === 0;
          const isLast = index === (earTags?.length ?? 0) - 1;
          return (
            <View
              style={{
                backgroundColor: theme.colors.white,
                overflow: "hidden",
                borderTopLeftRadius: isFirst ? 10 : 0,
                borderTopRightRadius: isFirst ? 10 : 0,
                borderBottomLeftRadius: isLast ? 10 : 0,
                borderBottomRightRadius: isLast ? 10 : 0,
              }}
            >
              <ListItem
                style={{ paddingVertical: 5 }}
                // Tapping a tag changes its number
                onPress={
                  canWrite("animals")
                    ? () =>
                        navigation.navigate("EditEarTag", {
                          earTagId: earTag.id,
                          number: earTag.number,
                          animalName: earTag.animal?.name,
                        })
                    : undefined
                }
              >
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
            </View>
          );
        }}
      />
      {canWrite("animals") && (
        <FAB
          icon={{ name: "add", color: "white" }}
          onPress={() => navigation.navigate("CreateEarTagRange")}
        />
      )}
    </ContentView>
  );
}
