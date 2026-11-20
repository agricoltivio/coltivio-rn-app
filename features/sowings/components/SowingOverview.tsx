import { PlotSowing, Sowing, SowingSummary } from "@/api/sowings.api";
import { CategoryFilter } from "@/components/charts/CategoryFilter";
import { ChartPager } from "@/components/charts/ChartPager";
import { dismissChartTooltips } from "@/components/charts/chartTooltipDismiss";
import {
  ChartMode,
  ChartViewSwitcher,
} from "@/components/charts/ChartViewSwitcher";
import {
  MAX_CHART_YEARS,
  MonthCartesianChart,
} from "@/components/charts/MonthCartesianChart";
import {
  scaleUnit,
  UnitScale,
  formatNumber,
} from "@/components/charts/unitScaling";
import { YearMultiSelect } from "@/components/charts/YearMultiSelect";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { Text } from "@/components/text/Text";
import { H3, Headline, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate, parseDateOnly } from "@/utils/date";
import Fuse from "fuse.js";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useSowingUnitsQuery } from "../sowings.hooks";
import { formatBaseAmount } from "../sowingUnits";

// Years selected when the screen opens, older ones can be added with the chips
const INITIAL_YEAR_COUNT = 3;

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

  // Years from the charts and the entries, so every entry can be shown or hidden.
  // Also keeps the year -> color mapping the same on every chart.
  const availableYears = useMemo(
    () =>
      [
        ...new Set([
          ...summaries.map((summary) => summary.year),
          ...sowings.map((sowing) => parseDateOnly(sowing.date).getFullYear()),
        ]),
      ].sort((a, b) => b - a),
    [summaries, sowings],
  );

  // One year selection for the charts and the list. Starts with the latest years and
  // stores the deselected ones, so a year with a new entry shows up right away.
  const [hiddenYears, setHiddenYears] = useState<number[]>(() =>
    availableYears.slice(INITIAL_YEAR_COUNT),
  );
  // Total / per month, the same for all charts in the carousel
  const [chartMode, setChartMode] = useState<ChartMode>("cumulative");
  const selectedYears = useMemo(
    // Ascending, the order the charts list the years in
    () =>
      availableYears
        .filter((year) => !hiddenYears.includes(year))
        .sort((a, b) => a - b)
        // A new year can push past the limit, keep the newest
        .slice(-MAX_CHART_YEARS),
    [availableYears, hiddenYears],
  );
  const toggleYear = useCallback(
    (year: number) => {
      if (hiddenYears.includes(year)) {
        if (selectedYears.length >= MAX_CHART_YEARS) {
          Alert.alert(
            t("common.max_years_selected", { count: MAX_CHART_YEARS }),
          );
          return;
        }
        setHiddenYears((prev) => prev.filter((hidden) => hidden !== year));
        return;
      }
      // At least one year stays selected
      if (selectedYears.length === 1) return;
      setHiddenYears((prev) => [...prev, year]);
    },
    [hiddenYears, selectedYears, t],
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
    // Seeds without data in the selected years get no chart page
    return [...seriesByKey.values()]
      .filter((entry) => selectedYears.some((year) => entry.monthly[year]))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [summaries, visibleCrops, selectedYears, t]);

  const listSections = useMemo(() => {
    const items = sowings
      .filter((sowing) => visibleCrops.includes(sowing.crop.name))
      .map((sowing) => {
        const unitInfo = sowingUnits?.find((info) => info.unit === sowing.unit);
        return {
          id: sowing.id,
          rawDate: sowing.date,
          date: formatLocalizedDate(
            parseDateOnly(sowing.date),
            i18n.language,
            "long",
            false,
          ),
          plotName: "plot" in sowing ? sowing.plot.name : undefined,
          cropName: sowing.crop.name,
          seedName: sowing.seed?.name,
          amount: `${sowing.amount.toLocaleString()} ${t(`sowings.units.${sowing.unit}`)}`,
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
      const year = parseDateOnly(item.rawDate).getFullYear();
      if (!selectedYears.includes(year)) continue;
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
  }, [
    sowings,
    sowingUnits,
    visibleCrops,
    searchText,
    t,
    i18n.language,
    selectedYears,
  ]);

  return (
    // A touch anywhere closes open chart tooltips, a tap on a chart reopens its own
    <View
      style={{ gap: theme.spacing.m, marginTop: theme.spacing.m }}
      onTouchStart={dismissChartTooltips}
    >
      {allCrops.length > 1 && (
        <CategoryFilter
          items={allCrops}
          selected={selectedCrops}
          onToggle={toggleCrop}
        />
      )}

      {availableYears.length > 0 && (
        <YearMultiSelect
          years={availableYears}
          selectedYears={selectedYears}
          onToggle={toggleYear}
        />
      )}

      {series.length > 0 && (
        <ChartPager
          pages={series.map((entry) => ({
            key: entry.key,
            content: (
              <SowingChartPage
                series={entry}
                selectedYears={selectedYears}
                availableYears={availableYears}
                chartMode={chartMode}
                setChartMode={setChartMode}
              />
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

// One carousel page: title, chart mode, then the chart for the globally selected years
function SowingChartPage({
  series,
  selectedYears,
  availableYears,
  chartMode,
  setChartMode,
}: {
  series: SowingSeries;
  selectedYears: number[];
  availableYears: number[];
  // Shared by all pages, so it stays when swiping
  chartMode: ChartMode;
  setChartMode: (mode: ChartMode) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();

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

  // Average yearly total over all years with data, independent of the year selection
  const yearlyTotals = Object.values(series.monthly)
    .map((values) => values.reduce((sum, value) => sum + value, 0))
    .filter((yearTotal) => yearTotal > 0);
  const yearlyAverage =
    yearlyTotals.length > 0
      ? yearlyTotals.reduce((sum, value) => sum + value, 0) /
        yearlyTotals.length
      : 0;
  const averageUnit: UnitScale = series.countUnit
    ? { label: t(`sowings.units.${series.countUnit}`), divisor: 1 }
    : scaleUnit("kg", yearlyAverage);

  return (
    <View style={{ gap: theme.spacing.s }}>
      {/* Title on the left, chart mode on the right */}
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
      {yearlyAverage > 0 && (
        <Text style={{ color: theme.colors.gray1 }}>
          {t("common.yearly_average", {
            value: `${formatNumber(yearlyAverage / averageUnit.divisor)} ${averageUnit.label}`,
          })}
        </Text>
      )}
      <MonthCartesianChart
        mode={chartMode}
        monthlyData={series.monthly}
        selectedYears={selectedYears}
        availableYears={availableYears}
        unit={unit}
      />
    </View>
  );
}
