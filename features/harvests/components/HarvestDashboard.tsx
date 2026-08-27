import { CategoryFilter } from "@/components/charts/CategoryFilter";
import {
  ChartMode,
  ChartViewSwitcher,
} from "@/components/charts/ChartViewSwitcher";
import { MonthCartesianChart } from "@/components/charts/MonthCartesianChart";
import { UnitBreakdownEntry } from "@/components/charts/unitBreakdown";
import { scaleUnit } from "@/components/charts/unitScaling";
import { YearMultiSelect } from "@/components/charts/YearMultiSelect";
import { Card } from "@/components/card/Card";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { HarvestSummary } from "@/api/harvests.api";
import {
  accumulateProducedUnitsUpToMonth,
  aggregateHarvestsByCropAndMethod,
  aggregateProducedUnitsByYearMonth,
  isConservationMethod,
} from "../harvestUtils";

const MAX_SELECTED_YEARS = 5;

type HarvestDashboardProps = {
  harvestSummaries: HarvestSummary[];
};

export function HarvestDashboard({ harvestSummaries }: HarvestDashboardProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  // Used for consistent year → color mapping across every card, even though
  // each card now picks its own years independently.
  const availableYears = useMemo(
    () =>
      [...new Set(harvestSummaries.map((s) => s.year))].sort((a, b) => b - a),
    [harvestSummaries],
  );

  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);

  const toggleCrop = useCallback((crop: string) => {
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop],
    );
  }, []);

  const allCrops = useMemo(
    () => [
      ...new Set(
        harvestSummaries.flatMap((s) =>
          s.producedQuantities
            .filter((pq) => pq.totalAmountInKilos > 0)
            .map((pq) => pq.forageName),
        ),
      ),
    ],
    [harvestSummaries],
  );
  const visibleCrops = selectedCrops.length === 0 ? allCrops : selectedCrops;

  const cropData = useMemo(
    () => aggregateHarvestsByCropAndMethod(harvestSummaries),
    [harvestSummaries],
  );

  const perUnitLabel = t("units.short.kg");

  return (
    <View style={{ gap: theme.spacing.m }}>
      {/* Crop filter */}
      {allCrops.length > 1 && (
        <CategoryFilter
          items={allCrops}
          selected={selectedCrops}
          onToggle={toggleCrop}
        />
      )}

      {/* Per crop → per conservation method */}
      {visibleCrops.map((cropName) => {
        const conservationMethods = cropData[cropName];
        if (!conservationMethods) return null;
        const cmKeys = Object.keys(conservationMethods);

        return cmKeys.map((cm) => {
          const { monthly, total } = conservationMethods[cm];
          return (
            <HarvestCropCard
              key={`${cropName}-${cm}`}
              cropName={cropName}
              conservationMethod={cm}
              monthly={monthly}
              total={total}
              harvestSummaries={harvestSummaries}
              availableYears={availableYears}
              perUnitLabel={perUnitLabel}
            />
          );
        });
      })}
    </View>
  );
}

type HarvestCropCardProps = {
  cropName: string;
  conservationMethod: string;
  monthly: Record<number, number[]>;
  total: Record<number, number>;
  harvestSummaries: HarvestSummary[];
  // All years with data across the whole dashboard, used only for a
  // consistent year → color mapping (this card's own selectable years are
  // narrower — see cardYears below).
  availableYears: number[];
  perUnitLabel: string;
};

// One crop × conservation-method card: title + chart-mode switcher on one
// line, its own year selector + legend, then the chart.
function HarvestCropCard({
  cropName,
  conservationMethod,
  monthly,
  total,
  harvestSummaries,
  availableYears,
  perUnitLabel,
}: HarvestCropCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [chartMode, setChartMode] = useState<ChartMode>("cumulative");

  // Years this crop/method actually has data for (monthly covers every year
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

  // Pick display unit based on the max total kg across this card's selected years
  const maxKg = Math.max(0, ...selectedYears.map((year) => total[year] ?? 0));
  const unit = scaleUnit("kg", maxKg);

  const cmLabel =
    conservationMethod !== "none" && isConservationMethod(conservationMethod)
      ? t(`harvests.labels.conservation_method.${conservationMethod}`)
      : undefined;
  const cardTitle = cmLabel ? `${cropName} - ${cmLabel}` : cropName;

  const breakdownByYearMonth = useMemo(
    () =>
      aggregateProducedUnitsByYearMonth(
        harvestSummaries,
        cropName,
        conservationMethod,
      ),
    [harvestSummaries, cropName, conservationMethod],
  );

  const getBreakdown = (year: number, month: number): UnitBreakdownEntry[] => {
    const rows =
      chartMode === "cumulative"
        ? accumulateProducedUnitsUpToMonth(breakdownByYearMonth, year, month)
        : (breakdownByYearMonth[year]?.[month] ?? []);
    return rows
      .filter((row) => row.totalProducedUnits > 0)
      .map((row) => ({
        label: t(`harvests.labels.unit.${row.unit}`, {
          defaultValue: row.unit,
        }),
        count: row.totalProducedUnits,
        amountPerUnit: row.totalAmountInKilos / row.totalProducedUnits,
      }));
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
        <Card.Title style={{ flex: 1 }}>{cardTitle}</Card.Title>
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
          unit={unit}
          perUnitLabel={perUnitLabel}
          getBreakdown={getBreakdown}
        />
      </Card.Content>
    </Card>
  );
}
