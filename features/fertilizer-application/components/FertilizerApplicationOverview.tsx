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
import { StatsTable, StatsTableRow } from "@/components/charts/StatsTable";
import { scaleUnit, formatNumber } from "@/components/charts/unitScaling";
import { YearMultiSelect } from "@/components/charts/YearMultiSelect";
import { TextInput } from "@/components/inputs/TextInput";
import { ScrollView } from "@/components/views/ScrollView";
import { ListItem } from "@/components/list/ListItem";
import { Text } from "@/components/text/Text";
import { H3, Headline, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { formatApplicationAmount, productUnitLabel } from "@/utils/units";
import Fuse from "fuse.js";
import { useCallback, useMemo, useState, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Alert, SectionList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { aggregateFertilizerApplicationsByName } from "../fertilizerApplications.utils";

// Years selected when the screen opens, older ones can be added with the chips
const INITIAL_YEAR_COUNT = 3;

type FertilizerApplicationOverviewProps = {
  summaries: FertilizerApplicationSummary[];
  // Per-plot entries come without the plot, the per-plot screen shows it in its title
  applications: (FertilizerApplication | PlotFertilizerApplication)[];
  // Screen title, shown in the navigation header once the list is scrolled
  title: string;
  // Top of the list, e.g. the title and the plot name
  header: ReactNode;
  onPressApplication: (fertilizerApplicationId: string) => void;
};

// Fertilizer chips on top filter both the chart carousel and the searchable list below
export function FertilizerApplicationOverview({
  summaries,
  applications,
  title,
  header,
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
  // Chart or numbers, for all carousel pages at once
  const [pageView, setPageView] = useState<"chart" | "stats">("chart");
  const pageViewOptions = useMemo(
    () => [
      { key: "chart" as const, label: t("common.view_chart") },
      { key: "stats" as const, label: t("common.view_stats") },
    ],
    [t],
  );
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
      // By what is shown: a year cut off by the limit isn't hidden but not selected either
      if (!selectedYears.includes(year)) {
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
    [selectedYears, t],
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
    <SectionList
      sections={listSections.map(({ year, items }) => ({ year, data: items }))}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      // Our ScrollView, for the title in the navigation header and keyboard handling
      renderScrollComponent={(scrollProps) => (
        <ScrollView
          {...scrollProps}
          showHeaderOnScroll
          headerTitleOnScroll={title}
        />
      )}
      // A touch anywhere closes open chart tooltips, a tap on a chart reopens its own
      onTouchStart={dismissChartTooltips}
      // room for the FAB below the last entry
      contentContainerStyle={{ paddingBottom: 120 }}
      // An element, not a component: it re-renders but never re-mounts, so the
      // search field keeps its focus and the carousel its page
      ListHeaderComponent={
        <View style={{ gap: theme.spacing.m }}>
          {header}
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
            // Own container: the switch sits close to the carousel it controls
            <View>
              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <ChartViewSwitcher
                  value={pageView}
                  onChange={setPageView}
                  options={pageViewOptions}
                />
              </View>
              <ChartPager
                style={{ marginTop: theme.spacing.xs }}
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
                      applications={applications}
                      pageView={pageView}
                    />
                  ),
                }))}
              />
            </View>
          )}

          <TextInput
            hideLabel
            placeholder={t("forms.placeholders.search")}
            onChangeText={setSearchText}
            value={searchText}
          />
        </View>
      }
      ListEmptyComponent={
        <Headline style={{ marginTop: theme.spacing.m }}>
          {t("common.no_entries")}
        </Headline>
      }
      renderSectionHeader={({ section }) => (
        <H3
          style={{
            paddingHorizontal: theme.spacing.xs,
            marginTop: theme.spacing.m,
            marginBottom: theme.spacing.s,
          }}
        >
          {section.year}
        </H3>
      )}
      renderItem={({ item, index, section }) => {
        // One white block per year: rounded corners on its first and last entry
        const isFirst = index === 0;
        const isLast = index === section.data.length - 1;
        return (
          <View
            style={{
              backgroundColor: theme.colors.white,
              overflow: "hidden",
              borderTopLeftRadius: isFirst ? 10 : 0,
              borderTopRightRadius: isFirst ? 10 : 0,
              borderBottomLeftRadius: isLast ? 10 : 0,
              borderBottomRightRadius: isLast ? 10 : 0,
            }}
          >
            <ListItem onPress={() => onPressApplication(item.id)}>
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
          </View>
        );
      }}
    />
  );
}

