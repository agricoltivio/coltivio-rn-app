import { Card } from "@/components/card/Card";
import { locale } from "@/locales/i18n";
import { Subtitle } from "@/theme/Typography";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  BarChart,
  LineChart,
  barDataItem,
  lineDataItem,
} from "react-native-gifted-charts";
import { useTheme } from "styled-components/native";
import { ConservationMethod, HarvestSummary } from "@/api/harvests.api";

const YEAR_COLORS = [
  "#4A90D9",
  "#E67E22",
  "#2ECC71",
  "#9B59B6",
  "#E74C3C",
  "#1ABC9C",
  "#F39C12",
  "#3498DB",
  "#8E44AD",
  "#27AE60",
];
function getYearColor(index: number) {
  return YEAR_COLORS[index % YEAR_COLORS.length];
}

const MONTH_LABELS = Array.from({ length: 12 }, (_, i) =>
  new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(2024, i)),
);

function Legend({ labels }: { labels: { text: string; color: string }[] }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        marginTop: theme.spacing.s,
      }}
    >
      {labels.map((label) => (
        <View
          key={label.text}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <View
            style={{
              height: 12,
              width: 12,
              borderRadius: 6,
              backgroundColor: label.color,
              marginRight: 6,
            }}
          />
          <Text style={{ fontSize: 14, color: theme.colors.gray2 }}>
            {label.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

function YearMultiSelect({
  years,
  selectedYears,
  onToggle,
}: {
  years: number[];
  selectedYears: number[];
  onToggle: (year: number) => void;
}) {
  const theme = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 6 }}
    >
      {years.map((year, index) => {
        const isSelected = selectedYears.includes(year);
        const color = getYearColor(index);
        return (
          <TouchableOpacity
            key={year}
            onPress={() => onToggle(year)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 14,
              backgroundColor: isSelected ? color : theme.colors.white,
              borderWidth: 1.5,
              borderColor: color,
            }}
          >
            <Subtitle
              style={{ color: isSelected ? "#fff" : color, fontSize: 13 }}
            >
              {year}
            </Subtitle>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function CropFilter({
  crops,
  selectedCrops,
  onToggle,
}: {
  crops: string[];
  selectedCrops: string[];
  onToggle: (crop: string) => void;
}) {
  const theme = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 6 }}
    >
      {crops.map((crop) => {
        const isSelected = selectedCrops.includes(crop);
        return (
          <TouchableOpacity
            key={crop}
            onPress={() => onToggle(crop)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 16,
              backgroundColor: isSelected
                ? theme.colors.primary
                : theme.colors.white,
              borderWidth: 1,
              borderColor: isSelected
                ? theme.colors.primary
                : theme.colors.gray3,
            }}
          >
            <Subtitle
              style={{
                color: isSelected ? "#fff" : theme.colors.gray1,
                fontSize: 13,
              }}
            >
              {crop}
            </Subtitle>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// Pick the best display unit based on the maximum kg value across all data
function pickDisplayUnit(maxKg: number): { label: string; divisor: number } {
  if (maxKg >= 1000) return { label: "t", divisor: 1000 };
  if (maxKg >= 100) return { label: "dt", divisor: 100 };
  if (maxKg >= 1) return { label: "kg", divisor: 1 };
  return { label: "g", divisor: 0.001 };
}

// Format a Y-axis value: drop decimals when they're not needed, otherwise show up to 1 decimal
function formatYValue(raw: string, unitLabel: string): string {
  const n = Number(raw);
  const formatted =
    n === Math.floor(n)
      ? String(Math.round(n))
      : (Math.round(n * 10) / 10).toString();
  return `${formatted} ${unitLabel}`;
}

/** Line chart showing monthly totals, one line per year */
function MonthlyLineChart({
  monthlyData,
  selectedYears,
  availableYears,
  unit,
}: {
  monthlyData: Record<number, number[]>;
  selectedYears: number[];
  availableYears: number[];
  unit: { label: string; divisor: number };
}) {
  const theme = useTheme();
  const [selectedPoint, setSelectedPoint] = useState<{
    month: number;
    year: number;
    value: number;
  } | null>(null);

  // Build cumulative totals so months without entries carry forward the last value
  const lineSets = selectedYears.map((year) => {
    const yearIdx = availableYears.indexOf(year);
    let cumulative = 0;
    const data: lineDataItem[] = Array.from({ length: 12 }, (_, month) => {
      cumulative += monthlyData[year]?.[month] ?? 0;
      const value = cumulative / unit.divisor;
      return {
        value,
        label: MONTH_LABELS[month],
        onPress: () =>
          setSelectedPoint({
            month,
            year,
            value: Math.round(value * 100) / 100,
          }),
      };
    });
    return { data, color: getYearColor(yearIdx >= 0 ? yearIdx : 0) };
  });

  if (lineSets.length === 0) return null;

  // Compute maxValue from all data so the chart scales properly
  let dataMax = 0;
  for (const set of lineSets) {
    for (const point of set.data) {
      if ((point.value ?? 0) > dataMax) dataMax = point.value ?? 0;
    }
  }
  // Round up to a nice number with some headroom
  const maxValue = dataMax === 0 ? 10 : Math.ceil(dataMax * 1.15);

  return (
    <View style={{ gap: 4 }}>
      {selectedPoint && (
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.gray1,
            textAlign: "center",
          }}
        >
          {MONTH_LABELS[selectedPoint.month]} {selectedPoint.year} ·{" "}
          {formatYValue(String(selectedPoint.value), unit.label)}
        </Text>
      )}
      <LineChart
        data={lineSets[0].data}
        {...(lineSets[1] ? { data2: lineSets[1].data } : {})}
        {...(lineSets[2] ? { data3: lineSets[2].data } : {})}
        {...(lineSets[3] ? { data4: lineSets[3].data } : {})}
        {...(lineSets[4] ? { data5: lineSets[4].data } : {})}
        color1={lineSets[0]?.color}
        color2={lineSets[1]?.color}
        color3={lineSets[2]?.color}
        color4={lineSets[3]?.color}
        color5={lineSets[4]?.color}
        dataPointsColor1={lineSets[0]?.color}
        dataPointsColor2={lineSets[1]?.color}
        dataPointsColor3={lineSets[2]?.color}
        dataPointsColor4={lineSets[3]?.color}
        dataPointsColor5={lineSets[4]?.color}
        maxValue={maxValue}
        mostNegativeValue={0}
        height={140}
        spacing={44}
        initialSpacing={15}
        endSpacing={10}
        dataPointsHeight={5}
        dataPointsWidth={5}
        xAxisColor={theme.colors.gray4}
        yAxisColor={theme.colors.gray4}
        yAxisTextStyle={{ color: theme.colors.gray2, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: theme.colors.gray2, fontSize: 9 }}
        rulesColor={theme.colors.gray4}
        rulesType="dashed"
        noOfSections={4}
        yAxisLabelWidth={45}
        formatYLabel={(v) => formatYValue(v, unit.label)}
      />
    </View>
  );
}

/** Grouped bar chart showing monthly data with one bar per year */
function MonthlyGroupedBarChart({
  monthlyData,
  selectedYears,
  availableYears,
  unit,
}: {
  monthlyData: Record<number, number[]>;
  selectedYears: number[];
  availableYears: number[];
  unit: { label: string; divisor: number };
}) {
  const theme = useTheme();
  const [selectedBar, setSelectedBar] = useState<{
    month: number;
    year: number;
    value: number;
  } | null>(null);

  const yearCount = selectedYears.length;

  // Use comfortable fixed sizes; chart scrolls horizontally if needed
  const barWidth = 12;
  const innerGap = yearCount > 1 ? 3 : 0;
  const groupGap = 16;
  const groupWidth =
    yearCount * barWidth + Math.max(yearCount - 1, 0) * innerGap;

  const noOfSections = 3;
  const barData: barDataItem[] = [];
  let dataMax = 0;
  for (let month = 0; month < 12; month++) {
    for (let i = 0; i < yearCount; i++) {
      const year = selectedYears[i];
      const yearIdx = availableYears.indexOf(year);
      const value = (monthlyData[year]?.[month] ?? 0) / unit.divisor;
      if (value > dataMax) dataMax = value;
      const isFirst = i === 0;
      const isLast = i === yearCount - 1;

      const item: barDataItem = {
        value,
        frontColor: getYearColor(yearIdx >= 0 ? yearIdx : i),
      };

      if (isFirst) {
        item.label = MONTH_LABELS[month];
        item.labelTextStyle = { color: theme.colors.gray2, fontSize: 9 };
        // Only set labelWidth for multi-year so the label spans the group;
        // for single year, let the library default handle it
        if (yearCount > 1) {
          item.labelWidth = groupWidth;
        }
      }

      if (!isLast) {
        item.spacing = innerGap;
      }

      barData.push(item);
    }
  }

  const maxValue =
    dataMax === 0
      ? noOfSections
      : Math.ceil(dataMax / noOfSections) * noOfSections;

  return (
    <View style={{ flex: 1, gap: 4 }}>
      {selectedBar && (
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.gray1,
            textAlign: "center",
          }}
        >
          {MONTH_LABELS[selectedBar.month]} {selectedBar.year} ·{" "}
          {formatYValue(String(selectedBar.value), unit.label)}
        </Text>
      )}
      <BarChart
        data={barData}
        barWidth={barWidth}
        spacing={groupGap}
        roundedTop
        height={120}
        maxValue={maxValue}
        rulesThickness={1}
        rulesColor={theme.colors.gray4}
        xAxisThickness={1}
        xAxisColor={theme.colors.gray4}
        yAxisThickness={0}
        yAxisTextStyle={{ color: theme.colors.gray2, fontSize: 10 }}
        yAxisLabelWidth={45}
        noOfSections={noOfSections}
        formatYLabel={(v) => formatYValue(v, unit.label)}
        onPress={(item: barDataItem, index: number) => {
          const barMonth = Math.floor(index / yearCount);
          const yearIdx = index % yearCount;
          setSelectedBar({
            month: barMonth,
            year: selectedYears[yearIdx],
            value: Math.round((item.value ?? 0) * 100) / 100,
          });
        }}
      />
    </View>
  );
}

type HarvestDashboardProps = {
  harvestSummaries: HarvestSummary[];
};

export function HarvestDashboard({ harvestSummaries }: HarvestDashboardProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const availableYears = useMemo(
    () =>
      [...new Set(harvestSummaries.map((s) => s.year))].sort((a, b) => b - a),
    [harvestSummaries],
  );

  const [selectedYears, setSelectedYears] = useState<number[]>(() =>
    availableYears.length > 0 ? [availableYears[0]] : [],
  );
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);

  const toggleYear = useCallback((year: number) => {
    setSelectedYears((prev) => {
      if (prev.includes(year)) {
        if (prev.length === 1) return prev;
        return prev.filter((y) => y !== year);
      }
      return [...prev, year].sort((a, b) => a - b);
    });
  }, []);

  const toggleCrop = useCallback((crop: string) => {
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop],
    );
  }, []);

  // Discover all crops
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

  // Build data: crop → conservationMethod → { total per year, monthly per year }
  type CropData = Record<
    string,
    Record<
      string,
      { total: Record<number, number>; monthly: Record<number, number[]> }
    >
  >;
  const cropData = useMemo(() => {
    const result: CropData = {};
    for (const s of harvestSummaries) {
      if (!selectedYears.includes(s.year)) continue;
      for (const pq of s.producedQuantities) {
        if (pq.totalAmountInKilos === 0) continue;
        const cm = pq.conservationMethod ?? "none";
        if (!result[pq.forageName]) result[pq.forageName] = {};
        if (!result[pq.forageName][cm]) {
          result[pq.forageName][cm] = { total: {}, monthly: {} };
        }
        const entry = result[pq.forageName][cm];
        if (!entry.monthly[s.year]) {
          entry.monthly[s.year] = new Array(12).fill(0);
          entry.total[s.year] = 0;
        }
        entry.monthly[s.year][s.month] += pq.totalAmountInKilos;
        entry.total[s.year] += pq.totalAmountInKilos;
      }
    }
    return result;
  }, [harvestSummaries, selectedYears]);

  return (
    <View style={{ gap: theme.spacing.m }}>
      {/* Year selector */}
      <YearMultiSelect
        years={availableYears}
        selectedYears={selectedYears}
        onToggle={toggleYear}
      />

      {/* Crop filter */}
      {allCrops.length > 1 && (
        <CropFilter
          crops={allCrops}
          selectedCrops={selectedCrops}
          onToggle={toggleCrop}
        />
      )}

      {/* Year legend */}
      <Legend
        labels={selectedYears.map((year) => ({
          text: year.toString(),
          color: getYearColor(availableYears.indexOf(year)),
        }))}
      />

      {/* Per crop → per conservation method */}
      {visibleCrops.map((cropName) => {
        const conservationMethods = cropData[cropName];
        if (!conservationMethods) return null;
        const cmKeys = Object.keys(conservationMethods);

        return cmKeys.map((cm) => {
          const { monthly, total } = conservationMethods[cm];
          // Pick unit based on max total kg across selected years
          const maxKg = Math.max(0, ...Object.values(total));
          const unit = pickDisplayUnit(maxKg);
          // Card title: "CropName - ConservationMethod" or just "CropName" if none
          const cmLabel =
            cm === "none"
              ? undefined
              : t(
                  `harvests.labels.conservation_method.${cm as ConservationMethod}`,
                );
          const cardTitle = cmLabel ? `${cropName} - ${cmLabel}` : cropName;

          return (
            <Card key={`${cropName}-${cm}`}>
              <Card.Title style={{ flex: 1 }}>{cardTitle}</Card.Title>
              <Card.Content style={{ gap: theme.spacing.l }}>
                <View
                  style={{ gap: theme.spacing.s, marginTop: theme.spacing.s }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: theme.colors.gray2,
                    }}
                  >
                    {t("harvests.total_amount")}
                  </Text>
                  <MonthlyLineChart
                    monthlyData={monthly}
                    selectedYears={selectedYears}
                    availableYears={availableYears}
                    unit={unit}
                  />
                </View>
                <View
                  style={{
                    height: 1,
                    backgroundColor: theme.colors.gray4,
                  }}
                />
                <View style={{ gap: theme.spacing.s }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: theme.colors.gray2,
                    }}
                  >
                    {t("harvests.amount_per_month")}
                  </Text>
                  <MonthlyGroupedBarChart
                    monthlyData={monthly}
                    selectedYears={selectedYears}
                    availableYears={availableYears}
                    unit={unit}
                  />
                </View>
              </Card.Content>
            </Card>
          );
        });
      })}
    </View>
  );
}
