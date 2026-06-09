import { Card } from "@/components/card/Card";
import { Chip } from "@/components/chips/Chip";
import { Body, H2 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components/native";
import { useBioComplianceChecks } from "./bio-compliance.hooks";
import { BioComplianceScreenProps } from "./navigation/bio-compliance-routes";
import { CheckId, CheckLink, CheckStatus } from "./rules/types";

const CAVEAT_KEY: Partial<Record<CheckId, string>> = {
  withdrawalStatus: "bio_compliance.caveats.withdrawal",
  rausCoverage: "bio_compliance.caveats.raus",
};

export function BioComplianceScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<BioComplianceScreenProps["navigation"]>();
  const { results, isLoading } = useBioComplianceChecks();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onPressFor(link?: CheckLink): (() => void) | undefined {
    if (!link) return undefined;
    switch (link.kind) {
      case "rotationPlot":
        return () => navigation.navigate("PlotDetails", { plotId: link.plotId });
      case "fertilizerApplication":
        return () =>
          navigation.navigate("FertilizerApplicationDetails", {
            fertilizerApplicationId: link.id,
          });
      case "animal":
        return () => navigation.navigate("AnimalDetails", { animalId: link.id });
      case "treatment":
        return undefined; // no by-id treatment detail screen
    }
  }

  const statusColor: Record<CheckStatus, string> = {
    ok: theme.colors.success,
    warn: theme.colors.amber,
    fail: theme.colors.danger,
    info: theme.colors.primary,
    no_data: theme.colors.gray3,
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: theme.spacing.m,
        gap: theme.spacing.m,
      }}
    >
      <H2>{t("bio_compliance.title")}</H2>

      <View
        style={{
          backgroundColor: theme.colors.warning,
          borderRadius: theme.radii.m,
          padding: theme.spacing.m,
        }}
      >
        <Body style={{ fontWeight: "600" }}>
          {t("bio_compliance.banner.title")}
        </Body>
        <Body style={{ marginTop: 4 }}>
          {t("bio_compliance.banner.description")}
        </Body>
      </View>

      {isLoading && results.length === 0 ? (
        <ActivityIndicator
          style={{ marginTop: theme.spacing.l }}
          color={theme.colors.primary}
        />
      ) : null}

      {results.map((r) => (
        <Card key={r.id}>
          <Pressable
            onPress={() => toggleExpanded(r.id)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: theme.spacing.s,
            }}
          >
            <View style={{ flex: 1 }}>
              <Card.Title>
                {t(`bio_compliance.checks.${r.id}.label`)}
              </Card.Title>
              <Body style={{ color: theme.colors.gray2, marginTop: 2 }}>
                {t(`bio_compliance.checks.${r.id}.description`)}
              </Body>
            </View>
            <View style={{ alignItems: "flex-end", gap: 4 }}>
              <Chip
                small
                label={`${t(`bio_compliance.status.${r.status}`)}${
                  r.failingCount > 0 ? ` · ${r.failingCount}` : ""
                }`}
                bgColor={statusColor[r.status]}
                textColor={theme.colors.white}
              />
              <Ionicons
                name={expanded.has(r.id) ? "chevron-up" : "chevron-down"}
                size={18}
                color={theme.colors.gray2}
              />
            </View>
          </Pressable>

          {expanded.has(r.id) ? (
          <Card.Content>
            {CAVEAT_KEY[r.id] ? (
              <Body
                style={{
                  fontSize: 12,
                  color: theme.colors.gray2,
                  marginBottom: theme.spacing.s,
                }}
              >
                {t(CAVEAT_KEY[r.id] as string)}
              </Body>
            ) : null}

            {r.status === "no_data" ? (
              <Body style={{ color: theme.colors.gray2 }}>
                {t("bio_compliance.noData")}
              </Body>
            ) : r.items.length === 0 ? (
              <Body style={{ color: theme.colors.gray2 }}>
                {t("bio_compliance.noFindings")}
              </Body>
            ) : (
              <View style={{ gap: theme.spacing.xs }}>
                {r.items.map((item, i) => {
                  const onPress = onPressFor(item.link);
                  const rowStyle = {
                    flexDirection: "row" as const,
                    justifyContent: "space-between" as const,
                    alignItems: "center" as const,
                    gap: theme.spacing.s,
                    paddingVertical: 2,
                  };
                  const inner = (
                    <>
                      <Body style={{ fontWeight: "500", flexShrink: 1 }}>
                        {item.label}
                      </Body>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {item.detail ? (
                          <Body style={{ color: theme.colors.gray2 }}>
                            {item.detail}
                          </Body>
                        ) : null}
                        {onPress ? (
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color={theme.colors.gray2}
                          />
                        ) : null}
                      </View>
                    </>
                  );
                  return onPress ? (
                    <Pressable key={i} onPress={onPress} style={rowStyle}>
                      {inner}
                    </Pressable>
                  ) : (
                    <View key={i} style={rowStyle}>
                      {inner}
                    </View>
                  );
                })}
              </View>
            )}
          </Card.Content>
          ) : null}
        </Card>
      ))}
    </ScrollView>
  );
}
