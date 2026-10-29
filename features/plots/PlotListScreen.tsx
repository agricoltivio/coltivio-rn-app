import { Meadow } from "@/api/meadows.api";
import { Plot } from "@/api/plots.api";
import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { Chip } from "@/components/chips/Chip";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { Checkbox } from "@/components/inputs/Checkbox";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { useMeadowsQuery } from "@/features/animals/meadows.hooks";
import { usePermissions } from "@/features/user/users.hooks";
import { Body, H2, H3 } from "@/theme/Typography";
import { round } from "@/utils/math";
import Fuse from "fuse.js";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Modal, ScrollView, SectionList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { PlotListScreenProps } from "./navigation/plots-routes";
import { useFarmPlotsQuery } from "./plots.hooks";
import { PlotsEmptyState } from "./PlotsEmptyState";
import { isUsageCode } from "./usage-codes";

type AreaTypeFilter = "all" | "plots" | "meadows";

type PlotWithUsageName = Plot & { usageName: string };

type ListEntry =
  | { kind: "plot"; plot: PlotWithUsageName }
  | { kind: "meadow"; meadow: Meadow };

export function PlotListScreen({ navigation }: PlotListScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canRead } = usePermissions();
  // Archived ones included, they're split off into their own section below
  const { plots } = useFarmPlotsQuery(true);
  // Meadows belong to the animals feature, only listed with access to it
  const showMeadowsAllowed = canRead("animals");
  const { meadows } = useMeadowsQuery(true);
  const [showArchived, setShowArchived] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [areaTypeFilter, setAreaTypeFilter] = useState<AreaTypeFilter>("all");
  const [selectedUsageCodes, setSelectedUsageCodes] = useState<Set<number>>(
    new Set(),
  );
  const [usageFilterVisible, setUsageFilterVisible] = useState(false);

  const plotsWithUsageName: PlotWithUsageName[] = useMemo(
    () =>
      (plots ?? []).map((plot) => ({
        ...plot,
        usageName:
          typeof plot.usage === "number" && isUsageCode(plot.usage)
            ? t(`plots.usage_codes.${plot.usage}`)
            : t("common.unknown"),
      })),
    [plots, t],
  );

  // Only offer the usage codes the farm's plots actually have
  const availableUsageCodes = useMemo(() => {
    const usageNamesByCode = new Map<number, string>();
    for (const plot of plotsWithUsageName) {
      if (typeof plot.usage === "number") {
        usageNamesByCode.set(plot.usage, plot.usageName);
      }
    }
    return [...usageNamesByCode.entries()]
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [plotsWithUsageName]);

  const usageFilterActive = selectedUsageCodes.size > 0;

  const filteredPlots = useMemo(() => {
    const plotsMatchingUsage = usageFilterActive
      ? plotsWithUsageName.filter(
          (plot) =>
            typeof plot.usage === "number" &&
            selectedUsageCodes.has(plot.usage),
        )
      : plotsWithUsageName;
    if (searchText.length === 0) {
      return plotsMatchingUsage
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    const fuse = new Fuse(plotsMatchingUsage, {
      minMatchCharLength: 1,
      keys: [
        "name",
        "localId",
        "usage",
        "usageName",
        "currentCropRotation.crop.name",
      ],
    });
    return fuse.search(searchText).map((result) => result.item);
  }, [plotsWithUsageName, usageFilterActive, selectedUsageCodes, searchText]);

  const filteredMeadows = useMemo(() => {
    const allMeadows = meadows ?? [];
    if (searchText.length === 0) {
      return allMeadows.slice().sort((a, b) => a.name.localeCompare(b.name));
    }
    const fuse = new Fuse(allMeadows, {
      minMatchCharLength: 1,
      keys: ["name"],
    });
    return fuse.search(searchText).map((result) => result.item);
  }, [meadows, searchText]);

  // Meadows have no usage code, so they're hidden while filtering by usage
  const showPlotsSection = areaTypeFilter !== "meadows";
  const showMeadowsSection =
    showMeadowsAllowed &&
    (meadows?.length ?? 0) > 0 &&
    areaTypeFilter !== "plots" &&
    !usageFilterActive;

  const activePlots = filteredPlots.filter((plot) => plot.archivedAt === null);
  const activeMeadows = filteredMeadows.filter(
    (meadow) => meadow.archivedAt === null,
  );
  const archivedEntries: ListEntry[] = [
    ...(showPlotsSection
      ? filteredPlots
          .filter((plot) => plot.archivedAt !== null)
          .map((plot): ListEntry => ({ kind: "plot", plot }))
      : []),
    ...(showMeadowsSection
      ? filteredMeadows
          .filter((meadow) => meadow.archivedAt !== null)
          .map((meadow): ListEntry => ({ kind: "meadow", meadow }))
      : []),
  ];
  // The toggle is only offered when there is something archived at all
  const hasArchivedAreas =
    (plots ?? []).some((plot) => plot.archivedAt !== null) ||
    (showMeadowsAllowed &&
      (meadows ?? []).some((meadow) => meadow.archivedAt !== null));

  const sections: { title: string; data: ListEntry[] }[] = [];
  if (showPlotsSection && activePlots.length > 0) {
    sections.push({
      title: t("plots.plots"),
      data: activePlots.map((plot): ListEntry => ({ kind: "plot", plot })),
    });
  }
  if (showMeadowsSection && activeMeadows.length > 0) {
    sections.push({
      title: t("animals.meadows.meadows"),
      data: activeMeadows.map(
        (meadow): ListEntry => ({ kind: "meadow", meadow }),
      ),
    });
  }
  if (showArchived && archivedEntries.length > 0) {
    sections.push({ title: t("archive.archived"), data: archivedEntries });
  }

  const hasNoAreas =
    plots !== undefined &&
    plots.length === 0 &&
    (!showMeadowsAllowed || (meadows?.length ?? 0) === 0);

  function toggleUsageCode(code: number) {
    setSelectedUsageCodes((previous) => {
      const next = new Set(previous);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }

  const renderItem = useCallback(
    ({
      item,
      index,
      section,
    }: {
      item: ListEntry;
      index: number;
      section: { data: ListEntry[] };
    }) => {
      // Each section is drawn as one rounded card
      const isLastInSection = index === section.data.length - 1;
      const isArchived =
        item.kind === "plot"
          ? item.plot.archivedAt !== null
          : item.meadow.archivedAt !== null;
      const cardCornerStyle = {
        borderTopLeftRadius: index === 0 ? 10 : 0,
        borderTopRightRadius: index === 0 ? 10 : 0,
        borderBottomLeftRadius: isLastInSection ? 10 : 0,
        borderBottomRightRadius: isLastInSection ? 10 : 0,
        // Archived entries are dimmed
        opacity: isArchived ? 0.6 : 1,
      };
      if (item.kind === "plot") {
        const plot = item.plot;
        return (
          <ListItem
            style={cardCornerStyle}
            hideBottomDivider={isLastInSection}
            onPress={() =>
              navigation.navigate("PlotDetails", { plotId: plot.id })
            }
          >
            <ListItem.Content>
              <View style={{ flexDirection: "row" }}>
                <ListItem.Title numberOfLines={1} style={{ flex: 1 }}>
                  {plot.name}
                </ListItem.Title>
                <ListItem.Body> ({plot.size / 100}a)</ListItem.Body>
              </View>
              <ListItem.Body numberOfLines={1}>
                {t("crops.crop")}:{" "}
                {plot.currentCropRotation?.crop.name ?? t("crops.no_crop")}
              </ListItem.Body>
              {typeof plot.usage === "number" ? (
                <ListItem.Body numberOfLines={1}>
                  {t("forms.labels.usagecode")}: {plot.usage}
                </ListItem.Body>
              ) : null}
              {plot.localId ? (
                <ListItem.Body>
                  {t("forms.labels.local_id")}: {plot.localId}
                </ListItem.Body>
              ) : null}
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        );
      }
      const meadow = item.meadow;
      return (
        <ListItem
          style={cardCornerStyle}
          hideBottomDivider={isLastInSection}
          onPress={() =>
            navigation.navigate("MeadowOverview", { meadowId: meadow.id })
          }
        >
          <ListItem.Content>
            <View style={{ flexDirection: "row" }}>
              <ListItem.Title numberOfLines={1} style={{ flex: 1 }}>
                {meadow.name}
              </ListItem.Title>
              <ListItem.Body> ({round(meadow.size / 100, 1)}a)</ListItem.Body>
            </View>
            {/* The archived section mixes plots and meadows */}
            {isArchived ? (
              <ListItem.Body>{t("animals.meadows.meadow")}</ListItem.Body>
            ) : null}
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      );
    },
    [navigation, t],
  );

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("plots.list.open_map")}
            // With archived ones listed, the map shows them too (for this visit)
            onPress={() =>
              navigation.navigate("PlotsMap", { showArchived: showArchived })
            }
          />
        </BottomActionContainer>
      }
    >
      <H2>{t("plots.list.title")}</H2>
      <View style={{ marginTop: theme.spacing.m }}>
        <TextInput
          hideLabel
          placeholder={t("forms.placeholders.search")}
          onChangeText={setSearchText}
          value={searchText}
        />
      </View>
      <View style={{ marginVertical: theme.spacing.s }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: theme.spacing.xs }}
        >
          {showMeadowsAllowed && (meadows?.length ?? 0) > 0 ? (
            <>
              <Chip
                label={t("plots.list.filter_all")}
                active={areaTypeFilter === "all"}
                onPress={() => setAreaTypeFilter("all")}
              />
              <Chip
                label={t("plots.plots")}
                active={areaTypeFilter === "plots"}
                onPress={() => setAreaTypeFilter("plots")}
              />
              <Chip
                label={t("animals.meadows.meadows")}
                active={areaTypeFilter === "meadows"}
                onPress={() => {
                  setAreaTypeFilter("meadows");
                  setSelectedUsageCodes(new Set());
                }}
              />
            </>
          ) : null}
          {areaTypeFilter !== "meadows" && availableUsageCodes.length > 0 ? (
            <Chip
              label={
                usageFilterActive
                  ? t("plots.list.filter_usage_count", {
                      count: selectedUsageCodes.size,
                    })
                  : t("forms.labels.usage")
              }
              accent={!usageFilterActive}
              active={usageFilterActive}
              onPress={() => setUsageFilterVisible(true)}
              onRemove={
                usageFilterActive
                  ? () => setSelectedUsageCodes(new Set())
                  : undefined
              }
            />
          ) : null}
          {hasArchivedAreas ? (
            <Chip
              label={t("archive.archived")}
              active={showArchived}
              onPress={() => setShowArchived((previous) => !previous)}
            />
          ) : null}
        </ScrollView>
      </View>
      <SectionList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: theme.spacing.m }}
        sections={sections}
        keyExtractor={(item) =>
          item.kind === "plot" ? item.plot.id : item.meadow.id
        }
        renderItem={renderItem}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <H3
            style={{
              paddingTop: theme.spacing.m,
              paddingBottom: theme.spacing.xs,
              backgroundColor: theme.colors.background,
            }}
          >
            {section.title} ({section.data.length})
          </H3>
        )}
        ListEmptyComponent={
          hasNoAreas ? (
            <PlotsEmptyState />
          ) : plots !== undefined ? (
            <Body style={{ marginTop: theme.spacing.m }}>
              {t("plots.list.no_results")}
            </Body>
          ) : null
        }
      />

      <UsageCodeFilterModal
        visible={usageFilterVisible}
        onClose={() => setUsageFilterVisible(false)}
        availableUsageCodes={availableUsageCodes}
        selectedUsageCodes={selectedUsageCodes}
        onToggle={toggleUsageCode}
        onReset={() => setSelectedUsageCodes(new Set())}
      />
    </ContentView>
  );
}

