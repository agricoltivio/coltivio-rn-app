import { FertilizerApplicationSummary } from "@/api/fertilizerApplications.api";
import { Card } from "@/components/card/Card";
import { CategoryFilter } from "@/components/charts/CategoryFilter";
import {
  ChartMode,
  ChartViewSwitcher,
} from "@/components/charts/ChartViewSwitcher";
import { MonthCartesianChart } from "@/components/charts/MonthCartesianChart";
import { UnitBreakdownEntry } from "@/components/charts/unitBreakdown";
import { scaleUnit } from "@/components/charts/unitScaling";
import { YearMultiSelect } from "@/components/charts/YearMultiSelect";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  accumulateAppliedFertilizersUpToMonth,
  aggregateAppliedFertilizersByYearMonth,
  aggregateFertilizerApplicationsByName,
} from "../fertilizerApplications.utils";

const MAX_SELECTED_YEARS = 5;

type FertilizerApplicationDashboardProps = {
  summaries: FertilizerApplicationSummary[];
};

export function FertilizerApplicationDashboard({
  summaries,
}: FertilizerApplicationDashboardProps) {
  const theme = useTheme();

  // Used for consistent year → color mapping across every card, even though
  // each card now picks its own years independently.
  const availableYears = useMemo(
    () => [...new Set(summaries.map((s) => s.year))].sort((a, b) => b - a),
    [summaries],
  );

  const [selectedFertilizers, setSelectedFertilizers] = useState<string[]>(
    [],
  );

  const toggleFertilizer = useCallback((name: string) => {
    setSelectedFertilizers((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  }, []);

  const allFertilizers = useMemo(
    () => [
      ...new Set(
        summaries.flatMap((s) =>
          s.appliedFertilizers
            .filter((af) => af.totalAmount > 0)
            .map((af) => af.fertilizerName),
        ),
      ),
    ],
    [summaries],
  );
  const visibleFertilizers =
    selectedFertilizers.length === 0 ? allFertilizers : selectedFertilizers;

  const fertData = useMemo(
    () => aggregateFertilizerApplicationsByName(summaries),
    [summaries],
  );

  return (
    <View style={{ gap: theme.spacing.m }}>
      {allFertilizers.length > 1 && (
        <CategoryFilter
          items={allFertilizers}
          selected={selectedFertilizers}
          onToggle={toggleFertilizer}
        />
      )}

      {visibleFertilizers.map((fertName) => {
        const data = fertData[fertName];
        if (!data) return null;
        return (
          <FertilizerCard
            key={fertName}
            fertilizerName={fertName}
            unit={data.unit}
            monthly={data.monthly}
            summaries={summaries}
            availableYears={availableYears}
          />
        );
      })}
    </View>
  );
}

type FertilizerCardProps = {
  fertilizerName: string;
  unit: string;
  monthly: Record<number, number[]>;
  summaries: FertilizerApplicationSummary[];
  // All years with data across the whole dashboard, used only for a
  // consistent year → color mapping (this card's own selectable years are
  // narrower — see cardYears below).
  availableYears: number[];
};

// One fertilizer's card: title + chart-mode switcher on one line, its own
// year selector + legend, then the chart.
function FertilizerCard({
  fertilizerName,
  unit,
  monthly,
  summaries,
  availableYears,
}: FertilizerCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [chartMode, setChartMode] = useState<ChartMode>("cumulative");

  // Years this fertilizer actually has data for (monthly covers every year
  // present in the summaries, not just a globally selected range).
  const cardYears = useMemo(
    () =>
      Object.keys(monthly)
        .map(Number)
        .sort((a, b) => b - a),
    [monthly],
  );
  const [selectedYears, setSelectedYears] = useState<number[]>(() =>
    cardYears.length > 0 ? [cardYears[0]] : [],
  );

  const toggleYear = useCallback((year: number) => {
    setSelectedYears((prev) => {
      if (prev.includes(year)) {
        if (prev.length === 1) return prev;
        return prev.filter((y) => y !== year);
      }
      if (prev.length >= MAX_SELECTED_YEARS) return prev;
      return [...prev, year].sort((a, b) => a - b);
    });
  }, []);

  const chartViewOptions = useMemo(
    () => [
      { key: "cumulative" as const, label: t("harvests.chart_total") },
      { key: "monthly" as const, label: t("harvests.chart_per_month") },
    ],
    [t],
  );

  // Find the max raw amount across this card's selected years/months to pick
  // the right unit scale
  let maxAmount = 0;
  for (const year of selectedYears) {
    for (const v of monthly[year] ?? []) {
      if (v > maxAmount) maxAmount = v;
    }
  }
  const displayUnit = scaleUnit(unit, maxAmount);
  const perUnitLabel = t(`units.short.${unit}`, { defaultValue: unit });

  const breakdownByYearMonth = useMemo(
    () => aggregateAppliedFertilizersByYearMonth(summaries, fertilizerName),
    [summaries, fertilizerName],
  );

  const getBreakdown = (
    year: number,
    month: number,
  ): UnitBreakdownEntry[] => {
    const row =
      chartMode === "cumulative"
        ? accumulateAppliedFertilizersUpToMonth(
            breakdownByYearMonth,
            year,
            month,
          )
        : (breakdownByYearMonth[year]?.[month] ?? {
            totalAmount: 0,
            totalProducedUnits: 0,
          });
    if (row.totalProducedUnits === 0) return [];
    return [
      {
        label: t("common.applications"),
        count: row.totalProducedUnits,
        amountPerUnit: row.totalAmount / row.totalProducedUnits,
      },
    ];
  };

  return (
    <Card>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Card.Title style={{ flex: 1 }}>{fertilizerName}</Card.Title>
        <ChartViewSwitcher
          value={chartMode}
          onChange={setChartMode}
          options={chartViewOptions}
        />
      </View>
      <Card.Content style={{ gap: theme.spacing.s }}>
        {cardYears.length > 1 && (
          <YearMultiSelect
            years={cardYears}
            selectedYears={selectedYears}
            onToggle={toggleYear}
          />
        )}
        <MonthCartesianChart
          mode={chartMode}
          monthlyData={monthly}
          selectedYears={selectedYears}
          availableYears={availableYears}
          unit={displayUnit}
          perUnitLabel={perUnitLabel}
          getBreakdown={getBreakdown}
        />
      </Card.Content>
    </Card>
  );
}
