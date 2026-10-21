import { OutdoorSchedule } from "@/api/herds.api";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { round } from "@/utils/math";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatOutdoorScheduleSummary } from "./outdoor-schedule-summary";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useHerdsQuery } from "./herds.hooks";
import {
  computeMeadowMonthlyUsage,
  getMeadowUsageYears,
} from "./meadow-usage-utils";
import { MeadowUsageCharts } from "./MeadowUsageCharts";
import { useMeadowByIdQuery, useMeadowUsageQuery } from "./meadows.hooks";
import { MeadowDetailsScreenProps } from "./navigation/animals-routes";

const WEEKDAY_ORDER = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

// Usage of a meadow: charts per month for a selected year, and the outdoor
// schedules assigned to it (one entry per schedule, not per repetition)
export function MeadowDetailsScreen({
  route,
  navigation,
}: MeadowDetailsScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const locale = i18n.language;
  const { meadowId } = route.params;
  const { meadow } = useMeadowByIdQuery(meadowId);
  const { usage } = useMeadowUsageQuery(meadowId);
  const { herds } = useHerdsQuery();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const availableYears = useMemo(
    () => getMeadowUsageYears(usage ?? [], currentYear),
    [usage, currentYear],
  );
  const monthlyUsage = useMemo(
    () => computeMeadowMonthlyUsage(usage ?? [], selectedYear, new Date()),
    [usage, selectedYear],
  );

  // Every schedule of every herd that uses this meadow, newest first
  const meadowSchedules = useMemo(
    () =>
      (herds ?? [])
        .flatMap((herd) =>
          herd.outdoorSchedules
            .filter((schedule) => schedule.meadowId === meadowId)
            .map((schedule) => ({ herd, schedule })),
        )
        .sort(
          (a, b) =>
            new Date(b.schedule.startDate).getTime() -
            new Date(a.schedule.startDate).getTime(),
        ),
    [herds, meadowId],
  );

  if (!meadow) return null;

  return (
    <ContentView headerVisible>
      <ScrollView showHeaderOnScroll headerTitleOnScroll={meadow.name}>
        <H2>{meadow.name}</H2>
        <Subtitle style={{ marginTop: theme.spacing.xs }}>
          {t("animals.meadows.size_value", {
            are: round(meadow.size / 100, 1),
            squareMeters: round(meadow.size, 0),
          })}
        </Subtitle>

        <View style={{ marginTop: theme.spacing.m }}>
          {/* Keyed by year so the selected month resets per year */}
          <MeadowUsageCharts
            key={selectedYear}
            usage={monthlyUsage}
            year={selectedYear}
            availableYears={availableYears}
            onSelectYear={setSelectedYear}
          />
        </View>

        <H3
          style={{ marginTop: theme.spacing.l, marginBottom: theme.spacing.s }}
        >
          {t("animals.outdoor_schedules")}
        </H3>
        {meadowSchedules.length === 0 && (
          <Subtitle>{t("common.no_entries")}</Subtitle>
        )}
        {meadowSchedules.length > 0 && (
          <View
            style={{
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: theme.colors.white,
            }}
          >
            {meadowSchedules.map(({ herd, schedule }, index) => (
              <ListItem
                key={schedule.id}
                style={{ paddingVertical: 5 }}
                onPress={() =>
                  navigation.navigate("HerdEdit", { herdId: herd.id })
                }
                hideBottomDivider={index === meadowSchedules.length - 1}
              >
                <ListItem.Content>
                  <ListItem.Title>{herd.name}</ListItem.Title>
                  <ListItem.Body>
                    {formatOutdoorScheduleSummary(schedule, t, locale)}
                  </ListItem.Body>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            ))}
          </View>
        )}
      </ScrollView>
    </ContentView>
  );
}
