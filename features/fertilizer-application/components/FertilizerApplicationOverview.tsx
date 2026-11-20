import {
  FertilizerApplication,
  FertilizerApplicationSummary,
  PlotFertilizerApplication,
} from "@/api/fertilizerApplications.api";
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
import { scaleUnit, formatNumber } from "@/components/charts/unitScaling";
import { YearMultiSelect } from "@/components/charts/YearMultiSelect";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { Text } from "@/components/text/Text";
import { H3, Headline, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { formatApplicationAmount } from "@/utils/units";
import Fuse from "fuse.js";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import { aggregateFertilizerApplicationsByName } from "../fertilizerApplications.utils";

// Years selected when the screen opens, older ones can be added with the chips
const INITIAL_YEAR_COUNT = 3;

type FertilizerApplicationOverviewProps = {
  summaries: FertilizerApplicationSummary[];
  // Per-plot entries come without the plot, the per-plot screen shows it in its title
  applications: (FertilizerApplication | PlotFertilizerApplication)[];
  onPressApplication: (fertilizerApplicationId: string) => void;
};

// Fertilizer chips on top filter both the chart carousel and the searchable list below
export function FertilizerApplicationOverview({
  summaries,
  applications,
  onPressApplication,
}: FertilizerApplicationOverviewProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [selectedFertilizers, setSelectedFertilizers] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");

  const allFertilizers = useMemo(
    () =>
      [
        ...new Set(
          applications.map((application) => application.fertilizer.name),
        ),
      ].sort(),
    [applications],
  );
  const visibleFertilizers =
    selectedFertilizers.length === 0 ? allFertilizers : selectedFertilizers;

  const toggleFertilizer = useCallback((fertilizerName: string) => {
    setSelectedFertilizers((prev) =>
      prev.includes(fertilizerName)
        ? prev.filter((name) => name !== fertilizerName)
        : [...prev, fertilizerName],
    );
  }, []);

  // Years from the charts and the entries, so every entry can be shown or hidden.
  // Also keeps the year -> color mapping the same on every chart.
  const availableYears = useMemo(
    () =>
      [
        ...new Set([
          ...summaries.map((summary) => summary.year),
          ...applications.map((application) =>
            new Date(application.date).getFullYear(),
          ),
        ]),
      ].sort((a, b) => b - a),
    [summaries, applications],
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

  const chartData = useMemo(
    () => aggregateFertilizerApplicationsByName(summaries),
    [summaries],
  );
  // Fertilizers without data in the selected years get no chart page
  const chartFertilizers = Object.keys(chartData)
    .filter((fertilizerName) => visibleFertilizers.includes(fertilizerName))
    .filter((fertilizerName) =>
      selectedYears.some((year) => chartData[fertilizerName].monthly[year]),
    )
    .sort();

  const listSections = useMemo(() => {
    const items = applications
      .filter((application) =>
        visibleFertilizers.includes(application.fertilizer.name),
      )
      .map((application) => ({
        id: application.id,
        rawDate: application.date,
        date: formatLocalizedDate(
          new Date(application.date),
          i18n.language,
          "long",
          false,
        ),
        plotName: "plot" in application ? application.plot.name : undefined,
        fertilizerName: application.fertilizer.name,
        amount: formatApplicationAmount(
          {
            unit: application.unit,
            numberOfUnits: application.numberOfUnits,
            amountPerUnit: application.amountPerUnit,
            productUnit: application.fertilizer.unit,
          },
          t,
        ),
      }));

    let filtered = items;
    if (searchText) {
      const fuse = new Fuse(items, {
        minMatchCharLength: 1,
        keys: ["date", "plotName", "fertilizerName"],
      });
      filtered = fuse.search(searchText).map((result) => result.item);
    }

    // grouped by year, newest first
    const byYear: Record<number, typeof filtered> = {};
    for (const item of filtered) {
      const year = new Date(item.rawDate).getFullYear();
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
    applications,
    visibleFertilizers,
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
      {allFertilizers.length > 1 && (
        <CategoryFilter
          items={allFertilizers}
          selected={selectedFertilizers}
          onToggle={toggleFertilizer}
        />
      )}

      {availableYears.length > 0 && (
        <YearMultiSelect
          years={availableYears}
          selectedYears={selectedYears}
          onToggle={toggleYear}
        />
      )}

      {chartFertilizers.length > 0 && (
        <ChartPager
          pages={chartFertilizers.map((fertilizerName) => ({
            key: fertilizerName,
            content: (
              <FertilizerChartPage
                fertilizerName={fertilizerName}
                unit={chartData[fertilizerName].unit}
                monthly={chartData[fertilizerName].monthly}
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
                <ListItem
                  key={item.id}
                  onPress={() => onPressApplication(item.id)}
                >
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
                      {item.amount} {item.fertilizerName}
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
function FertilizerChartPage({
  fertilizerName,
  unit,
  monthly,
  selectedYears,
  availableYears,
  chartMode,
  setChartMode,
}: {
  fertilizerName: string;
  unit: string;
  monthly: Record<number, number[]>;
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

  // The largest yearly total picks the unit scale, so the cumulative view fits
  const yearTotals = selectedYears.map((year) =>
    (monthly[year] ?? []).reduce((sum, value) => sum + value, 0),
  );
  const displayUnit = scaleUnit(unit, Math.max(0, ...yearTotals));

  // Average yearly total over all years with data, independent of the year selection
  const yearlyTotals = Object.values(monthly)
    .map((values) => values.reduce((sum, value) => sum + value, 0))
    .filter((yearTotal) => yearTotal > 0);
  const yearlyAverage =
    yearlyTotals.length > 0
      ? yearlyTotals.reduce((sum, value) => sum + value, 0) /
        yearlyTotals.length
      : 0;
  const averageUnit = scaleUnit(unit, yearlyAverage);

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
          {fertilizerName}
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
        monthlyData={monthly}
        selectedYears={selectedYears}
        availableYears={availableYears}
        unit={displayUnit}
      />
    </View>
  );
}
