import { ContentView } from "@/components/containers/ContentView";
import { Switch } from "@/components/inputs/Switch";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import {
  HOME_TILES,
  HomeTileConfig,
} from "@/features/home/home-tiles-settings";
import { H2, H3 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useMembership } from "@/features/farms/farms.hooks";
import { usePermissions } from "./users.hooks";
import { useLocalSettings } from "./LocalSettingsContext";

export function HomeTilesSettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { localSettings, updateLocalSettings } = useLocalSettings();
  const { isActive } = useMembership();
  const { getAccess } = usePermissions();

  function isTileAccessible(id: string): boolean {
    const meta = HOME_TILES[id as keyof typeof HOME_TILES];
    if (!meta) return false;
    if ("membershipRequired" in meta && meta.membershipRequired && !isActive)
      return false;
    if (id === "plots" && getAccess("field_calendar") === "none") return false;
    if (id === "tasks" && getAccess("tasks") === "none") return false;
    if (id === "animalHusbandry" && getAccess("animals") === "none")
      return false;
    if (id === "fieldCalendar" && getAccess("field_calendar") === "none")
      return false;
    return true;
  }

  const tiles = localSettings.homeTiles.filter((i) => isTileAccessible(i.id));
  const visibleTiles = tiles.filter((i) => i.visible);
  const hiddenTiles = tiles.filter((i) => !i.visible);

  function update(newTiles: HomeTileConfig[]) {
    updateLocalSettings("homeTiles", newTiles);
  }

  function moveUp(index: number) {
    const visibleIds = tiles.filter((i) => i.visible).map((i) => i.id);
    if (index === 0) return;
    const currentId = visibleIds[index];
    const prevId = visibleIds[index - 1];
    const currentIdx = tiles.findIndex((i) => i.id === currentId);
    const prevIdx = tiles.findIndex((i) => i.id === prevId);
    const result = [...tiles];
    result[currentIdx] = tiles[prevIdx];
    result[prevIdx] = tiles[currentIdx];
    update(result);
  }

  function moveDown(index: number) {
    const visibleIds = tiles.filter((i) => i.visible).map((i) => i.id);
    if (index === visibleIds.length - 1) return;
    const currentId = visibleIds[index];
    const nextId = visibleIds[index + 1];
    const currentIdx = tiles.findIndex((i) => i.id === currentId);
    const nextIdx = tiles.findIndex((i) => i.id === nextId);
    const result = [...tiles];
    result[currentIdx] = tiles[nextIdx];
    result[nextIdx] = tiles[currentIdx];
    update(result);
  }

  function hideTile(id: string) {
    update(tiles.map((i) => (i.id === id ? { ...i, visible: false } : i)));
  }

  function showTile(id: string) {
    update(tiles.map((i) => (i.id === id ? { ...i, visible: true } : i)));
  }

  return (
    <ScrollView headerTitleOnScroll={t("home_tiles.title")} showHeaderOnScroll>
      <ContentView>
        <H2>{t("home_tiles.title")}</H2>

        <Switch
          label={t("home_tiles.show_tiles")}
          value={localSettings.homeTilesLayout === "grid"}
          onChange={(e) =>
            updateLocalSettings(
              "homeTilesLayout",
              e.nativeEvent.value ? "grid" : "list",
            )
          }
          style={{
            paddingVertical: theme.spacing.s,
            marginTop: theme.spacing.m,
          }}
        />

        {isActive && (
          <Switch
            label={t("home_tiles.show_upcoming_tasks")}
            value={localSettings.showUpcomingTasks}
            onChange={(e) =>
              updateLocalSettings("showUpcomingTasks", e.nativeEvent.value)
            }
            style={{ paddingVertical: theme.spacing.s }}
          />
        )}

        {/* Visible tiles with reorder and remove */}
        <View
          style={{
            marginTop: theme.spacing.l,
            backgroundColor: theme.colors.white,
            borderRadius: 10,
            padding: theme.spacing.m,
          }}
        >
          <H3>{t("home_tiles.active_tiles")}</H3>
          {visibleTiles.map((item, index) => {
            const meta = HOME_TILES[item.id as keyof typeof HOME_TILES];
            if (!meta) return null;
            return (
              <ListItem
                key={item.id}
                hideBottomDivider={index === visibleTiles.length - 1}
              >
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
                    disabled={index === visibleTiles.length - 1}
                    style={{
                      opacity: index === visibleTiles.length - 1 ? 0.3 : 1,
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
                    onPress={() => hideTile(item.id)}
                    style={{ padding: theme.spacing.xs }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={22}
                      color={theme.colors.danger}
                    />
                  </TouchableOpacity>
                </View>
              </ListItem>
            );
          })}
        </View>

        {/* Hidden tiles with add button */}
        {hiddenTiles.length > 0 ? (
          <View
            style={{
              marginTop: theme.spacing.m,
              backgroundColor: theme.colors.white,
              borderRadius: 10,
              padding: theme.spacing.m,
            }}
          >
            <H3>{t("home_tiles.hidden_tiles")}</H3>
            {hiddenTiles.map((item, index) => {
              const meta = HOME_TILES[item.id as keyof typeof HOME_TILES];
              if (!meta) return null;
              return (
                <ListItem
                  key={item.id}
                  hideBottomDivider={index === hiddenTiles.length - 1}
                  onPress={() => showTile(item.id)}
                >
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
      </ContentView>
    </ScrollView>
  );
}
