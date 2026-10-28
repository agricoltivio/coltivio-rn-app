import { AnimalType } from "@/api/animals.api";
import { ParasiteCheck, ParasiteType } from "@/api/parasite-checks.api";
import { IonIconButton } from "@/components/buttons/IconButton";
import { ChartLegend } from "@/components/charts/ChartLegend";
import { ChartPager } from "@/components/charts/ChartPager";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate, parseDateOnly } from "@/utils/date";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView as RNScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { ParasiteChecksScreenProps } from "./navigation/animals-routes";
import {
  FAMACHA_COLORS,
  FamachaDistributionRows,
  PARASITE_TYPES,
  parasiteCountUnitKey,
  TimelineChart,
} from "./ParasiteCharts";
import { useParasiteChecksQuery } from "./parasite-checks.hooks";

// Number of animals a check's value for this parasite is based on
function fecCoverage(check: ParasiteCheck, parasiteType: ParasiteType) {
  return check.fecSamples
    .filter((sample) =>
      sample.results.some((result) => result.parasiteType === parasiteType),
    )
    .reduce((sum, sample) => sum + sample.animalIds.length, 0);
}

export function ParasiteChecksScreen({
  navigation,
}: ParasiteChecksScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { checks: allChecks, isLoading } = useParasiteChecksQuery();

  // A check only contains one animal type; offer the types that have checks,
  // the most common one first
  const animalTypes = useMemo(() => {
    const countsByType = new Map<AnimalType, number>();
    for (const check of allChecks) {
      if (check.animalType) {
        countsByType.set(
          check.animalType,
          (countsByType.get(check.animalType) ?? 0) + 1,
        );
      }
    }
    return [...countsByType.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([animalType]) => animalType);
  }, [allChecks]);
  const [selectedAnimalType, setSelectedAnimalType] = useState<
    AnimalType | undefined
  >();
  const animalType =
    selectedAnimalType && animalTypes.includes(selectedAnimalType)
      ? selectedAnimalType
      : animalTypes[0];

  // Charts include re-checks; every value shows how many animals it is based on
  const typeChecks = allChecks.filter(
    (check) => check.animalType === animalType,
  );
  const treatmentDates = typeChecks.flatMap((check) =>
    check.treatment ? [parseDateOnly(check.treatment.startDate)] : [],
  );
  const fecChartPages = PARASITE_TYPES.flatMap((parasiteType) => {
    const points = typeChecks.flatMap((check) => {
      const entry = check.summary.fecByParasite.find(
        (fecEntry) => fecEntry.parasiteType === parasiteType,
      );
      return entry
        ? [
            {
              date: parseDateOnly(check.date),
              value: entry.avgCountPerGram,
              label: String(fecCoverage(check, parasiteType)),
            },
          ]
        : [];
    });
    return points.length > 0 ? [{ parasiteType, points }] : [];
  });
  const famachaChartChecks = typeChecks
    .filter((check) => check.method === "famacha")
    .map((check) => ({
      id: check.id,
      date: check.date,
      famachaAverage: check.summary.famachaAverage,
      animals: check.animals,
    }))
    .filter((chartCheck) => chartCheck.famachaAverage !== null);

  // Re-checks are listed inside their base check
  const baseChecks = typeChecks.filter(
    (check) => check.previousCheckId === null,
  );

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
          <H2>{title}</H2>
          {canWrite("animals") && (
            <IonIconButton
              icon="add-outline"
              type="accent"
              iconSize={22}
              color={theme.colors.primary}
              onPress={() => navigation.navigate("ParasiteCheckForm", {})}
            />
          )}
        </View>

        {!isLoading && allChecks.length === 0 && (
          <Subtitle style={{ marginTop: theme.spacing.m }}>
            {t("parasite_checks.no_checks")}
          </Subtitle>
        )}

        {/* Charts and list are always for one animal type */}
        {animalTypes.length > 0 && (
          <RNScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: theme.spacing.m, flexGrow: 0 }}
            contentContainerStyle={{
              gap: theme.spacing.xs,
              paddingVertical: theme.spacing.xs,
            }}
          >
            {animalTypes.map((typeOption) => (
              <FilterChip
                key={typeOption}
                label={t(`animals.animal_types.${typeOption}`)}
                active={typeOption === animalType}
                onPress={() => setSelectedAnimalType(typeOption)}
              />
            ))}
          </RNScrollView>
        )}

        {(fecChartPages.length > 0 || famachaChartChecks.length > 0) && (
          <>
            <ChartPager
              pages={[
                // FAMACHA first, then one page per parasite
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
                        {t(`parasite_checks.parasite_types.${parasiteType}`)} Ø
                        ({t(parasiteCountUnitKey(parasiteType))})
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
                            label: t("parasite_checks.average_per_check"),
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
            <Subtitle
              style={{
                fontSize: 12,
                color: theme.colors.gray2,
                marginTop: theme.spacing.xs,
              }}
            >
              {t("parasite_checks.chart_counts_info")}
            </Subtitle>
          </>
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
              {[...baseChecks]
                .sort(
                  (a, b) =>
                    parseDateOnly(b.date).getTime() -
                    parseDateOnly(a.date).getTime(),
                )
                .map((check) => (
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
                      <ListItem.Title>
                        {check.name ||
                          t(`parasite_checks.methods.${check.method}`)}
                      </ListItem.Title>
                      <ListItem.Body>
                        {[
                          formatLocalizedDate(
                            parseDateOnly(check.date),
                            locale,
                          ),
                          t("parasite_checks.n_animals", {
                            count: check.animals.length,
                          }),
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

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: active ? theme.colors.primary : theme.colors.white,
        borderWidth: 1,
        borderColor: active ? theme.colors.primary : theme.colors.gray3,
      }}
    >
      <Subtitle
        style={{
          color: active ? theme.colors.white : theme.colors.gray1,
          fontSize: 14,
        }}
      >
        {label}
      </Subtitle>
    </TouchableOpacity>
  );
}
