import { Subtitle } from "@/theme/Typography";
import { matchFont } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { Platform, View } from "react-native";
import { useTheme } from "styled-components/native";
import { Pie, PolarChart } from "victory-native";
import { ChartLegend } from "./ChartLegend";

const CHART_SIZE = 180;
// Leaves room around the ring for labels placed outside it (radiusOffset > 1).
const OUTSIDE_LABEL_PIE_SIZE = 110;

export function DonutChartCard({
  title,
  data,
  legendItems,
  sliceLabel = "none",
  emptyMessage,
}: {
  title: string;
  // `label` is only used when sliceLabel isn't "none" — legendItems carries
  // the full translated names (and counts/areas) shown below the chart.
  data: { label: string; value: number; color: string }[];
  legendItems: { color: string; label: string }[];
  // "none": color-only ring, all detail lives in the legend. "inside": bold
  // white count, centered on the slice. "outside": smaller label just
  // outside the ring — keeps slices readable even when some are too thin to
  // hold text themselves.
  sliceLabel?: "none" | "inside" | "outside";
  emptyMessage: string;
}) {
  const theme = useTheme();

  const insideFont = useMemo(
    () =>
      matchFont({
        fontFamily: Platform.select({
          ios: "Helvetica",
          android: "sans-serif",
          default: "sans-serif",
        }),
        fontSize: 13,
        fontWeight: "bold",
      }),
    [],
  );
  const outsideFont = useMemo(
    () =>
      matchFont({
        fontFamily: Platform.select({
          ios: "Helvetica",
          android: "sans-serif",
          default: "sans-serif",
        }),
        fontSize: 11,
        fontWeight: "bold",
      }),
    [],
  );

  return (
    <View
      style={{
        backgroundColor: theme.colors.white,
        borderRadius: theme.radii.l,
        padding: theme.spacing.m,
      }}
    >
      <Subtitle style={{ fontWeight: "600", marginBottom: theme.spacing.s }}>
        {title}
      </Subtitle>
      {data.length === 0 ? (
        <Subtitle>{emptyMessage}</Subtitle>
      ) : (
        <>
          <View
            style={{
              alignSelf: "center",
              width: CHART_SIZE,
              height: CHART_SIZE,
            }}
          >
            <PolarChart
              data={data}
              labelKey="label"
              valueKey="value"
              colorKey="color"
            >
              <Pie.Chart
                innerRadius="60%"
                size={
                  sliceLabel === "outside" ? OUTSIDE_LABEL_PIE_SIZE : undefined
                }
              >
                {({ slice }) => (
                  <>
                    <Pie.Slice>
                      <Pie.SliceAngularInset
                        angularInset={{
                          angularStrokeWidth: 2,
                          angularStrokeColor: theme.colors.white,
                        }}
                      />
                    </Pie.Slice>
                    {sliceLabel === "inside" && (
                      <Pie.Label
                        font={insideFont}
                        color="white"
                        radiusOffset={0.8}
                      />
                    )}
                    {sliceLabel === "outside" && (
                      <Pie.Label
                        font={outsideFont}
                        color={theme.colors.gray1}
                        radiusOffset={1.3}
                      />
                    )}
                  </>
                )}
              </Pie.Chart>
            </PolarChart>
          </View>
          <ChartLegend items={legendItems} />
        </>
      )}
    </View>
  );
}
