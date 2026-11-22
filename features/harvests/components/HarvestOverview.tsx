import { Harvest, HarvestSummary, PlotHarvest } from "@/api/harvests.api";
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
import { formatNumber, scaleUnit } from "@/components/charts/unitScaling";
import { YearMultiSelect } from "@/components/charts/YearMultiSelect";
import { TextInput } from "@/components/inputs/TextInput";
import { ScrollView } from "@/components/views/ScrollView";
import { ListItem } from "@/components/list/ListItem";
import { Text } from "@/components/text/Text";
import { H3, Headline, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { round } from "@/utils/math";
import Fuse from "fuse.js";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  SectionList,
  SectionListRenderItemInfo,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import {
  aggregateHarvestsByCropAndMethod,
  harvestingUnits,
  isConservationMethod,
} from "../harvestUtils";

// Years selected when the screen opens, older ones can be added with the chips
const INITIAL_YEAR_COUNT = 3;

// One entry of the list below the charts
type HarvestListItem = {
  id: string;
  rawDate: string;
  date: string;
  plotName: string | undefined;
  cropName: string;
  kilos: number;
  unit: string;
  conservationMethod: string | undefined;
};

type HarvestOverviewProps = {
  summaries: HarvestSummary[];
  // Per-plot entries come without the plot, the per-plot screen shows it in its title
  harvests: (Harvest | PlotHarvest)[];
  // Screen title, shown in the navigation header once the list is scrolled
  title: string;
  // Top of the list, e.g. the title and the plot name
  header: ReactNode;
  onPressHarvest: (harvestId: string) => void;
};

// Crop chips on top filter both the chart carousel and the searchable list below
export function HarvestOverview({
  summaries,
  harvests,
  title,
  header,
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

  // Chart or numbers, for all carousel pages at once
  const [pageView, setPageView] = useState<"chart" | "stats">("chart");
  // Numbers view: whether long tables show all rows, shared by all cards
  const [showAllRows, setShowAllRows] = useState(false);
  const pageViewOptions = useMemo(
    () => [
      { key: "chart" as const, label: t("common.view_chart") },
      { key: "stats" as const, label: t("common.view_stats") },
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
      .map(
        (harvest): HarvestListItem => ({
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
        }),
      );

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
        data: byYear[year].sort(
          (a, b) =>
            new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime(),
        ),
      }));
  }, [harvests, visibleCrops, searchText, t, i18n.language, selectedYears]);

  // Mount the list one frame after the header, so the charts and the first rows
  // don't all render in the same frame
  const [listReady, setListReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setListReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Stable press handler, so the memoized rows don't re-render when the screen
  // passes a new callback
  const onPressRef = useRef(onPressHarvest);
  useEffect(() => {
    onPressRef.current = onPressHarvest;
  });
  const handlePress = useCallback((id: string) => onPressRef.current(id), []);
  const renderItem = useCallback(
    ({
      item,
      index,
      section,
    }: SectionListRenderItemInfo<
      HarvestListItem,
      { year: number; data: HarvestListItem[] }
    >) => (
      <HarvestRow
        item={item}
        isFirst={index === 0}
        isLast={index === section.data.length - 1}
        onPress={handlePress}
      />
    ),
    [handlePress],
  );

  return (
    <SectionList
      sections={listReady ? listSections : []}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      // Our ScrollView, for the title in the navigation header and keyboard handling
      // (keeps the search field visible while typing)
      renderScrollComponent={(scrollProps) => (
        <ScrollView
          {...scrollProps}
          showHeaderOnScroll
          headerTitleOnScroll={title}
        />
      )}
      // The list starts below the tall chart header: render the first screen right
      // away and in bigger batches, so fewer batches run while scrolling
      initialNumToRender={20}
      maxToRenderPerBatch={20}
      // A touch anywhere closes open chart tooltips, a tap on a chart reopens its own
      onTouchStart={dismissChartTooltips}
      // room for the FAB below the last entry
      contentContainerStyle={{ paddingBottom: 120 }}
      // An element, not a component: it re-renders but never re-mounts, so the
      // search field keeps its focus and the carousel its page
      ListHeaderComponent={
        <View style={{ gap: theme.spacing.m }}>
          {header}
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
                mountAllPages={pageView === "stats"}
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
                      showAllRows={showAllRows}
                      onToggleShowAllRows={() =>
                        setShowAllRows((showAll) => !showAll)
                      }
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
        </View>
      }
      ListEmptyComponent={
        listReady ? (
          <Headline style={{ marginTop: theme.spacing.m }}>
            {t("common.no_entries")}
          </Headline>
        ) : undefined
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
      renderItem={renderItem}
    />
  );
}

// One list entry. Memoized, so the rows don't re-render while scrolling or when the
// charts above change, only when their entry does. One white block per year: rounded
// corners on its first and last entry.
const HarvestRow = memo(function HarvestRow({
  item,
  isFirst,
  isLast,
  onPress,
}: {
  item: HarvestListItem;
  isFirst: boolean;
  isLast: boolean;
  onPress: (id: string) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
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
      <ListItem onPress={() => onPress(item.id)}>
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
    </View>
  );
});

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
  showAllRows,
  onToggleShowAllRows,
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
  showAllRows: boolean;
  onToggleShowAllRows: () => void;
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
          return [year, value ? formatNumber(value) : "-"];
        }),
      );

    const rows: StatsTableRow[] = [
      {
        key: "total",
        label: t("harvests.total_amount"),
        values: Object.fromEntries(
          selectedYears.map((year) => [
            year,
            stats.totalKilosByYear[year]
              ? `${formatNumber(stats.totalKilosByYear[year] / totalUnit.divisor)} ${totalUnit.label}`
              : "-",
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
        t("common.per_unit_amount", { amount: `${formatNumber(weight)} kg` });

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
          showAllRows={showAllRows}
          onToggleShowAllRows={onToggleShowAllRows}
        />
      )}
    </View>
  );
}
