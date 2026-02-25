import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { Switch } from "@/components/inputs/Switch";
import { H2, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSettings } from "../user/LocalSettingsContext";
import {
  FIELD_CALENDAR_GROUPS,
  FIELD_CALENDAR_ITEMS,
  FieldCalendarGroupConfig,
} from "./field-calendar-settings";

type GroupId = keyof typeof FIELD_CALENDAR_GROUPS;
type ItemId = keyof typeof FIELD_CALENDAR_ITEMS;

/** Reusable settings body: group cards with switches and reorder buttons */
export function FieldCalendarSettingsBody() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { localSettings, updateLocalSettings } = useLocalSettings();

  const groups = localSettings.fieldCalendarGroups;

  function updateGroups(newGroups: FieldCalendarGroupConfig[]) {
    updateLocalSettings("fieldCalendarGroups", newGroups);
  }

  function toggleItem(groupIndex: number, itemIndex: number) {
    const newGroups = groups.map((group, gi) => {
      if (gi !== groupIndex) return group;
      return {
        ...group,
        items: group.items.map((item, ii) => {
          if (ii !== itemIndex) return item;
          return { ...item, visible: !item.visible };
        }),
      };
    });
    updateGroups(newGroups);
  }

  function moveGroupUp(groupIndex: number) {
    if (groupIndex === 0) return;
    const newGroups = [...groups];
    const temp = newGroups[groupIndex - 1];
    newGroups[groupIndex - 1] = newGroups[groupIndex];
    newGroups[groupIndex] = temp;
    updateGroups(newGroups);
  }

  function moveGroupDown(groupIndex: number) {
    if (groupIndex === groups.length - 1) return;
    const newGroups = [...groups];
    const temp = newGroups[groupIndex + 1];
    newGroups[groupIndex + 1] = newGroups[groupIndex];
    newGroups[groupIndex] = temp;
    updateGroups(newGroups);
  }

  return (
    <>
      {groups.map((group, groupIndex) => {
        const groupId = group.groupId as GroupId;
        const groupMeta = FIELD_CALENDAR_GROUPS[groupId];
        if (!groupMeta) return null;

        return (
          <View
            key={groupId}
            style={{
              marginTop: theme.spacing.l,
              backgroundColor: theme.colors.white,
              borderRadius: 10,
              padding: theme.spacing.m,
            }}
          >
            {/* Group header with reorder buttons */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: theme.spacing.s,
              }}
            >
              <H3 style={{ flex: 1 }}>
                {t(groupMeta.translationKey)}
              </H3>
              <TouchableOpacity
                onPress={() => moveGroupUp(groupIndex)}
                disabled={groupIndex === 0}
                style={{
                  opacity: groupIndex === 0 ? 0.3 : 1,
                  padding: theme.spacing.xs,
                }}
              >
                <Ionicons
                  name="chevron-up"
                  size={22}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => moveGroupDown(groupIndex)}
                disabled={groupIndex === groups.length - 1}
                style={{
                  opacity: groupIndex === groups.length - 1 ? 0.3 : 1,
                  padding: theme.spacing.xs,
                }}
              >
                <Ionicons
                  name="chevron-down"
                  size={22}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Item toggles */}
            {group.items.map((item, itemIndex) => {
              const itemId = item.itemId as ItemId;
              const itemMeta = FIELD_CALENDAR_ITEMS[itemId];
              if (!itemMeta) return null;

              return (
                <Switch
                  key={itemId}
                  label={t(itemMeta.translationKey)}
                  value={item.visible}
                  onChange={() => toggleItem(groupIndex, itemIndex)}
                  style={{ paddingVertical: theme.spacing.s }}
                />
              );
            })}
          </View>
        );
      })}
    </>
  );
}

export function FieldCalendarSettingsScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView
      headerTitleOnScroll={t("field_calendar.settings")}
      showHeaderOnScroll
    >
      <ContentView>
        <H2>{t("field_calendar.settings")}</H2>
        <FieldCalendarSettingsBody />
      </ContentView>
    </ScrollView>
  );
}