// One carousel page: title with the yearly average, chart mode, then the chart or the
// numbers table for the globally selected years
function FertilizerChartPage({
  fertilizerName,
  unit,
  monthly,
  selectedYears,
  availableYears,
  chartMode,
  setChartMode,
  applications,
  pageView,
}: {
  fertilizerName: string;
  unit: string;
  monthly: Record<number, number[]>;
  selectedYears: number[];
  availableYears: number[];
  // Shared by all pages, so it stays when swiping
  chartMode: ChartMode;
  setChartMode: (mode: ChartMode) => void;
  applications: (FertilizerApplication | PlotFertilizerApplication)[];
  pageView: "chart" | "stats";
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

  // Numbers view for this fertilizer, per selected year, built from the entries:
  // total amount, treated area, amount per hectare and how it was applied
  const tableRows = useMemo(() => {
    const totalByYear: Record<number, number> = {};
    // m², an area treated twice counts twice
    const areaByYear: Record<number, number> = {};
    // "unit|amount per unit" -> year -> number of units (for amount per hectare: hectares)
    const unitsByYear: Record<string, Record<number, number>> = {};
    let productUnit = unit;
    for (const application of applications) {
      if (application.fertilizer.name !== fertilizerName) continue;
      const year = new Date(application.date).getFullYear();
      if (!selectedYears.includes(year)) continue;
      productUnit = application.fertilizer.unit;
      totalByYear[year] =
        (totalByYear[year] ?? 0) +
        application.numberOfUnits * application.amountPerUnit;
      areaByYear[year] = (areaByYear[year] ?? 0) + application.size;
      // A total amount has no units to break down, it is in the total
      if (application.unit === "total_amount") continue;
      const unitKey = `${application.unit}|${application.amountPerUnit}`;
      const byYear = (unitsByYear[unitKey] ??= {});
      byYear[year] = (byYear[year] ?? 0) + application.numberOfUnits;
    }

    const productSymbol = productUnitLabel(productUnit, t);
    const hectareSymbol = t("units.short.ha");
    // One scale for all years, so the totals are comparable
    const totalUnit = scaleUnit(
      productUnit,
      Math.max(0, ...Object.values(totalByYear)),
    );
    const valuesPerYear = (valueOf: (year: number) => string | undefined) =>
      Object.fromEntries(
        selectedYears.map((year) => [year, valueOf(year) ?? "–"]),
      );

    const rows: StatsTableRow[] = [
      {
        key: "total",
        label: t("harvests.total_amount"),
        values: valuesPerYear((year) =>
          totalByYear[year]
            ? `${formatNumber(totalByYear[year] / totalUnit.divisor)} ${totalUnit.label}`
            : undefined,
        ),
      },
      {
        key: "area",
        label: t("forms.labels.area"),
        values: valuesPerYear((year) =>
          areaByYear[year]
            ? `${formatNumber(areaByYear[year] / 10000)} ${hectareSymbol}`
            : undefined,
        ),
      },
      {
        key: "per-hectare",
        label: t("common.average_per_hectare"),
        values: valuesPerYear((year) =>
          totalByYear[year] && areaByYear[year]
            ? `${formatNumber(totalByYear[year] / (areaByYear[year] / 10000))} ${productSymbol}/${hectareSymbol}`
            : undefined,
        ),
      },
    ];

    // Same unit and amount per unit as one row, e.g. "Fuder à 10 m³": 12
    const unitKeys = Object.keys(unitsByYear).sort((a, b) => {
      const [unitA, amountA] = a.split("|");
      const [unitB, amountB] = b.split("|");
      return unitA === unitB
        ? Number(amountA) - Number(amountB)
        : unitA.localeCompare(unitB);
    });
    for (const unitKey of unitKeys) {
      const [applicationUnit, amountPerUnitText] = unitKey.split("|");
      const amountPerUnit = Number(amountPerUnitText);
      const byYear = unitsByYear[unitKey];
      if (applicationUnit === "amount_per_hectare") {
        // e.g. "25 m³/ha": 0.2 ha
        rows.push({
          key: unitKey,
          label: `${formatNumber(amountPerUnit)} ${productSymbol}/${hectareSymbol}`,
          values: valuesPerYear((year) =>
            byYear[year]
              ? `${formatNumber(byYear[year])} ${hectareSymbol}`
              : undefined,
          ),
        });
        continue;
      }
      const unitLabel = t(`fertilizer_application.units.${applicationUnit}`, {
        defaultValue: applicationUnit,
      });
      rows.push({
        key: unitKey,
        label: `${unitLabel} ${t("common.per_unit_amount", {
          amount: `${formatNumber(amountPerUnit)} ${productSymbol}`,
        })}`,
        values: valuesPerYear((year) =>
          byYear[year] ? formatNumber(byYear[year]) : undefined,
        ),
      });
    }
    return rows;
  }, [applications, fertilizerName, unit, selectedYears, t]);

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
        {pageView === "chart" && (
          <ChartViewSwitcher
            value={chartMode}
            onChange={setChartMode}
            options={chartViewOptions}
          />
        )}
      </View>
      {yearlyAverage > 0 && (
        <Text style={{ color: theme.colors.gray1 }}>
          {t("common.yearly_average", {
            value: `${formatNumber(yearlyAverage / averageUnit.divisor)} ${averageUnit.label}`,
          })}
        </Text>
      )}
      {pageView === "chart" ? (
        <MonthCartesianChart
          mode={chartMode}
          monthlyData={monthly}
          selectedYears={selectedYears}
          availableYears={availableYears}
          unit={displayUnit}
        />
      ) : (
        <StatsTable
          years={selectedYears}
          availableYears={availableYears}
          rows={tableRows}
        />
      )}
    </View>
  );
}
