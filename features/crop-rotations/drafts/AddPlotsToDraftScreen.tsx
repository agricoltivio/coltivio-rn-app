import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { Subtitle } from "@/theme/Typography";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { useFarmPlotsQuery } from "@/features/plots/plots.hooks";
import { Plot } from "@/api/plots.api";
import {
  useCropRotationsByPlotIdsQuery,
  useDraftPlanQuery,
  useUpdateDraftPlanMutation,
} from "../crop-rotations.hooks";
import { addYears, subYears } from "date-fns";
import { AddPlotsToDraftScreenProps } from "../navigation/crop-rotations-routes.d";

const SEED_FROM_YEARS_BACK = 10;
const SEED_TO_YEARS_FORWARD = 10;

export function AddPlotsToDraftScreen({ route, navigation }: AddPlotsToDraftScreenProps) {
  const { draftPlanId } = route.params;
  const { t } = useTranslation();
  const theme = useTheme();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);
  const [searchText, setSearchText] = useState("");

  const { plots, isLoading: plotsLoading } = useFarmPlotsQuery();
  const { draftPlan, isLoading: draftLoading } = useDraftPlanQuery(draftPlanId);

  const seedFromDate = useMemo(() => subYears(new Date(), SEED_FROM_YEARS_BACK), []);
  const seedToDate = useMemo(() => addYears(new Date(), SEED_TO_YEARS_FORWARD), []);
  const allPlotIds = useMemo(() => (plots ?? []).map((p) => p.id), [plots]);

  const { plotCropRotations: cropRotations } = useCropRotationsByPlotIdsQuery(
    allPlotIds,
    seedFromDate,
    seedToDate,
    { onlyCurrent: false, expand: false, includeRecurrence: true },
    allPlotIds.length > 0,
  );

  // Pre-select plots already in the draft once data loads
  useEffect(() => {
    if (!initialized && draftPlan) {
      setSelectedIds(new Set(draftPlan.plots.map((p) => p.plotId)));
      setInitialized(true);
    }
  }, [draftPlan, initialized]);

  const updateMutation = useUpdateDraftPlanMutation(() => {
    navigation.goBack();
  });

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

  function handleSave() {
    if (!draftPlan) return;

    const existingByPlotId = new Map(draftPlan.plots.map((p) => [p.plotId, p]));

    // Seed rotations from farm for newly added plots
    const seedRotationsByPlotId = new Map<string, { cropId: string; fromDate: string; toDate: string; recurrenceInterval?: number; recurrenceUntil?: string }[]>();
    for (const r of (cropRotations ?? [])) {
      if (!selectedIds.has(r.plotId) || existingByPlotId.has(r.plotId)) continue;
      if (!seedRotationsByPlotId.has(r.plotId)) seedRotationsByPlotId.set(r.plotId, []);
      seedRotationsByPlotId.get(r.plotId)!.push({
        cropId: r.cropId,
        fromDate: r.fromDate,
        toDate: r.toDate,
        recurrenceInterval: r.recurrence?.interval,
        recurrenceUntil: r.recurrence?.until ?? undefined,
      });
    }

    const plots = Array.from(selectedIds).map((plotId) => {
      const existing = existingByPlotId.get(plotId);
      if (existing) {
        // Preserve existing rotations for plots that remain in the draft
        return {
          plotId,
          rotations: existing.rotations.map((r) => ({
            cropId: r.cropId,
            fromDate: r.fromDate,
            toDate: r.toDate,
            sowingDate: r.sowingDate ?? undefined,
            recurrenceInterval: r.recurrence?.interval,
            recurrenceUntil: r.recurrence?.until ?? undefined,
          })),
        };
      }
      // New plot — seed with farm rotations or empty
      return { plotId, rotations: seedRotationsByPlotId.get(plotId) ?? [] };
    });

    updateMutation.mutate({ draftPlanId, plots });
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

  const isLoading = plotsLoading || draftLoading || !initialized;

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("crop_rotations.draft_plans.edit_plots")}
            onPress={handleSave}
            disabled={isLoading || updateMutation.isPending}
            loading={updateMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <Subtitle style={{ marginTop: theme.spacing.m, color: theme.colors.gray1 }}>
        {t("crop_rotations.draft_plans.select_plots_to_edit")}
      </Subtitle>

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
