import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { ChartLegend } from "@/components/charts/ChartLegend";
import { ChartPager } from "@/components/charts/ChartPager";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate, parseDateOnly } from "@/utils/date";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Alert, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { ParasiteCheckDetailScreenProps } from "./navigation/animals-routes";
import {
  animalDisplayName,
  FAMACHA_COLORS,
  FamachaBadge,
  FamachaDistributionRows,
  PARASITE_TYPES,
  parasiteCountUnitKey,
  TimelineChart,
} from "./ParasiteCharts";
import {
  useDeleteParasiteCheckMutation,
  useParasiteCheckByIdQuery,
} from "./parasite-checks.hooks";

// Fecal egg count reduction thresholds commonly used to judge dewormer efficacy
const FECRT_EFFECTIVE_PERCENT = 95;
const FECRT_SUSPECTED_PERCENT = 90;

export function ParasiteCheckDetailScreen({
  route,
  navigation,
}: ParasiteCheckDetailScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { checkId } = route.params;
  const { check } = useParasiteCheckByIdQuery(checkId);
  const deleteMutation = useDeleteParasiteCheckMutation(() =>
    navigation.goBack(),
  );

  if (!check) return null;

  const checkDate = parseDateOnly(check.date);
  const { herd, treatment, comparisonToPrevious } = check;
  const isRecheck = comparisonToPrevious !== null;
  const title = `${t(`parasite_checks.methods.${check.method}`)} · ${formatLocalizedDate(checkDate, locale)}`;

  function handleDelete() {
    // Re-checks are deleted together with their base check
    Alert.alert(
      check && check.rechecks.length > 0
        ? t("parasite_checks.delete_check_with_rechecks_confirm", {
            count: check.rechecks.length,
          })
        : t("parasite_checks.delete_check_confirm"),
      undefined,
      [
        { text: t("buttons.cancel"), style: "cancel" },
        {
          text: t("buttons.delete"),
          style: "destructive",
          onPress: () => deleteMutation.mutate(checkId),
        },
      ],
    );
  }

  function addRecheck() {
    if (!check) return;
    navigation.navigate("ParasiteCheckForm", {
      method: check.method,
      herdId: check.herdId ?? undefined,
      previousCheckId: check.id,
    });
  }

  function reductionColor(reductionPercent: number | null) {
    if (reductionPercent === null) return theme.colors.gray2;
    if (reductionPercent >= FECRT_EFFECTIVE_PERCENT)
      return theme.colors.success;
    if (reductionPercent >= FECRT_SUSPECTED_PERCENT)
      return theme.colors.warning;
    return theme.colors.danger;
  }

  // Chart of the base check and its re-checks. Re-check values are derived from
  // the comparison against this check (after average / average change).
  // Lower FAMACHA is better, so a falling average is an improvement
  function famachaChangeColor(change: number) {
    if (change < 0) return theme.colors.success;
    if (change > 0) return theme.colors.danger;
    return theme.colors.gray2;
  }

  // One chart page per parasite type found in both the base check and a re-check
  const fecChartPages = PARASITE_TYPES.flatMap((parasiteType) => {
    const baseEntry = check.summary.fecByParasite.find(
      (entry) => entry.parasiteType === parasiteType,
    );
    if (!baseEntry) return [];
    const recheckPoints = check.rechecks.flatMap((recheck) => {
      const reduction = recheck.fecReduction.find(
        (entry) => entry.parasiteType === parasiteType,
      );
      return reduction
        ? [
            {
              date: parseDateOnly(recheck.date),
              value: reduction.afterAvgCountPerGram,
            },
          ]
        : [];
    });
    if (recheckPoints.length === 0) return [];
    return [
      {
        parasiteType,
        points: [
          { date: checkDate, value: baseEntry.avgCountPerGram },
          ...recheckPoints,
        ],
      },
    ];
  });
  // Base check and its re-checks with per-animal scores for the dot chart
  const famachaChartChecks = [
    {
      id: check.id,
      date: check.date,
      famachaAverage: check.summary.famachaAverage,
      animals: check.animals,
    },
    ...check.rechecks.map((recheck) => ({
      id: recheck.id,
      date: recheck.date,
      famachaAverage: recheck.famachaAverage,
      animals: recheck.animals,
    })),
  ].filter((chartCheck) => chartCheck.famachaAverage !== null);
  const treatmentDates = [
    ...(treatment ? [parseDateOnly(treatment.startDate)] : []),
    ...check.rechecks.flatMap((recheck) =>
      recheck.treatment ? [parseDateOnly(recheck.treatment.startDate)] : [],
    ),
  ];

  const pooledSamples = check.fecSamples.filter((sample) => sample.pooled);
  const individualSamples = check.fecSamples.filter((sample) => !sample.pooled);
  // Individual sample results shown on the animal's list item
  const individualResultsByAnimal = new Map(
    individualSamples.map((sample) => [sample.animalIds[0], sample.results]),
  );

  return (
    <ContentView
      headerVisible
      footerComponent={
        canWrite("animals") ? (
          <BottomActionContainer>
            <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
              <Button
                style={{ flexGrow: 1 }}
                type="danger"
                title={t("buttons.delete")}
                onPress={handleDelete}
                disabled={deleteMutation.isPending}
                loading={deleteMutation.isPending}
              />
              <Button
                style={{ flexGrow: 1 }}
                title={t("buttons.edit")}
                onPress={() =>
                  navigation.navigate("ParasiteCheckForm", { checkId })
                }
              />
            </View>
          </BottomActionContainer>
        ) : undefined
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={title}>
        <H2>{title}</H2>
        {comparisonToPrevious && (
          <TouchableOpacity
            style={{ marginTop: 4 }}
            onPress={() =>
              navigation.push("ParasiteCheckDetail", {
                checkId: comparisonToPrevious.previousCheckId,
              })
            }
          >
            <Subtitle style={{ color: theme.colors.primary }}>
              {t("parasite_checks.recheck_of", {
                date: formatLocalizedDate(
                  parseDateOnly(comparisonToPrevious.previousDate),
                  locale,
                ),
              })}
            </Subtitle>
          </TouchableOpacity>
        )}

        {/* Context */}
        {(herd ||
          treatment ||
          check.labName ||
          check.followUpTasks.length > 0) && (
          <View
            style={{
              marginTop: theme.spacing.m,
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: theme.colors.white,
            }}
          >
            {herd && (
              <ListItem
                onPress={() =>
                  navigation.navigate("HerdParasiteOverview", {
                    herdId: herd.id,
                  })
                }
              >
                <ListItem.Content>
                  <ListItem.Body>{t("animals.herd")}</ListItem.Body>
                  <ListItem.Title>{herd.name}</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            )}
            {treatment && (
              <ListItem
                onPress={() =>
                  navigation.navigate("EditTreatment", {
                    treatmentId: treatment.id,
                  })
                }
              >
                <ListItem.Content>
                  <ListItem.Body>
                    {t("parasite_checks.treatment")}
                  </ListItem.Body>
                  <ListItem.Title>
                    {treatment.name} ·{" "}
                    {formatLocalizedDate(
                      parseDateOnly(treatment.startDate),
                      locale,
                    )}
                  </ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            )}
            {check.labName && (
              <ListItem>
                <ListItem.Content>
                  <ListItem.Body>{t("parasite_checks.lab_name")}</ListItem.Body>
                  <ListItem.Title>{check.labName}</ListItem.Title>
                </ListItem.Content>
              </ListItem>
            )}
            {check.followUpTasks.map((task) => (
              <ListItem
                key={task.id}
                onPress={() =>
                  navigation.navigate("TaskDetail", { taskId: task.id })
                }
              >
                <ListItem.Content>
                  <ListItem.Body>
                    {t("parasite_checks.follow_up_task")}
                  </ListItem.Body>
                  <ListItem.Title>
                    {task.name}
                    {task.dueDate
                      ? ` · ${formatLocalizedDate(parseDateOnly(task.dueDate), locale)}`
                      : ""}
                  </ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            ))}
          </View>
        )}

        {/* Charts of the base check and its re-checks as swipeable cards */}
        {!isRecheck &&
          (fecChartPages.length > 0 || famachaChartChecks.length > 0) && (
            <ChartPager
              pages={[
                ...(check.method === "fecal_egg_count"
                  ? fecChartPages
                  : []
                ).map(({ parasiteType, points }) => ({
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
                ...(check.method === "famacha" && famachaChartChecks.length > 0
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
                            {/* Only card on this screen, no need to line up */}
                            <FamachaDistributionRows
                              checks={famachaChartChecks}
                              grow
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

        {/* Summary of this check; values per animal are in the animal list */}
        <Card title={t("parasite_checks.summary")}>
          {check.method === "famacha" ? (
            <Subtitle>
              {check.summary.famachaAverage === null
                ? t("parasite_checks.n_animals", {
                    count: check.summary.animalCount,
                  })
                : t("parasite_checks.famacha_summary", {
                    count: check.summary.animalCount,
                    average: check.summary.famachaAverage.toFixed(1),
                  })}
            </Subtitle>
          ) : (
            <>
              <Subtitle style={{ fontSize: 13, color: theme.colors.gray2 }}>
                {pooledSamples.length > 0
                  ? [
                      t("parasite_checks.pooled_sample", {
                        count: pooledSamples[0].animalIds.length,
                      }),
                      pooledSamples[0].label,
                    ]
                      .filter(Boolean)
                      .join(" · ")
                  : individualSamples.length > 0
                    ? t("parasite_checks.results_status_individual", {
                        recorded: individualSamples.length,
                        total: check.animals.length,
                      })
                    : t("parasite_checks.results_status_none")}
              </Subtitle>
              {check.summary.fecByParasite.map((entry) => (
                <View
                  key={entry.parasiteType}
                  style={{
                    flexDirection: "row",
                    gap: theme.spacing.s,
                    paddingVertical: 2,
                  }}
                >
                  <Subtitle numberOfLines={1} style={{ flex: 1 }}>
                    {t(`parasite_checks.parasite_types.${entry.parasiteType}`)}
                  </Subtitle>
                  <Subtitle style={{ flexShrink: 0, fontWeight: "600" }}>
                    {entry.sampleCount > 1
                      ? `Ø ${Math.round(entry.avgCountPerGram)} (${Math.round(entry.minCountPerGram)}–${Math.round(entry.maxCountPerGram)})`
                      : Math.round(entry.avgCountPerGram)}{" "}
                    {t(parasiteCountUnitKey(entry.parasiteType))}
                  </Subtitle>
                </View>
              ))}
            </>
          )}
        </Card>

        {/* Re-checks of this base check */}
        {!isRecheck && (
          <View>
            <>
              {/* Title below the chart, directly above the list */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: theme.spacing.l,
                }}
              >
                <H3>{t("parasite_checks.rechecks")}</H3>
                {canWrite("animals") && (
                  <IonIconButton
                    icon="add-outline"
                    type="accent"
                    iconSize={22}
                    color={theme.colors.primary}
                    onPress={addRecheck}
                  />
                )}
              </View>

              {check.rechecks.length > 0 && (
                <View
                  style={{
                    marginTop: theme.spacing.s,
                    borderRadius: 10,
                    overflow: "hidden",
                    backgroundColor: theme.colors.white,
                  }}
                >
                  {check.rechecks.map((recheck) => (
                    <ListItem
                      key={recheck.id}
                      style={{ paddingVertical: 5 }}
                      onPress={() =>
                        navigation.push("ParasiteCheckDetail", {
                          checkId: recheck.id,
                        })
                      }
                    >
                      <ListItem.Content>
                        <ListItem.Title>
                          {formatLocalizedDate(
                            parseDateOnly(recheck.date),
                            locale,
                          )}
                        </ListItem.Title>
                        {recheck.treatment && (
                          <ListItem.Body>
                            {t("parasite_checks.treatment")}:{" "}
                            {recheck.treatment.name}
                          </ListItem.Body>
                        )}
                        {/* Same row layout as the fecal egg count reduction */}
                        {recheck.famachaAverage !== null &&
                          recheck.famachaAverageChange !== null && (
                            <View
                              style={{
                                flexDirection: "row",
                                gap: theme.spacing.s,
                              }}
                            >
                              <Subtitle
                                numberOfLines={1}
                                style={{
                                  flex: 1,
                                  fontSize: 13,
                                  color: theme.colors.gray2,
                                }}
                              >
                                {t("parasite_checks.famacha_score")} (Ø{" "}
                                {recheck.famachaAverage.toFixed(1)})
                              </Subtitle>
                              <Subtitle
                                style={{
                                  flexShrink: 0,
                                  fontSize: 13,
                                  fontWeight: "700",
                                  color: famachaChangeColor(
                                    recheck.famachaAverageChange,
                                  ),
                                }}
                              >
                                {recheck.famachaAverageChange > 0 ? "+" : ""}
                                {recheck.famachaAverageChange.toFixed(1)}
                              </Subtitle>
                            </View>
                          )}
                        {recheck.fecReduction.map((entry) => (
                          <View
                            key={entry.parasiteType}
                            style={{
                              flexDirection: "row",
                              gap: theme.spacing.s,
                            }}
                          >
                            <Subtitle
                              numberOfLines={1}
                              style={{
                                flex: 1,
                                fontSize: 13,
                                color: theme.colors.gray2,
                              }}
                            >
                              {t(
                                `parasite_checks.parasite_types.${entry.parasiteType}`,
                              )}{" "}
                              ({entry.afterSampleCount > 1 ? "Ø " : ""}
                              {Math.round(entry.afterAvgCountPerGram)}{" "}
                              {t(parasiteCountUnitKey(entry.parasiteType))})
                            </Subtitle>
                            <Subtitle
                              style={{
                                flexShrink: 0,
                                fontSize: 13,
                                fontWeight: "700",
                                color: reductionColor(entry.reductionPercent),
                              }}
                            >
                              {entry.reductionPercent === null
                                ? "–"
                                : `${Math.round(entry.reductionPercent)}%`}
                            </Subtitle>
                          </View>
                        ))}
                      </ListItem.Content>
                      <ListItem.Chevron />
                    </ListItem>
                  ))}
                </View>
              )}
              {check.rechecks.length > 0 &&
                check.method === "fecal_egg_count" && (
                  <Subtitle
                    style={{
                      fontSize: 12,
                      color: theme.colors.gray2,
                      marginTop: theme.spacing.xs,
                    }}
                  >
                    {t("parasite_checks.reduction_info")}
                  </Subtitle>
                )}
              {check.rechecks.length === 0 && (
                <Subtitle
                  style={{
                    color: theme.colors.gray2,
                    marginTop: theme.spacing.s,
                  }}
                >
                  {t("parasite_checks.no_rechecks")}
                </Subtitle>
              )}
            </>
          </View>
        )}

        {/* Animals */}
        <View style={{ marginTop: theme.spacing.l }}>
          <H3>{t("animals.animals")}</H3>
          <View
            style={{
              marginTop: theme.spacing.s,
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: theme.colors.white,
            }}
          >
            {check.animals.map((checkAnimal) => (
              <ListItem
                key={checkAnimal.animalId}
                style={{ paddingVertical: 5 }}
                onPress={() =>
                  navigation.navigate("AnimalParasiteHistory", {
                    animalId: checkAnimal.animalId,
                  })
                }
              >
                <ListItem.Content>
                  <ListItem.Title>
                    {animalDisplayName(
                      checkAnimal.name,
                      checkAnimal.earTagNumber,
                    )}
                  </ListItem.Title>
                  {/* Same small lines as in the re-check items */}
                  {individualResultsByAnimal
                    .get(checkAnimal.animalId)
                    ?.map((result) => (
                      <Subtitle
                        key={result.parasiteType}
                        numberOfLines={1}
                        style={{ fontSize: 13, color: theme.colors.gray2 }}
                      >
                        {t(
                          `parasite_checks.parasite_types.${result.parasiteType}`,
                        )}{" "}
                        ({Math.round(result.countPerGram)}{" "}
                        {t(parasiteCountUnitKey(result.parasiteType))})
                      </Subtitle>
                    ))}
                </ListItem.Content>
                {checkAnimal.famachaScore !== null && (
                  <FamachaBadge score={checkAnimal.famachaScore} />
                )}
                <ListItem.Chevron />
              </ListItem>
            ))}
          </View>
        </View>

        {check.notes && (
          <Card title={t("common.notes")}>
            <Subtitle>{check.notes}</Subtitle>
          </Card>
        )}
        <View style={{ height: theme.spacing.l }} />
      </ScrollView>
    </ContentView>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View
      style={{
        marginTop: theme.spacing.m,
        backgroundColor: theme.colors.white,
        borderRadius: 10,
        padding: theme.spacing.m,
        gap: 4,
      }}
    >
      <Subtitle style={{ fontWeight: "600", marginBottom: 4 }}>
        {title}
      </Subtitle>
      {children}
    </View>
  );
}
