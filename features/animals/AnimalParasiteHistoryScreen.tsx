import { ChartLegend } from "@/components/charts/ChartLegend";
import { ChartPager } from "@/components/charts/ChartPager";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate, parseDateOnly } from "@/utils/date";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalByIdQuery } from "./animals.hooks";
import { AnimalParasiteHistoryScreenProps } from "./navigation/animals-routes";
import {
  animalDisplayName,
  FAMACHA_COLORS,
  FamachaBadge,
  PARASITE_TYPES,
  parasiteCountUnitKey,
  TimelineChart,
} from "./ParasiteCharts";
import { useAnimalParasiteHistoryQuery } from "./parasite-checks.hooks";

type TimelineEntry =
  | { kind: "famacha"; key: string; date: Date; checkId: string; score: number }
  | {
      kind: "fec";
      key: string;
      date: Date;
      checkId: string;
      pooled: boolean;
      poolSize: number;
      text: string;
    }
  | {
      kind: "treatment";
      key: string;
      date: Date;
      treatmentId: string;
      text: string;
    };

export function AnimalParasiteHistoryScreen({
  route,
  navigation,
}: AnimalParasiteHistoryScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const { animalId } = route.params;
  const { animal } = useAnimalByIdQuery(animalId);
  const { history, isLoading } = useAnimalParasiteHistoryQuery(animalId);

  const famachaPoints = useMemo(
    () =>
      (history?.checks ?? []).flatMap((entry) =>
        entry.famachaScore === null
          ? []
          : [{ date: parseDateOnly(entry.date), value: entry.famachaScore }],
      ),
    [history],
  );

  const treatmentDates = useMemo(
    () =>
      (history?.treatments ?? []).map((treatment) =>
        parseDateOnly(treatment.startDate),
      ),
    [history],
  );

  // One chart page per parasite type this animal has results for
  const fecChartPages = useMemo(
    () =>
      PARASITE_TYPES.flatMap((parasiteType) => {
        const points = (history?.fecResults ?? []).flatMap((fecResult) => {
          const result = fecResult.results.find(
            (entry) => entry.parasiteType === parasiteType,
          );
          return result
            ? [
                {
                  date: parseDateOnly(fecResult.date),
                  value: result.countPerGram,
                },
              ]
            : [];
        });
        return points.length > 0 ? [{ parasiteType, points }] : [];
      }),
    [history],
  );

  const timelineEntries = useMemo(() => {
    if (!history) return [];
    const entries: TimelineEntry[] = [
      ...history.checks.flatMap((entry): TimelineEntry[] =>
        entry.famachaScore === null
          ? []
          : [
              {
                kind: "famacha",
                key: `famacha-${entry.checkId}`,
                date: parseDateOnly(entry.date),
                checkId: entry.checkId,
                score: entry.famachaScore,
              },
            ],
      ),
      ...history.fecResults.map(
        (fecResult): TimelineEntry => ({
          kind: "fec",
          key: `fec-${fecResult.sampleId}`,
          date: parseDateOnly(fecResult.date),
          checkId: fecResult.checkId,
          pooled: fecResult.pooled,
          poolSize: fecResult.poolSize,
          text: fecResult.results
            .map(
              (result) =>
                `${t(`parasite_checks.parasite_types.${result.parasiteType}`)} ${Math.round(result.countPerGram)} ${t(parasiteCountUnitKey(result.parasiteType))}`,
            )
            .join(" · "),
        }),
      ),
      ...history.treatments.map(
        (treatment): TimelineEntry => ({
          kind: "treatment",
          key: `treatment-${treatment.id}`,
          date: parseDateOnly(treatment.startDate),
          treatmentId: treatment.id,
          text: treatment.drugName
            ? `${treatment.name} (${treatment.drugName})`
            : treatment.name,
        }),
      ),
    ];
    return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [history, t]);

  const title = t("parasite_checks.parasite_history");

  return (
    <ContentView headerVisible>
      <ScrollView showHeaderOnScroll headerTitleOnScroll={title}>
        <H2>{title}</H2>
        {animal && (
          <Subtitle style={{ color: theme.colors.gray2, marginTop: 4 }}>
            {animalDisplayName(animal.name, animal.earTag?.number)}
          </Subtitle>
        )}

        {!isLoading && timelineEntries.length === 0 && (
          <Subtitle style={{ marginTop: theme.spacing.m }}>
            {t("parasite_checks.no_checks")}
          </Subtitle>
        )}

        {/* All charts as swipeable cards: one per parasite type, then FAMACHA */}
        {(fecChartPages.length > 0 || famachaPoints.length > 0) && (
          <ChartPager
            pages={[
              // FAMACHA first, then one page per parasite
              ...(famachaPoints.length > 0
                ? [
                    {
                      key: "famacha",
                      content: (
                        <View>
                          <Subtitle
                            style={{
                              fontWeight: "600",
                              marginBottom: theme.spacing.s,
                            }}
                          >
                            {t("parasite_checks.methods.famacha")}
                          </Subtitle>
                          <TimelineChart
                            points={famachaPoints}
                            markers={treatmentDates}
                            minValue={1}
                            maxValue={5}
                            invertY
                            color={FAMACHA_COLORS[2]}
                          />
                          <ChartLegend
                            items={[
                              {
                                color: FAMACHA_COLORS[2],
                                label: t("parasite_checks.famacha_score"),
                              },
                              {
                                color: theme.colors.warning,
                                label: t("parasite_checks.treatment"),
                              },
                            ]}
                          />
                        </View>
                      ),
                    },
                  ]
                : []),
              ...fecChartPages.map(({ parasiteType, points }) => ({
                key: parasiteType,
                content: (
                  <View>
                    <Subtitle
                      style={{
                        fontWeight: "600",
                        marginBottom: theme.spacing.s,
                      }}
                    >
                      {t(`parasite_checks.parasite_types.${parasiteType}`)} (
                      {t(parasiteCountUnitKey(parasiteType))})
                    </Subtitle>
                    <TimelineChart
                      points={points}
                      markers={treatmentDates}
                      minValue={0}
                      color={theme.colors.primary}
                    />
                    <ChartLegend
                      items={[
                        {
                          color: theme.colors.primary,
                          label: t(
                            `parasite_checks.parasite_types.${parasiteType}`,
                          ),
                        },
                        {
                          color: theme.colors.warning,
                          label: t("parasite_checks.treatment"),
                        },
                      ]}
                    />
                  </View>
                ),
              })),
            ]}
          />
        )}

        {timelineEntries.length > 0 && (
          <View style={{ marginTop: theme.spacing.l }}>
            <H3>{t("parasite_checks.timeline")}</H3>
            <View
              style={{
                marginTop: theme.spacing.s,
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
            >
              {timelineEntries.map((entry) => (
                <ListItem
                  key={entry.key}
                  style={{ paddingVertical: 5 }}
                  onPress={() =>
                    entry.kind === "treatment"
                      ? navigation.navigate("EditTreatment", {
                          treatmentId: entry.treatmentId,
                        })
                      : navigation.navigate("ParasiteCheckDetail", {
                          checkId: entry.checkId,
                        })
                  }
                >
                  <ListItem.Content>
                    <ListItem.Title>
                      {entry.kind === "famacha" &&
                        t("parasite_checks.methods.famacha")}
                      {entry.kind === "fec" && entry.text}
                      {entry.kind === "treatment" && entry.text}
                    </ListItem.Title>
                    <ListItem.Body>
                      {formatLocalizedDate(entry.date, locale)}
                      {entry.kind === "treatment" &&
                        ` · ${t("parasite_checks.treatment")}`}
                      {entry.kind === "fec" &&
                        ` · ${
                          entry.pooled
                            ? t("parasite_checks.pooled_sample", {
                                count: entry.poolSize,
                              })
                            : t("parasite_checks.individual_sample")
                        }`}
                    </ListItem.Body>
                  </ListItem.Content>
                  {entry.kind === "famacha" && (
                    <FamachaBadge score={entry.score} />
                  )}
                  <ListItem.Chevron />
                </ListItem>
              ))}
            </View>
          </View>
        )}
        <View style={{ height: theme.spacing.l }} />
      </ScrollView>
    </ContentView>
  );
}
