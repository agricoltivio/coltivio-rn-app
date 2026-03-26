import { ContentView } from "@/components/containers/ContentView";
import { List } from "@/components/list/List";
import { ScrollView } from "@/components/views/ScrollView";
import { FieldCalendarScreenProps } from "./navigation/field-calendar.routes";
import { H2 } from "@/theme/Typography";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components/native";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { useMembership } from "../farms/farms.hooks";
import {
  FIELD_CALENDAR_GROUPS,
  FIELD_CALENDAR_ITEMS,
} from "./field-calendar-settings";

type GroupId = keyof typeof FIELD_CALENDAR_GROUPS;
type ItemId = keyof typeof FIELD_CALENDAR_ITEMS;

export function FieldCalendarScreen({ navigation }: FieldCalendarScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { localSettings } = useLocalSettings();
  const { isActive } = useMembership();

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!localSettings.fieldCalendarOnboardingCompleted) {
      navigation.replace("FieldCalendarOnboarding" as never);
    }
  }, []);

  const groups = localSettings.fieldCalendarGroups;

  return (
    <ScrollView
      headerTitleOnScroll={t("field_calendar.field_calendar")}
      showHeaderOnScroll
    >
      <ContentView>
        <H2>{t("field_calendar.field_calendar")}</H2>

        {groups
          .filter((group) => group.visible)
          .map((group) => {
            const groupId = group.groupId as GroupId;
            const groupMeta = FIELD_CALENDAR_GROUPS[groupId];
            if (!groupMeta) return null;

            const visibleItems = group.items.filter((item) => {
              if (!item.visible) return false;
              const itemMeta = FIELD_CALENDAR_ITEMS[item.itemId as ItemId];
              if (!itemMeta) return false;
              if (
                "membershipRequired" in itemMeta &&
                itemMeta.membershipRequired &&
                !isActive
              )
                return false;
              return true;
            });
            if (visibleItems.length === 0) return null;

            return (
              <List
                key={groupId}
                title={t(groupMeta.translationKey)}
                style={{ marginTop: theme.spacing.l }}
              >
                {visibleItems.map((item, index) => {
                  const itemId = item.itemId as ItemId;
                  const itemMeta = FIELD_CALENDAR_ITEMS[itemId]!;

                  return (
                    <List.Item
                      key={itemId}
                      title={t(itemMeta.translationKey)}
                      onPress={() =>
                        navigation.navigate(itemMeta.route as never)
                      }
                      hideBottomDivider={index === visibleItems.length - 1}
                    />
                  );
                })}
              </List>
            );
          })}
      </ContentView>
    </ScrollView>
  );
}