function UsageCodeFilterModal({
  visible,
  onClose,
  availableUsageCodes,
  selectedUsageCodes,
  onToggle,
  onReset,
}: {
  visible: boolean;
  onClose: () => void;
  availableUsageCodes: { code: number; name: string }[];
  selectedUsageCodes: Set<number>;
  onToggle: (code: number) => void;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + theme.spacing.m,
          paddingHorizontal: theme.spacing.m,
          backgroundColor: theme.colors.background,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <H2>{t("plots.list.usage_filter_heading")}</H2>
          <IonIconButton
            icon="close"
            type="ghost"
            iconSize={28}
            color={theme.colors.primary}
            onPress={onClose}
          />
        </View>
        <FlatList
          style={{ marginTop: theme.spacing.m }}
          contentContainerStyle={{
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: theme.colors.white,
          }}
          data={availableUsageCodes}
          keyExtractor={(item) => item.code.toString()}
          renderItem={({ item, index }) => (
            <ListItem
              onPress={() => onToggle(item.code)}
              hideBottomDivider={index === availableUsageCodes.length - 1}
            >
              <Checkbox
                checked={selectedUsageCodes.has(item.code)}
                onPress={() => onToggle(item.code)}
                color={theme.colors.primary}
              />
              <ListItem.Content>
                <ListItem.Title numberOfLines={2}>
                  {item.name} ({item.code})
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>
          )}
        />
        <View
          style={{
            flexDirection: "row",
            gap: theme.spacing.s,
            paddingVertical: theme.spacing.m,
            paddingBottom: insets.bottom + theme.spacing.s,
          }}
        >
          <Button
            style={{ flex: 1 }}
            type="accent"
            title={t("plots.list.reset")}
            onPress={onReset}
          />
          <Button
            style={{ flex: 1 }}
            title={t("buttons.finish")}
            onPress={onClose}
          />
        </View>
      </View>
    </Modal>
  );
}
