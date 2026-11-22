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
  ANIMALS_GROUPS,
  ANIMALS_ITEMS,
  AnimalsGroupConfig,
} from "./animals-settings";

type GroupId = keyof typeof ANIMALS_GROUPS;
type ItemId = keyof typeof ANIMALS_ITEMS;

// Group and item ids come from the stored settings and can be outdated
function isGroupId(id: string): id is GroupId {
  return Object.prototype.hasOwnProperty.call(ANIMALS_GROUPS, id);
}
function isItemId(id: string): id is ItemId {
  return Object.prototype.hasOwnProperty.call(ANIMALS_ITEMS, id);
}

/** Reusable settings body: group cards with switches and reorder buttons */
export function AnimalsSettingsBody() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { localSettings, updateLocalSettings } = useLocalSettings();

  const groups = localSettings.animalsGroups;

  function updateGroups(newGroups: AnimalsGroupConfig[]) {
    updateLocalSettings("animalsGroups", newGroups);
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
        const groupId = group.groupId;
        if (!isGroupId(groupId)) return null;
        const groupMeta = ANIMALS_GROUPS[groupId];

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
              <H3 style={{ flex: 1 }}>{t(groupMeta.translationKey)}</H3>
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
              const itemId = item.itemId;
              if (!isItemId(itemId)) return null;
              const itemMeta = ANIMALS_ITEMS[itemId];

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

export function AnimalsSettingsScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView headerTitleOnScroll={t("animals.settings")} showHeaderOnScroll>
      <ContentView>
        <H2>{t("animals.settings")}</H2>
        <AnimalsSettingsBody />
      </ContentView>
    </ScrollView>
  );
}
