import { IonIconButton } from "@/components/buttons/IconButton";
import { ChartLegend } from "@/components/charts/ChartLegend";
import { ChartPager } from "@/components/charts/ChartPager";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate, parseDateOnly } from "@/utils/date";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalsQuery } from "./animals.hooks";
import { useHerdByIdQuery } from "./herds.hooks";
import { HerdParasiteOverviewScreenProps } from "./navigation/animals-routes";
import {
  FAMACHA_COLORS,
  FamachaDistributionRows,
  PARASITE_TYPES,
  parasiteCountUnitKey,
  TimelineChart,
} from "./ParasiteCharts";
import { useHerdParasiteOverviewQuery } from "./parasite-checks.hooks";

export function HerdParasiteOverviewScreen({
  route,
  navigation,
}: HerdParasiteOverviewScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { herdId } = route.params;
  const { herd } = useHerdByIdQuery(herdId);
  const { animals } = useAnimalsQuery();
  const { checks, isLoading } = useHerdParasiteOverviewQuery(herdId);

  const famachaChartChecks = checks
    .filter((check) => check.method === "famacha")
    .map((check) => ({
      id: check.id,
      date: check.date,
      famachaAverage: check.summary.famachaAverage,
      animals: check.animals,
    }))
    .filter((chartCheck) => chartCheck.famachaAverage !== null);
  // Charts use all checks, the list only base checks (re-checks are shown inside them)
  const baseChecks = checks.filter((check) => check.previousCheckId === null);

  // Herd average count per check, one chart per parasite type found in the results
  const fecChartPages = useMemo(
    () =>
      PARASITE_TYPES.flatMap((parasiteType) => {
        const points = checks.flatMap((check) => {
          const entry = check.summary.fecByParasite.find(
            (fecEntry) => fecEntry.parasiteType === parasiteType,
          );
          return entry
            ? [
                {
                  date: parseDateOnly(check.date),
                  value: entry.avgCountPerGram,
                },
              ]
            : [];
        });
        return points.length > 0 ? [{ parasiteType, points }] : [];
      }),
    [checks],
  );
  const treatmentDates = useMemo(
    () =>
      checks.flatMap((check) =>
        check.treatment ? [parseDateOnly(check.treatment.startDate)] : [],
      ),
    [checks],
  );

  function startCheck() {
    const herdAnimalIds = (animals ?? [])
      .filter((animal) => animal.herdId === herdId && !animal.dateOfDeath)
      .map((animal) => animal.id);
    navigation.navigate("ParasiteCheckForm", {
      herdId,
      animalIds: herdAnimalIds,
    });
  }

  const title = t("parasite_checks.parasite_control");

  return (
    <ContentView headerVisible>
      <ScrollView showHeaderOnScroll headerTitleOnScroll={title}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <H2>{title}</H2>
            {herd && (
              <Subtitle style={{ color: theme.colors.gray2, marginTop: 4 }}>
                {herd.name}
              </Subtitle>
            )}
          </View>
          {canWrite("animals") && (
            <IonIconButton
              icon="add-outline"
              type="accent"
              iconSize={22}
              color={theme.colors.primary}
              onPress={startCheck}
            />
          )}
        </View>

        {!isLoading && checks.length === 0 && (
          <Subtitle style={{ marginTop: theme.spacing.m }}>
            {t("parasite_checks.no_checks")}
          </Subtitle>
        )}

        {/* All charts as swipeable cards: one per parasite type, then FAMACHA */}
        {(fecChartPages.length > 0 || famachaChartChecks.length > 0) && (
          <ChartPager
            pages={[
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
                      {t(`parasite_checks.parasite_types.${parasiteType}`)} Ø (
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
                          label: t("parasite_checks.herd_average"),
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
              ...(famachaChartChecks.length > 0
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
                            {t("parasite_checks.famacha_distribution")}
                          </Subtitle>
                          <FamachaDistributionRows
                            checks={famachaChartChecks}
                          />
                          <ChartLegend
                            items={[1, 2, 3, 4, 5].map((score) => ({
                              color: FAMACHA_COLORS[score],
                              label: String(score),
                            }))}
                          />
                        </View>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        )}

        {baseChecks.length > 0 && (
          <View style={{ marginTop: theme.spacing.l }}>
            <H3>{t("parasite_checks.checks")}</H3>
            <View
              style={{
                marginTop: theme.spacing.s,
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
            >
              {baseChecks.map((check) => (
                <ListItem
                  key={check.id}
                  style={{ paddingVertical: 5 }}
                  onPress={() =>
                    navigation.navigate("ParasiteCheckDetail", {
                      checkId: check.id,
                    })
                  }
                >
                  <ListItem.Content>
                    {/* The herd is known on this screen, so the title is just the method */}
                    <ListItem.Title>
                      {t(`parasite_checks.methods.${check.method}`)}
                    </ListItem.Title>
                    <ListItem.Body>
                      {[
                        formatLocalizedDate(parseDateOnly(check.date), locale),
                        check.rechecks.length > 0
                          ? t("parasite_checks.n_rechecks", {
                              count: check.rechecks.length,
                            })
                          : undefined,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </ListItem.Body>
                  </ListItem.Content>
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
