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
import { CropProtectionApplicationSummary } from "@/api/cropProtectionApplications.api";

const YEAR_COLORS = [
  "#4A90D9", "#E67E22", "#2ECC71", "#9B59B6", "#E74C3C",
  "#1ABC9C", "#F39C12", "#3498DB", "#8E44AD", "#27AE60",
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
    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: theme.spacing.s }}>
      {labels.map((label) => (
        <View key={label.text} style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
          <View style={{ height: 12, width: 12, borderRadius: 6, backgroundColor: label.color, marginRight: 6 }} />
          <Text style={{ fontSize: 14, color: theme.colors.gray2 }}>{label.text}</Text>
        </View>
      ))}
    </View>
  );
}

function YearMultiSelect({ years, selectedYears, onToggle }: { years: number[]; selectedYears: number[]; onToggle: (year: number) => void }) {
  const theme = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
      {years.map((year, index) => {
        const isSelected = selectedYears.includes(year);
        const color = getYearColor(index);
        return (
          <TouchableOpacity key={year} onPress={() => onToggle(year)} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, backgroundColor: isSelected ? color : theme.colors.white, borderWidth: 1.5, borderColor: color }}>
            <Subtitle style={{ color: isSelected ? "#fff" : color, fontSize: 13 }}>{year}</Subtitle>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function ProductFilter({ products, selected, onToggle }: { products: string[]; selected: string[]; onToggle: (name: string) => void }) {
  const theme = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
      {products.map((name) => {
        const isSelected = selected.includes(name);
        return (
          <TouchableOpacity key={name} onPress={() => onToggle(name)} style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, backgroundColor: isSelected ? theme.colors.primary : theme.colors.white, borderWidth: 1, borderColor: isSelected ? theme.colors.primary : theme.colors.gray3 }}>
            <Subtitle style={{ color: isSelected ? "#fff" : theme.colors.gray1, fontSize: 13 }}>{name}</Subtitle>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function MonthlyLineChart({ monthlyData, selectedYears, availableYears }: { monthlyData: Record<number, number[]>; selectedYears: number[]; availableYears: number[] }) {
  const theme = useTheme();
  const lineSets = selectedYears.map((year) => {
    const yearIdx = availableYears.indexOf(year);
    const data: lineDataItem[] = Array.from({ length: 12 }, (_, month) => ({ value: monthlyData[year]?.[month] ?? 0, label: MONTH_LABELS[month] }));
    return { data, color: getYearColor(yearIdx >= 0 ? yearIdx : 0) };
  });
  if (lineSets.length === 0) return null;
  let dataMax = 0;
  for (const set of lineSets) for (const point of set.data) if ((point.value ?? 0) > dataMax) dataMax = point.value ?? 0;
  const maxValue = dataMax === 0 ? 10 : Math.ceil(dataMax * 1.15);
  return (
    <LineChart
      data={lineSets[0].data}
      {...(lineSets[1] ? { data2: lineSets[1].data } : {})}
      {...(lineSets[2] ? { data3: lineSets[2].data } : {})}
      {...(lineSets[3] ? { data4: lineSets[3].data } : {})}
      {...(lineSets[4] ? { data5: lineSets[4].data } : {})}
      color1={lineSets[0]?.color} color2={lineSets[1]?.color} color3={lineSets[2]?.color} color4={lineSets[3]?.color} color5={lineSets[4]?.color}
      dataPointsColor1={lineSets[0]?.color} dataPointsColor2={lineSets[1]?.color} dataPointsColor3={lineSets[2]?.color} dataPointsColor4={lineSets[3]?.color} dataPointsColor5={lineSets[4]?.color}
      maxValue={maxValue} mostNegativeValue={0} height={140} spacing={44} initialSpacing={15} endSpacing={10}
      dataPointsHeight={5} dataPointsWidth={5}
      xAxisColor={theme.colors.gray4} yAxisColor={theme.colors.gray4}
      yAxisTextStyle={{ color: theme.colors.gray2, fontSize: 10 }} xAxisLabelTextStyle={{ color: theme.colors.gray2, fontSize: 9 }}
      rulesColor={theme.colors.gray4} rulesType="dashed" noOfSections={4} yAxisLabelWidth={45}
    />
  );
}

function MonthlyGroupedBarChart({ monthlyData, selectedYears, availableYears, unit }: { monthlyData: Record<number, number[]>; selectedYears: number[]; availableYears: number[]; unit: string }) {
  const theme = useTheme();
  const yearCount = selectedYears.length;
  const barWidth = 12;
  const innerGap = yearCount > 1 ? 3 : 0;
  const groupGap = 16;
  const groupWidth = yearCount * barWidth + Math.max(yearCount - 1, 0) * innerGap;

  const barData: barDataItem[] = [];
  for (let month = 0; month < 12; month++) {
    for (let i = 0; i < yearCount; i++) {
      const year = selectedYears[i];
      const yearIdx = availableYears.indexOf(year);
      const item: barDataItem = { value: monthlyData[year]?.[month] ?? 0, frontColor: getYearColor(yearIdx >= 0 ? yearIdx : i) };
      if (i === 0) {
        item.label = MONTH_LABELS[month];
        item.labelTextStyle = { color: theme.colors.gray2, fontSize: 9 };
        if (yearCount > 1) item.labelWidth = groupWidth;
      }
      if (i < yearCount - 1) item.spacing = innerGap;
      barData.push(item);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <BarChart data={barData} barWidth={barWidth} spacing={groupGap} roundedTop height={120}
        rulesThickness={1} rulesColor={theme.colors.gray4} xAxisThickness={1} xAxisColor={theme.colors.gray4}
        yAxisThickness={0} yAxisTextStyle={{ color: theme.colors.gray2, fontSize: 10 }} yAxisLabelWidth={45}
        noOfSections={3} formatYLabel={(v) => `${Math.round(Number(v) * 10) / 10} ${unit}`} disablePress
      />
    </View>
  );
}

type Props = {
  summaries: CropProtectionApplicationSummary[];
  availableYears: number[];
};

export function CropProtectionApplicationDashboard({ summaries, availableYears }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const defaultYears = availableYears.length > 0 ? [availableYears[0]] : [];
  const [selectedYears, setSelectedYears] = useState<number[]>(defaultYears);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const toggleYear = useCallback((year: number) => {
    setSelectedYears((prev) => {
      if (prev.includes(year)) { if (prev.length === 1) return prev; return prev.filter((y) => y !== year); }
      return [...prev, year].sort((a, b) => a - b);
    });
  }, []);

  const toggleProduct = useCallback((name: string) => {
    setSelectedProducts((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  }, []);

  const allProducts = useMemo(
    () => [...new Set(summaries.flatMap((s) => s.appliedCropProtections.filter((ap) => ap.totalAmount > 0).map((ap) => ap.productName)))],
    [summaries],
  );
  const visibleProducts = selectedProducts.length === 0 ? allProducts : selectedProducts;

  type ProdData = Record<string, { unit: string; monthly: Record<number, number[]> }>;
  const prodData = useMemo(() => {
    const result: ProdData = {};
    for (const s of summaries) {
      if (!selectedYears.includes(s.year)) continue;
      for (const ap of s.appliedCropProtections) {
        if (ap.totalAmount === 0) continue;
        if (!result[ap.productName]) result[ap.productName] = { unit: ap.unit, monthly: {} };
        const entry = result[ap.productName];
        if (!entry.monthly[s.year]) { entry.monthly[s.year] = new Array(12).fill(0); }
        entry.monthly[s.year][s.month] += ap.totalAmount;
      }
    }
    return result;
  }, [summaries, selectedYears]);

  return (
    <View style={{ gap: theme.spacing.m }}>
      <YearMultiSelect years={availableYears} selectedYears={selectedYears} onToggle={toggleYear} />
      {allProducts.length > 1 && (
        <ProductFilter products={allProducts} selected={selectedProducts} onToggle={toggleProduct} />
      )}
      <Legend labels={selectedYears.map((year) => ({ text: year.toString(), color: getYearColor(availableYears.indexOf(year)) }))} />

      {visibleProducts.map((prodName) => {
        const data = prodData[prodName];
        if (!data) return null;
        return (
          <Card key={prodName}>
            <Card.Title style={{ flex: 1 }}>{prodName}</Card.Title>
            <Card.Content style={{ gap: theme.spacing.l }}>
              <View style={{ gap: theme.spacing.s, marginTop: theme.spacing.s }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: theme.colors.gray2 }}>{t("harvests.total_amount")}</Text>
                <MonthlyLineChart monthlyData={data.monthly} selectedYears={selectedYears} availableYears={availableYears} />
              </View>
              <View style={{ height: 1, backgroundColor: theme.colors.gray4 }} />
              <View style={{ gap: theme.spacing.s }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: theme.colors.gray2 }}>{t("harvests.amount_per_month")}</Text>
                <MonthlyGroupedBarChart monthlyData={data.monthly} selectedYears={selectedYears} availableYears={availableYears} unit={data.unit} />
              </View>
            </Card.Content>
          </Card>
        );
      })}
    </View>
  );
}
