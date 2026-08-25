import { AnimalWithWaitingTimeFlag } from "@/api/animals.api";
import { StatCard } from "@/components/card/StatCard";
import { ChartLegend } from "@/components/charts/ChartLegend";
import { animalTypeColor, hslToHex } from "@/components/charts/chartColors";
import { DonutChartCard } from "@/components/charts/DonutChartCard";
import { ContentView } from "@/components/containers/ContentView";
import { H2, Subtitle } from "@/theme/Typography";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutChangeEvent, ScrollView, View } from "react-native";
import { Circle, G, Line, Svg, Text as SvgText } from "react-native-svg";
import { useTheme } from "styled-components/native";
import { useAnimalsQuery } from "./animals.hooks";
import { AnimalChartsScreenProps } from "./navigation/animals-routes";

// Deterministic jitter offset from a string id so dots don't all stack on one horizontal line
function jitterFromId(id: string, range: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return ((Math.abs(hash) % 1000) / 1000) * range;
}

type ScatterPoint = {
  ageYears: number;
  jitter: number;
  color: string;
  name: string;
};

function AgeScatterPlot({
  points,
  maxAge,
}: {
  points: ScatterPoint[];
  maxAge: number;
}) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  function onLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  const height = 120;
  const paddingLeft = 24;
  const paddingRight = 12;
  const paddingTop = 10;
  const paddingBottom = 24;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // One tick per year up to maxAge, but cap at 10 ticks to avoid clutter
  const tickStep = Math.ceil(maxAge / 10);

  return (
    <View onLayout={onLayout} style={{ width: "100%" }}>
      {width > 0 && points.length > 0 ? (
        <Svg width={width} height={height}>
          {/* X axis */}
          <Line
            x1={paddingLeft}
            y1={paddingTop + plotHeight}
            x2={paddingLeft + plotWidth}
            y2={paddingTop + plotHeight}
            stroke={theme.colors.gray3}
            strokeWidth={1}
          />
          {/* Y axis */}
          <Line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={paddingTop + plotHeight}
            stroke={theme.colors.gray3}
            strokeWidth={1}
          />
          {/* X axis ticks & labels (in years) */}
          {Array.from({ length: Math.floor(maxAge / tickStep) + 1 }, (_, i) => {
            const year = i * tickStep;
            if (year > maxAge) return null;
            const x = paddingLeft + (year / maxAge) * plotWidth;
            return (
              <G key={year}>
                <Line
                  x1={x}
                  y1={paddingTop + plotHeight}
                  x2={x}
                  y2={paddingTop + plotHeight + 4}
                  stroke={theme.colors.gray3}
                  strokeWidth={1}
                />
                <SvgText
                  x={x}
                  y={paddingTop + plotHeight + 14}
                  fontSize={9}
                  fill={theme.colors.gray2}
                  textAnchor="middle"
                >
                  {year}
                </SvgText>
              </G>
            );
          })}
          {/* Data points */}
          {points.map((pt, idx) => {
            const x = paddingLeft + (pt.ageYears / maxAge) * plotWidth;
            const y = paddingTop + pt.jitter * plotHeight;
            return (
              <Circle
                key={idx}
                cx={x}
                cy={y}
                r={4}
                fill={pt.color}
                fillOpacity={0.8}
              />
            );
          })}
        </Svg>
      ) : (
        // Placeholder while width is measured or no data
        <View style={{ height }} />
      )}
    </View>
  );
}

