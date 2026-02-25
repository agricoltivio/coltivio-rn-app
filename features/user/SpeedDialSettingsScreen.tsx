import { ContentView } from "@/components/containers/ContentView";
import { Switch } from "@/components/inputs/Switch";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import {
  SPEED_DIAL_ACTIONS,
  SpeedDialActionConfig,
} from "@/features/home/speed-dial-settings";
import { H2, H3 } from "@/theme/Typography";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useLocalSettings } from "./LocalSettingsContext";

const MAX_ACTIVE = 4;

/** Reusable settings body for speed dial config — used by both the settings screen and onboarding */
export function SpeedDialSettingsBody() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { localSettings, updateLocalSettings } = useLocalSettings();

  const items = localSettings.speedDialItems;
  const activeItems = items.filter((i) => i.active);
  const inactiveItems = items.filter((i) => !i.active);

  function update(newItems: SpeedDialActionConfig[]) {
    updateLocalSettings("speedDialItems", newItems);
  }

  function moveUp(index: number) {
    const activeIds = items.filter((i) => i.active).map((i) => i.id);
    if (index === 0) return;
    const currentId = activeIds[index];
    const prevId = activeIds[index - 1];
    const currentIdx = items.findIndex((i) => i.id === currentId);
    const prevIdx = items.findIndex((i) => i.id === prevId);
    const result = [...items];
    result[currentIdx] = items[prevIdx];
    result[prevIdx] = items[currentIdx];
    update(result);
  }

  function moveDown(index: number) {
    const activeIds = items.filter((i) => i.active).map((i) => i.id);
    if (index === activeIds.length - 1) return;
    const currentId = activeIds[index];
    const nextId = activeIds[index + 1];
    const currentIdx = items.findIndex((i) => i.id === currentId);
    const nextIdx = items.findIndex((i) => i.id === nextId);
    const result = [...items];
    result[currentIdx] = items[nextIdx];
    result[nextIdx] = items[currentIdx];
    update(result);
  }

  function deactivate(id: string) {
    update(items.map((i) => (i.id === id ? { ...i, active: false } : i)));
  }

  function activate(id: string) {
    let newItems = [...items];
    if (activeItems.length >= MAX_ACTIVE) {
      const lastActiveId = activeItems[activeItems.length - 1].id;
      newItems = newItems.map((i) =>
        i.id === lastActiveId ? { ...i, active: false } : i,
      );
    }
    newItems = newItems.map((i) => (i.id === id ? { ...i, active: true } : i));
    update(newItems);
  }

  return (
    <>
      <Switch
        label={t("settings.speed_dial_enabled")}
        value={localSettings.speedDialEnabled}
        onChange={(e) =>
          updateLocalSettings("speedDialEnabled", e.nativeEvent.value)
        }
        style={{
          paddingVertical: theme.spacing.s,
          marginTop: theme.spacing.m,
        }}
      />
      {/* Active items */}
      <View
        style={{
          marginTop: theme.spacing.l,
          backgroundColor: theme.colors.white,
          borderRadius: 10,
          padding: theme.spacing.m,
        }}
      >
        <H3>{t("speed_dial.active_actions")}</H3>
        {activeItems.map((item, index) => {
          const meta =
            SPEED_DIAL_ACTIONS[item.id as keyof typeof SPEED_DIAL_ACTIONS];
          if (!meta) return null;
          return (
            <ListItem
              key={item.id}
              hideBottomDivider={index === activeItems.length - 1}
            >
              <MaterialCommunityIcons
                name={meta.icon}
                size={22}
                color={theme.colors.primary}
                style={{ marginLeft: theme.spacing.s }}
              />
              <ListItem.Content>
                <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                  {t(meta.translationKey)}
                </ListItem.Title>
              </ListItem.Content>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity
                  onPress={() => moveUp(index)}
                  disabled={index === 0}
                  style={{
                    opacity: index === 0 ? 0.3 : 1,
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
                  onPress={() => moveDown(index)}
                  disabled={index === activeItems.length - 1}
                  style={{
                    opacity: index === activeItems.length - 1 ? 0.3 : 1,
                    padding: theme.spacing.xs,
                  }}
                >
                  <Ionicons
                    name="chevron-down"
                    size={22}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deactivate(item.id)}
                  style={{ padding: theme.spacing.xs }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={22}
                    color={theme.colors.error}
                  />
                </TouchableOpacity>
              </View>
            </ListItem>
          );
        })}
      </View>

      {/* Available items */}
      {inactiveItems.length > 0 ? (
        <View
          style={{
            marginTop: theme.spacing.m,
            backgroundColor: theme.colors.white,
            borderRadius: 10,
            padding: theme.spacing.m,
          }}
        >
          <H3>{t("speed_dial.available_actions")}</H3>
          {inactiveItems.map((item, index) => {
            const meta =
              SPEED_DIAL_ACTIONS[item.id as keyof typeof SPEED_DIAL_ACTIONS];
            if (!meta) return null;
            return (
              <ListItem
                key={item.id}
                hideBottomDivider={index === inactiveItems.length - 1}
                onPress={() => activate(item.id)}
              >
                <MaterialCommunityIcons
                  name={meta.icon}
                  size={22}
                  color={theme.colors.primary}
                  style={{ marginLeft: theme.spacing.s }}
                />
                <ListItem.Content>
                  <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                    {t(meta.translationKey)}
                  </ListItem.Title>
                </ListItem.Content>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    width: 40,
                  }}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
              </ListItem>
            );
          })}
        </View>
      ) : null}
    </>
  );
}

export function SpeedDialSettingsScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView headerTitleOnScroll={t("speed_dial.title")} showHeaderOnScroll>
      <ContentView>
        <H2>{t("speed_dial.title")}</H2>
        <SpeedDialSettingsBody />
      </ContentView>
    </ScrollView>
  );
}
