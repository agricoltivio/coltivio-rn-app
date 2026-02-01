import { useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useTheme } from "styled-components/native";
import { TimelinePlotData } from "./timeline-utils";
import { TimelinePlotRow, ROW_HEIGHT } from "./TimelinePlotRow";

type CropRotationTimelineProps = {
  plotData: TimelinePlotData[];
  onBarPress: (rotationId: string, plotName: string) => void;
};

const MONTH_WIDTH = 80;
const TOTAL_GRID_WIDTH = MONTH_WIDTH * 12;
const PLOT_LABEL_WIDTH = 100;
const MONTH_HEADER_HEIGHT = 28;

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function CropRotationTimeline({
  plotData,
  onBarPress,
}: CropRotationTimelineProps) {
  const theme = useTheme();
  const plotNamesScrollRef = useRef<ScrollView>(null);

  // Sync vertical scroll of grid body to plot names column
  function handleVerticalScroll(
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) {
    const offsetY = event.nativeEvent.contentOffset.y;
    plotNamesScrollRef.current?.scrollTo({ y: offsetY, animated: false });
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.white,
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <View style={{ flexDirection: "row", flex: 1 }}>
        {/* Left column: plot names */}
        <View style={{ width: PLOT_LABEL_WIDTH }}>
          {/* Empty header spacer aligned with month headers */}
          <View
            style={{
              height: MONTH_HEADER_HEIGHT,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.gray4,
              justifyContent: "center",
              paddingHorizontal: 6,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: theme.colors.gray2,
              }}
            >
              Plot
            </Text>
          </View>
          {/* Plot names list, scroll disabled (synced from grid scroll) */}
          <ScrollView
            ref={plotNamesScrollRef}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          >
            {plotData.map((plot) => (
              <View
                key={plot.plotId}
                style={{
                  height: ROW_HEIGHT,
                  justifyContent: "center",
                  paddingHorizontal: 6,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.gray4,
                  borderRightWidth: 1,
                  borderRightColor: theme.colors.gray4,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: theme.colors.gray1,
                  }}
                >
                  {plot.plotName}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Right area: horizontal scroll for months + grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ width: TOTAL_GRID_WIDTH }}>
            {/* Month headers */}
            <View
              style={{
                flexDirection: "row",
                height: MONTH_HEADER_HEIGHT,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.gray4,
              }}
            >
              {MONTH_LABELS.map((label, index) => (
                <View
                  key={label}
                  style={{
                    width: MONTH_WIDTH,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRightWidth: index < 11 ? 1 : 0,
                    borderRightColor: theme.colors.gray4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: theme.colors.gray2,
                    }}
                  >
                    {label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Grid body with vertical scroll synced to plot names */}
            <ScrollView
              onScroll={handleVerticalScroll}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
            >
              {plotData.map((plot) => (
                <TimelinePlotRow
                  key={plot.plotId}
                  bars={plot.bars}
                  totalGridWidth={TOTAL_GRID_WIDTH}
                  monthWidth={MONTH_WIDTH}
                  onBarPress={onBarPress}
                />
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
