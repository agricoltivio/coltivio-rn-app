import { PlotSowing, Sowing, SowingSummary } from "@/api/sowings.api";
import { CategoryFilter } from "@/components/charts/CategoryFilter";
import { ChartPager } from "@/components/charts/ChartPager";
import {
  ChartMode,
  ChartViewSwitcher,
} from "@/components/charts/ChartViewSwitcher";
import { MonthCartesianChart } from "@/components/charts/MonthCartesianChart";
import { scaleUnit, UnitScale } from "@/components/charts/unitScaling";
import { YearMultiSelect } from "@/components/charts/YearMultiSelect";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { H3, Headline, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import Fuse from "fuse.js";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useSowingUnitsQuery } from "../sowings.hooks";
import { formatBaseAmount } from "../sowingUnits";

const MAX_SELECTED_YEARS = 5;

// One chart per seed (or crop when sown without a seed) and quantity kind,
// weight and count can never share an axis
type SowingSeries = {
  key: string;
  cropName: string;
  title: string;
  // seeds or plants, null for weight
  countUnit: "seeds" | "plants" | null;
  // year -> 12 monthly values, kg for weight, pieces for seeds / plants
  monthly: Record<number, number[]>;
};

type SowingOverviewProps = {
  summaries: SowingSummary[];
  sowings: (Sowing | PlotSowing)[];
  onPressSowing: (sowingId: string) => void;
};

// Crop chips on top filter both the chart carousel and the searchable list below
export function SowingOverview({
  summaries,
  sowings,
  onPressSowing,
}: SowingOverviewProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { sowingUnits } = useSowingUnitsQuery();
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");

  const allCrops = useMemo(
    () => [...new Set(sowings.map((sowing) => sowing.crop.name))].sort(),
    [sowings],
  );
  const visibleCrops = selectedCrops.length === 0 ? allCrops : selectedCrops;

  const toggleCrop = useCallback((cropName: string) => {
    setSelectedCrops((prev) =>
      prev.includes(cropName)
        ? prev.filter((name) => name !== cropName)
        : [...prev, cropName],
    );
  }, []);

  // Year -> color mapping stays the same on every chart
  const availableYears = useMemo(
    () =>
      [...new Set(summaries.map((summary) => summary.year))].sort(
        (a, b) => b - a,
      ),
    [summaries],
  );

  const series = useMemo(() => {
    const seriesByKey = new Map<string, SowingSeries>();
    for (const summary of summaries) {
      for (const sownSeed of summary.sownSeeds) {
        if (!visibleCrops.includes(sownSeed.cropName)) continue;
        const key = `${sownSeed.cropId}-${sownSeed.seedId ?? "none"}-${sownSeed.countUnit ?? "weight"}`;
        let entry = seriesByKey.get(key);
        if (!entry) {
          entry = {
            key,
            cropName: sownSeed.cropName,
            // the same seed can be counted as seeds and as plants, both get a chart
            title:
              (sownSeed.seedName
                ? `${sownSeed.cropName} – ${sownSeed.seedName}`
                : sownSeed.cropName) +
              (sownSeed.countUnit
                ? ` (${t(`sowings.units.${sownSeed.countUnit}`)})`
                : ""),
            countUnit: sownSeed.countUnit,
            monthly: {},
          };
          seriesByKey.set(key, entry);
        }
        if (!entry.monthly[summary.year]) {
          entry.monthly[summary.year] = Array.from({ length: 12 }, () => 0);
        }
        // base amounts are grams for weight, the chart works in kg
        entry.monthly[summary.year][summary.month] += sownSeed.countUnit
          ? sownSeed.totalBaseAmount
          : sownSeed.totalBaseAmount / 1000;
      }
    }
    return [...seriesByKey.values()].sort((a, b) =>
      a.title.localeCompare(b.title),
    );
  }, [summaries, visibleCrops, t]);

  const listSections = useMemo(() => {
    const items = sowings
      .filter((sowing) => visibleCrops.includes(sowing.crop.name))
      .map((sowing) => {
        const unitInfo = sowingUnits?.find((info) => info.unit === sowing.unit);
        return {
          id: sowing.id,
          rawDate: sowing.date,
          date: formatLocalizedDate(
            new Date(sowing.date),
            i18n.language,
            "long",
            false,
          ),
          plotName: "plot" in sowing ? sowing.plot.name : undefined,
          cropName: sowing.crop.name,
          seedName: sowing.seed?.name,
          amount: `${sowing.amount} ${t(`sowings.units.${sowing.unit}`)}`,
          total: unitInfo
            ? formatBaseAmount(sowing.totalBaseAmount, unitInfo, t)
            : undefined,
        };
      });

    let filtered = items;
    if (searchText) {
      const fuse = new Fuse(items, {
        minMatchCharLength: 1,
        keys: ["date", "plotName", "cropName", "seedName"],
      });
      filtered = fuse.search(searchText).map((result) => result.item);
    }

    // grouped by year, newest first
    const byYear: Record<number, typeof filtered> = {};
    for (const item of filtered) {
      const year = new Date(item.rawDate).getFullYear();
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(item);
    }
    return Object.keys(byYear)
      .map(Number)
      .sort((a, b) => b - a)
      .map((year) => ({
        year,
        items: byYear[year].sort(
          (a, b) =>
            new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime(),
        ),
      }));
  }, [sowings, sowingUnits, visibleCrops, searchText, t, i18n.language]);

  return (
    <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.m }}>
      {allCrops.length > 1 && (
        <CategoryFilter
          items={allCrops}
          selected={selectedCrops}
          onToggle={toggleCrop}
        />
      )}

      {series.length > 0 && (
        <ChartPager
          pages={series.map((entry) => ({
            key: entry.key,
            content: (
              <SowingChartPage series={entry} availableYears={availableYears} />
            ),
          }))}
        />
      )}

      <TextInput
        hideLabel
        placeholder={t("forms.placeholders.search")}
        onChangeText={setSearchText}
        value={searchText}
      />

      {listSections.length === 0 ? (
        <Headline>{t("common.no_entries")}</Headline>
      ) : (
        listSections.map(({ year, items }) => (
          <View key={year}>
            <H3 style={{ paddingHorizontal: theme.spacing.xs }}>{year}</H3>
            <View
              style={{
                marginTop: theme.spacing.s,
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
            >
              {items.map((item) => (
                <ListItem key={item.id} onPress={() => onPressSowing(item.id)}>
                  <ListItem.Content>
                    <ListItem.Title style={{ flex: 1 }}>
                      {item.plotName
                        ? t("plots.plot_name_date", {
                            name: item.plotName,
                            date: item.date,
                          })
                        : item.date}
                    </ListItem.Title>
                    <ListItem.Body>
                      {[item.cropName, item.seedName, item.amount, item.total]
                        .filter(Boolean)
                        .join(", ")}
                    </ListItem.Body>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
              ))}
            </View>
          </View>
        ))
      )}
    </View>
  );
}

