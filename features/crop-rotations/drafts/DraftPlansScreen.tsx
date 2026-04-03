import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { H2, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, Pressable, View } from "react-native";
import { useTheme } from "styled-components/native";
import { DraftPlanSummary } from "@/api/crop-rotations.api";
import {
  useDraftPlansQuery,
  useDeleteDraftPlanMutation,
} from "../crop-rotations.hooks";
import { DraftPlansScreenProps } from "../navigation/crop-rotations-routes.d";
import { usePermissions } from "@/features/user/users.hooks";

export function DraftPlansScreen({ navigation }: DraftPlansScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { draftPlans, isLoading } = useDraftPlansQuery();
  const deleteMutation = useDeleteDraftPlanMutation();

  function handleDelete(plan: DraftPlanSummary) {
    Alert.alert(t("crop_rotations.draft_plans.delete_confirm"), plan.name, [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("buttons.delete"),
        style: "destructive",
        onPress: () => deleteMutation.mutate({ draftPlanId: plan.id }),
      },
    ]);
  }

  const renderItem = ({ item }: { item: DraftPlanSummary }) => (
    <ListItem
      onPress={() =>
        navigation.navigate("DraftPlanDetail", { draftPlanId: item.id })
      }
    >
      <ListItem.Content>
        <ListItem.Title>{item.name}</ListItem.Title>
        <ListItem.Body>
          {t("crop_rotations.draft_plans.updated_at", {
            date: formatLocalizedDate(new Date(item.updatedAt), locale),
          })}
        </ListItem.Body>
      </ListItem.Content>
      {canWrite("field_calendar") && (
        <ListItem.RightIcon>
          <Pressable onPress={() => handleDelete(item)} hitSlop={8}>
            <Ionicons
              name="trash-outline"
              size={20}
              color={theme.colors.danger}
            />
          </Pressable>
        </ListItem.RightIcon>
      )}
    </ListItem>
  );

  return (
    <ContentView headerVisible>
      <H2>{t("crop_rotations.draft_plans.title")}</H2>

      <View style={{ flex: 1, marginTop: 16 }}>
        {!isLoading && (!draftPlans || draftPlans.length === 0) && (
          <Subtitle>{t("crop_rotations.draft_plans.no_drafts")}</Subtitle>
        )}
        <FlatList
          contentContainerStyle={{
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            overflow: "hidden",
          }}
          data={draftPlans}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </View>

      {canWrite("field_calendar") && (
        <FAB
          icon={{ name: "add-outline", color: "white" }}
          onPress={() => navigation.navigate("CreateDraftPlan")}
        />
      )}
    </ContentView>
  );
}
