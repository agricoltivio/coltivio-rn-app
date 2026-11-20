import { Harvest, HarvestSummary, PlotHarvest } from "@/api/harvests.api";
import { CategoryFilter } from "@/components/charts/CategoryFilter";
import { getYearColor } from "@/components/charts/chartColors";
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
import { formatNumber, scaleUnit } from "@/components/charts/unitScaling";
import { YearMultiSelect } from "@/components/charts/YearMultiSelect";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { Text } from "@/components/text/Text";
import { H3, Headline, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { round } from "@/utils/math";
import Fuse from "fuse.js";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, View } from "react-native";
import type { ScrollViewInstance } from "react-native";
import { useTheme } from "styled-components/native";
import {
  aggregateHarvestsByCropAndMethod,
  harvestingUnits,
  isConservationMethod,
} from "../harvestUtils";

// Years selected when the screen opens, older ones can be added with the chips
const INITIAL_YEAR_COUNT = 3;

type HarvestOverviewProps = {
  summaries: HarvestSummary[];
  // Per-plot entries come without the plot, the per-plot screen shows it in its title
  harvests: (Harvest | PlotHarvest)[];
  onPressHarvest: (harvestId: string) => void;
};

// Crop chips on top filter both the chart carousel and the searchable list below
export function HarvestOverview({
  summaries,
  harvests,
  onPressHarvest,
}: HarvestOverviewProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");

  const allCrops = useMemo(
    () => [...new Set(harvests.map((harvest) => harvest.crop.name))].sort(),
    [harvests],
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
          ...harvests.map((harvest) => new Date(harvest.date).getFullYear()),
        ]),
      ].sort((a, b) => b - a),
    [summaries, harvests],
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

  // Chart or numbers, for all carousel pages at once
  const [pageView, setPageView] = useState<"chart" | "stats">("chart");
  const pageViewOptions = useMemo(
    () => [
      { key: "chart" as const, label: t("harvests.stats.view_chart") },
      { key: "stats" as const, label: t("harvests.stats.view_stats") },
    ],
    [t],
  );

  // One chart per crop and conservation method, only those with data in the selected years
  const chartSeries = useMemo(() => {
    const cropData = aggregateHarvestsByCropAndMethod(summaries);
    return Object.keys(cropData)
      .filter((cropName) => visibleCrops.includes(cropName))
      .sort()
      .flatMap((cropName) =>
        Object.entries(cropData[cropName]).map(
          ([conservationMethod, { monthly, total }]) => ({
            key: `${cropName}-${conservationMethod}`,
            cropName,
            conservationMethod,
            monthly,
            total,
          }),
        ),
      )
      .filter((series) => selectedYears.some((year) => series.monthly[year]));
  }, [summaries, visibleCrops, selectedYears]);

  const listSections = useMemo(() => {
    const items = harvests
      .filter((harvest) => visibleCrops.includes(harvest.crop.name))
      .map((harvest) => ({
        id: harvest.id,
        rawDate: harvest.date,
        date: formatLocalizedDate(
          new Date(harvest.date),
          i18n.language,
          "long",
          false,
        ),
        plotName: "plot" in harvest ? harvest.plot.name : undefined,
        cropName: harvest.crop.name,
        kilos: round(harvest.numberOfUnits * harvest.kilosPerUnit, 2),
        unit: t(`harvests.labels.unit.${harvest.unit}`),
        conservationMethod: harvest.conservationMethod
          ? t(
              `harvests.labels.conservation_method.${harvest.conservationMethod}`,
            )
          : undefined,
      }));

    let filtered = items;
    if (searchText) {
      const fuse = new Fuse(items, {
        minMatchCharLength: 1,
        keys: ["date", "plotName", "cropName", "unit", "conservationMethod"],
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
  }, [harvests, visibleCrops, searchText, t, i18n.language, selectedYears]);

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

      {chartSeries.length > 0 && (
        // Own container: the switch sits close to the carousel it controls
        <View>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <ChartViewSwitcher
              value={pageView}
              onChange={setPageView}
              options={pageViewOptions}
            />
          </View>
          <ChartPager
            style={{ marginTop: theme.spacing.xs }}
            pages={chartSeries.map((series) => ({
              key: series.key,
              content: (
                <HarvestChartPage
                  cropName={series.cropName}
                  conservationMethod={series.conservationMethod}
                  monthly={series.monthly}
                  total={series.total}
                  harvests={harvests}
                  selectedYears={selectedYears}
                  availableYears={availableYears}
                  pageView={pageView}
                  chartMode={chartMode}
                  setChartMode={setChartMode}
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
                <ListItem key={item.id} onPress={() => onPressHarvest(item.id)}>
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
                      {[
                        `${item.kilos}kg`,
                        item.cropName,
                        item.unit,
                        item.conservationMethod,
                      ]
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

// One carousel page: title with the yearly average, chart mode, then the chart or the
// numbers table for the globally selected years
function HarvestChartPage({
  cropName,
  conservationMethod,
  monthly,
  total,
  harvests,
  selectedYears,
  availableYears,
  pageView,
  chartMode,
  setChartMode,
}: {
  cropName: string;
  conservationMethod: string;
  monthly: Record<number, number[]>;
  total: Record<number, number>;
  harvests: (Harvest | PlotHarvest)[];
  selectedYears: number[];
  availableYears: number[];
  pageView: "chart" | "stats";
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
  const maxKilos = Math.max(
    0,
    ...selectedYears.map((year) => total[year] ?? 0),
  );
  const unit = scaleUnit("kg", maxKilos);

  const conservationLabel =
    conservationMethod !== "none" && isConservationMethod(conservationMethod)
      ? t(`harvests.labels.conservation_method.${conservationMethod}`)
      : undefined;
  const title = conservationLabel
    ? `${cropName} - ${conservationLabel}`
    : cropName;

  // Numbers view for this crop + conservation method, per selected year. Built from
  // the entries, the summaries only know one total per unit and lose the different
  // weights (e.g. round bales of 280 kg and of 500 kg).
  const stats = useMemo(() => {
    const totalKilosByYear: Record<number, number> = {};
    // unit -> weight per unit -> year -> number of units
    const countsByUnit: Record<
      string,
      Record<number, Record<number, number>>
    > = {};
    for (const harvest of harvests) {
      if (harvest.crop.name !== cropName) continue;
      if ((harvest.conservationMethod ?? "none") !== conservationMethod) {
        continue;
      }
      const year = new Date(harvest.date).getFullYear();
      if (!selectedYears.includes(year)) continue;
      totalKilosByYear[year] =
        (totalKilosByYear[year] ?? 0) +
        harvest.numberOfUnits * harvest.kilosPerUnit;
      // A total amount has no meaningful count, its kilos are in the total
      if (harvest.unit === "total_amount") continue;
      const byWeight = (countsByUnit[harvest.unit] ??= {});
      const byYear = (byWeight[harvest.kilosPerUnit] ??= {});
      byYear[year] = (byYear[year] ?? 0) + harvest.numberOfUnits;
    }

    // Units in the same order as the harvest form
    const units = Object.keys(countsByUnit).sort((a, b) => {
      const indexA = harvestingUnits.findIndex((unit) => unit === a);
      const indexB = harvestingUnits.findIndex((unit) => unit === b);
      return (
        (indexA === -1 ? harvestingUnits.length : indexA) -
        (indexB === -1 ? harvestingUnits.length : indexB)
      );
    });
    return { totalKilosByYear, countsByUnit, units };
  }, [harvests, cropName, conservationMethod, selectedYears]);

  const tableRows = useMemo(() => {
    // One scale for all years, so the totals are comparable
    const totalUnit = scaleUnit(
      "kg",
      Math.max(0, ...Object.values(stats.totalKilosByYear)),
    );
    const valuesPerYear = (valueOf: (year: number) => number | undefined) =>
      Object.fromEntries(
        selectedYears.map((year) => {
          const value = valueOf(year);
          return [year, value ? formatNumber(value) : "–"];
        }),
      );

    const rows: StatsTableRow[] = [
      {
        key: "total",
        label: t("harvests.total_amount"),
        values: Object.fromEntries(
          selectedYears.map((year) => [
            year,
            `${formatNumber((stats.totalKilosByYear[year] ?? 0) / totalUnit.divisor)} ${totalUnit.label}`,
          ]),
        ),
      },
    ];
    for (const harvestUnit of stats.units) {
      const unitLabel = t(`harvests.labels.unit.${harvestUnit}`, {
        defaultValue: harvestUnit,
      });
      const byWeight = stats.countsByUnit[harvestUnit];
      const weights = Object.keys(byWeight)
        .map(Number)
        .sort((a, b) => a - b);
      const weightLabel = (weight: number) =>
        t("harvests.stats.per_unit_weight", { weight: formatNumber(weight) });

      if (weights.length === 1) {
        // e.g. "Harasse à 20 kg"
        rows.push({
          key: harvestUnit,
          label: `${unitLabel} ${weightLabel(weights[0])}`,
          values: valuesPerYear((year) => byWeight[weights[0]][year]),
        });
        continue;
      }
      // Several weights: the unit with its total count, then one row per weight
      rows.push({
        key: harvestUnit,
        label: unitLabel,
        values: valuesPerYear((year) =>
          weights.reduce(
            (sum, weight) => sum + (byWeight[weight][year] ?? 0),
            0,
          ),
        ),
      });
      for (const weight of weights) {
        rows.push({
          key: `${harvestUnit}-${weight}`,
          label: weightLabel(weight),
          values: valuesPerYear((year) => byWeight[weight][year]),
          indented: true,
        });
      }
    }
    return rows;
  }, [stats, selectedYears, t]);

  // Average yearly total over all years with data, independent of the year selection
  const yearlyTotals = Object.values(total).filter(
    (yearTotal) => yearTotal > 0,
  );
  const yearlyAverage =
    yearlyTotals.length > 0
      ? yearlyTotals.reduce((sum, value) => sum + value, 0) /
        yearlyTotals.length
      : 0;
  const averageUnit = scaleUnit("kg", yearlyAverage);

  return (
    <View style={{ gap: theme.spacing.s }}>
      {/* Title on the left, total / per month (chart only) on the right */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Subtitle style={{ flex: 1, fontWeight: "600" }}>{title}</Subtitle>
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
          unit={unit}
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

type StatsTableRow = {
  key: string;
  label: string;
  // year -> formatted value
  values: Record<number, string>;
  // sub row, e.g. one weight of a unit
  indented?: boolean;
};

const STATS_ROW_HEIGHT = 32;
const STATS_YEAR_COLUMN_WIDTH = 84;

// Metrics as rows, one column per selected year with its chart color. The label
// column stays fixed (swiping there still turns the carousel page), the year columns
// scroll horizontally when they don't fit. Labels wrap to two lines; each label row
// measures its height and the year columns use it, so the rows stay aligned.
function StatsTable({
  years,
  availableYears,
  rows,
}: {
  years: number[];
  availableYears: number[];
  rows: StatsTableRow[];
}) {
  const theme = useTheme();
  const yearsScrollRef = useRef<ScrollViewInstance>(null);
  // row key -> height of its label row
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});
  const rowStyle = (row?: StatsTableRow) => ({
    minHeight: STATS_ROW_HEIGHT,
    justifyContent: "center" as const,
    borderBottomWidth: row === undefined ? 1 : row.indented ? 0 : 1,
    borderBottomColor:
      row === undefined ? theme.colors.gray4 : theme.colors.gray5,
  });
  const textColor = (row: StatsTableRow) =>
    row.indented ? theme.colors.gray1 : theme.colors.gray0;

  return (
    <View style={{ flexDirection: "row" }}>
      <View style={{ flex: 1 }}>
        {/* Empty header cell above the labels */}
        <View style={rowStyle()} />
        {rows.map((row) => (
          <View
            key={row.key}
            style={[rowStyle(row), { paddingVertical: 4 }]}
            onLayout={(event) => {
              const height = Math.round(event.nativeEvent.layout.height);
              setRowHeights((prev) =>
                prev[row.key] === height
                  ? prev
                  : { ...prev, [row.key]: height },
              );
            }}
          >
            <Text
              numberOfLines={2}
              style={{
                paddingLeft: row.indented ? theme.spacing.m : 0,
                color: textColor(row),
              }}
            >
              {row.label}
            </Text>
          </View>
        ))}
      </View>
      <ScrollView
        ref={yearsScrollRef}
        horizontal
        nestedScrollEnabled
        // Start at the latest year (rightmost), also after the year selection changes
        onContentSizeChange={() =>
          yearsScrollRef.current?.scrollToEnd({ animated: false })
        }
        showsHorizontalScrollIndicator={false}
        // When the columns fit, a swipe on the table should still turn the carousel page
        bounces={false}
        alwaysBounceHorizontal={false}
        style={{ flexGrow: 0, maxWidth: "65%" }}
      >
        <View>
          <View style={[rowStyle(), { flexDirection: "row" }]}>
            {years.map((year) => (
              <View
                key={year}
                style={{
                  width: STATS_YEAR_COLUMN_WIDTH,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 4,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: getYearColor(
                      theme,
                      availableYears.indexOf(year),
                    ),
                  }}
                />
                <Text style={{ fontWeight: "600" }}>{year}</Text>
              </View>
            ))}
          </View>
          {rows.map((row) => (
            <View
              key={row.key}
              style={[
                rowStyle(row),
                {
                  height: rowHeights[row.key] ?? STATS_ROW_HEIGHT,
                  flexDirection: "row",
                  alignItems: "center",
                },
              ]}
            >
              {years.map((year) => (
                <Text
                  key={year}
                  numberOfLines={1}
                  style={{
                    width: STATS_YEAR_COLUMN_WIDTH,
                    textAlign: "right",
                    fontVariant: ["tabular-nums"],
                    color: textColor(row),
                  }}
                >
                  {row.values[year] ?? "–"}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