// One carousel page: title + chart mode, its own year selection, then the chart
function SowingChartPage({
  series,
  availableYears,
}: {
  series: SowingSeries;
  availableYears: number[];
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [chartMode, setChartMode] = useState<ChartMode>("cumulative");

  const seriesYears = useMemo(
    () =>
      Object.keys(series.monthly)
        .map(Number)
        .sort((a, b) => b - a),
    [series.monthly],
  );
  const [selectedYears, setSelectedYears] = useState<number[]>(() =>
    seriesYears.length > 0 ? [seriesYears[0]] : [],
  );

  const toggleYear = useCallback((year: number) => {
    setSelectedYears((prev) => {
      if (prev.includes(year)) {
        if (prev.length === 1) return prev;
        return prev.filter((selectedYear) => selectedYear !== year);
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

  const yearTotals = selectedYears.map((year) =>
    (series.monthly[year] ?? []).reduce((sum, value) => sum + value, 0),
  );
  const unit: UnitScale = series.countUnit
    ? { label: t(`sowings.units.${series.countUnit}`), divisor: 1 }
    : scaleUnit("kg", Math.max(0, ...yearTotals));

  return (
    <View style={{ gap: theme.spacing.s }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Subtitle style={{ flex: 1, fontWeight: "600" }}>
          {series.title}
        </Subtitle>
        <ChartViewSwitcher
          value={chartMode}
          onChange={setChartMode}
          options={chartViewOptions}
        />
      </View>
      {seriesYears.length > 1 && (
        <YearMultiSelect
          years={seriesYears}
          selectedYears={selectedYears}
          onToggle={toggleYear}
        />
      )}
      <MonthCartesianChart
        mode={chartMode}
        monthlyData={series.monthly}
        selectedYears={selectedYears}
        availableYears={availableYears}
        unit={unit}
        perUnitLabel={unit.label}
      />
    </View>
  );
}