export function AnimalChartsScreen(_props: AnimalChartsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  // Fetch all animals including dead ones for complete stats
  const { animals } = useAnimalsQuery(false);

  const currentYear = new Date().getFullYear();

  const { bornThisYear, diedCount, slaughteredCount } = useMemo(() => {
    if (!animals) return { bornThisYear: 0, diedCount: 0, slaughteredCount: 0 };
    return {
      bornThisYear: animals.filter(
        (a) =>
          a.dateOfBirth &&
          new Date(a.dateOfBirth).getFullYear() === currentYear,
      ).length,
      diedCount: animals.filter((a) => a.deathReason === "died").length,
      slaughteredCount: animals.filter((a) => a.deathReason === "slaughtered")
        .length,
    };
  }, [animals, currentYear]);

  // Pie chart: count per type (all animals)
  const { pieData, animalTypes } = useMemo(() => {
    if (!animals) return { pieData: [], animalTypes: [] };
    const counts: Record<string, number> = {};
    for (const a of animals) {
      counts[a.type] = (counts[a.type] ?? 0) + 1;
    }
    const types = Object.keys(counts);
    const pie = types.map((type) => ({
      value: counts[type],
      color: hslToHex(animalTypeColor(type)),
      label: String(counts[type]),
    }));
    return { pieData: pie, animalTypes: types };
  }, [animals]);

  // Scatter: living animals with known birthdate, age in years
  const { scatterPoints, maxAgeYears } = useMemo(() => {
    if (!animals) return { scatterPoints: [], maxAgeYears: 1 };
    const now = Date.now();
    const points: ScatterPoint[] = [];
    let maxAge = 1;
    for (const a of animals) {
      if (a.dateOfDeath || !a.dateOfBirth) continue;
      const ageYears =
        (now - new Date(a.dateOfBirth).getTime()) /
        (1000 * 60 * 60 * 24 * 365.25);
      if (ageYears < 0) continue;
      if (ageYears > maxAge) maxAge = ageYears;
      points.push({
        ageYears,
        jitter: jitterFromId(a.id, 1),
        color: hslToHex(animalTypeColor(a.type)),
        name: a.name,
      });
    }
    return { scatterPoints: points, maxAgeYears: Math.ceil(maxAge) };
  }, [animals]);

  const hasAnimals = (animals?.length ?? 0) > 0;

  return (
    <ContentView headerVisible>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: theme.spacing.m,
          paddingBottom: theme.spacing.xl,
        }}
      >
        <H2>{t("animals.charts.title")}</H2>

        {/* Stat cards */}
        <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
          <StatCard
            label={t("animals.charts.born_this_year")}
            value={bornThisYear}
          />
          <StatCard label={t("animals.charts.died")} value={diedCount} />
          <StatCard
            label={t("animals.charts.slaughtered")}
            value={slaughteredCount}
          />
        </View>

        {!hasAnimals ? (
          <Subtitle>{t("animals.charts.no_data")}</Subtitle>
        ) : (
          <>
            {/* Pie chart: animals per type */}
            <DonutChartCard
              title={t("animals.charts.animals_by_type")}
              data={pieData}
              legendItems={animalTypes.map((type, index) => ({
                color: hslToHex(animalTypeColor(type)),
                label: `${t(`animals.animal_types.${type}`)} (${pieData[index].value})`,
              }))}
              emptyMessage={t("animals.charts.no_data")}
            />

            {/* Scatter: age distribution */}
            {scatterPoints.length > 0 && (
              <View
                style={{
                  backgroundColor: theme.colors.white,
                  borderRadius: theme.radii.l,
                  padding: theme.spacing.m,
                }}
              >
                <Subtitle
                  style={{ fontWeight: "600", marginBottom: theme.spacing.xs }}
                >
                  {t("animals.charts.age_distribution")}
                </Subtitle>
                <Subtitle
                  style={{
                    fontSize: 11,
                    color: theme.colors.gray2,
                    marginBottom: theme.spacing.s,
                  }}
                >
                  {t("animals.charts.age_months")}
                </Subtitle>
                <AgeScatterPlot points={scatterPoints} maxAge={maxAgeYears} />
                <ChartLegend
                  items={animalTypes
                    .filter((type) =>
                      scatterPoints.some(
                        (p) => p.color === hslToHex(animalTypeColor(type)),
                      ),
                    )
                    .map((type) => ({
                      color: hslToHex(animalTypeColor(type)),
                      label: t(`animals.animal_types.${type}`),
                    }))}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ContentView>
  );
}
