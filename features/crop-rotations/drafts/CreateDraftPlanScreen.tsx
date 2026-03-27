import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { H2, Subtitle } from "@/theme/Typography";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { useFarmPlotsQuery } from "@/features/plots/plots.hooks";
import {
  useCropRotationsByPlotIdsQuery,
  useCreateDraftPlanMutation,
} from "../crop-rotations.hooks";
import { CreateDraftPlanScreenProps } from "../navigation/crop-rotations-routes.d";
import { Plot } from "@/api/plots.api";

const SEED_FROM_YEARS_BACK = 10;
const SEED_TO_YEARS_FORWARD = 10;

export function CreateDraftPlanScreen({ navigation }: CreateDraftPlanScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [draftName, setDraftName] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState("");

  const { plots, isLoading: plotsLoading } = useFarmPlotsQuery();

  const seedFromDate = useMemo(
    () => new Date(new Date().getFullYear() - SEED_FROM_YEARS_BACK, 0, 1),
    [],
  );
  const seedToDate = useMemo(
    () => new Date(new Date().getFullYear() + SEED_TO_YEARS_FORWARD + 1, 0, 1),
    [],
  );

  const allPlotIds = useMemo(() => (plots ?? []).map((p) => p.id), [plots]);

  // Fetch base rotation definitions (not expanded occurrences) so the seed
  // payload stays small regardless of how many recurring rotations exist.
  const { plotCropRotations: cropRotations } = useCropRotationsByPlotIdsQuery(
    allPlotIds,
    seedFromDate,
    seedToDate,
    { onlyCurrent: false, expand: false, includeRecurrence: true },
    allPlotIds.length > 0,
  );

  const createMutation = useCreateDraftPlanMutation(
    (plan) => {
      navigation.replace("DraftPlanDetail", { draftPlanId: plan.id });
    },
  );

  const sortedPlots = useMemo((): Plot[] => {
    if (!plots) return [];
    return [...plots].sort((a, b) => a.name.localeCompare(b.name));
  }, [plots]);

  const filteredPlots = useMemo((): Plot[] => {
    const query = searchText.trim().toLowerCase();
    if (!query) return sortedPlots;
    return sortedPlots.filter((p) => p.name.toLowerCase().includes(query));
  }, [sortedPlots, searchText]);

  function toggleSelection(plotId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(plotId)) next.delete(plotId);
      else next.add(plotId);
      return next;
    });
  }

  function handleSelectAll() {
    setSelectedIds(new Set(filteredPlots.map((p) => p.id)));
  }

  function handleClearAll() {
    setSelectedIds(new Set());
  }

  function handleCreate() {
    if (!draftName.trim()) return;

    // Group rotations by plotId to match the new plots-based schema
    const plotRotationsMap = new Map<string, { cropId: string; fromDate: string; toDate: string; recurrenceInterval?: number; recurrenceUntil?: string }[]>();
    for (const r of (cropRotations ?? [])) {
      if (!selectedIds.has(r.plotId)) continue;
      if (!plotRotationsMap.has(r.plotId)) plotRotationsMap.set(r.plotId, []);
      plotRotationsMap.get(r.plotId)!.push({
        cropId: r.cropId,
        fromDate: r.fromDate,
        toDate: r.toDate,
        recurrenceInterval: r.recurrence?.interval,
        recurrenceUntil: r.recurrence?.until ?? undefined,
      });
    }
    // Also include selected plots that have no rotations (empty entry in draft)
    for (const id of selectedIds) {
      if (!plotRotationsMap.has(id)) plotRotationsMap.set(id, []);
    }
    const plots = Array.from(plotRotationsMap.entries()).map(([plotId, rotations]) => ({ plotId, rotations }));

    createMutation.mutate({ name: draftName.trim(), plots });
  }

  const renderItem = useCallback(
    ({ item }: { item: Plot }) => (
      <ListItem
        style={{ paddingVertical: 5 }}
        onPress={() => toggleSelection(item.id)}
      >
        <ListItem.Checkbox checked={selectedIds.has(item.id)} />
        <ListItem.Content>
          <ListItem.Title>{item.name}</ListItem.Title>
        </ListItem.Content>
      </ListItem>
    ),
    [selectedIds],
  );

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("crop_rotations.draft_plans.create")}
            onPress={handleCreate}
            disabled={!draftName.trim() || createMutation.isPending || plotsLoading}
            loading={createMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <H2>{t("crop_rotations.draft_plans.create")}</H2>

      {/* Name input */}
      <View
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: theme.radii.m,
          paddingHorizontal: 14,
          marginTop: theme.spacing.m,
          borderWidth: 1,
          borderColor: theme.colors.gray3,
        }}
      >
        <RNTextInput
          value={draftName}
          onChangeText={setDraftName}
          placeholder={t("crop_rotations.draft_plans.name_placeholder")}
          placeholderTextColor={theme.colors.gray2}
          style={{
            paddingVertical: 12,
            fontSize: 15,
            color: theme.colors.gray0,
          }}
        />
      </View>

      {/* Subtitle for plot selection */}
      <Subtitle style={{ marginTop: theme.spacing.m, color: theme.colors.gray1 }}>
        {t("crop_rotations.draft_plans.select_plots_to_seed")}
      </Subtitle>

      {/* Search bar for plots */}
      <View
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: theme.radii.m,
          paddingHorizontal: 14,
          marginTop: theme.spacing.s,
          borderWidth: 1,
          borderColor: theme.colors.gray3,
        }}
      >
        <RNTextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder={t("forms.placeholders.search")}
          placeholderTextColor={theme.colors.gray2}
          style={{
            paddingVertical: 10,
            fontSize: 15,
            color: theme.colors.gray0,
          }}
        />
      </View>

      {/* Select all / clear */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: theme.spacing.m,
        }}
      >
        <TouchableOpacity onPress={handleSelectAll}>
          <Subtitle style={{ color: theme.colors.primary }}>
            {t("treatments.select_all", { count: filteredPlots.length })}
          </Subtitle>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClearAll}>
          <Subtitle style={{ color: theme.colors.gray1 }}>
            {t("treatments.clear_selection")}
          </Subtitle>
        </TouchableOpacity>
      </View>

      {/* Plot list */}
      <View style={{ marginTop: theme.spacing.s, flex: 1 }}>
        <FlatList
          contentContainerStyle={{
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            overflow: "hidden",
            backgroundColor:
              filteredPlots.length > 0 ? theme.colors.white : undefined,
          }}
          data={filteredPlots}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </View>
    </ContentView>
  );
}
