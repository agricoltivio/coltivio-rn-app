import { Meadow } from "@/api/meadows.api";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { ListItem } from "@/components/list/ListItem";
import { usePermissions } from "@/features/user/users.hooks";
import { Body, Label } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { round } from "@/utils/math";
import { NavigationProp } from "@react-navigation/native";
import * as turf from "@turf/turf";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useMeadowUsageQuery } from "./meadows.hooks";

type MeadowDetailsContentProps = {
  meadow: Meadow;
  navigation: NavigationProp<ReactNavigation.RootParamList>;
};

// Meadow summary, link to its usage and edit action. Shared by the map drawer and the overview screen.
export function MeadowDetailsContent({
  meadow,
  navigation,
}: MeadowDetailsContentProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { usage } = useMeadowUsageQuery(meadow.id);

  // Herds on the meadow right now, and the end of the most recent past stay
  const { currentStays, lastUsedDate } = useMemo(() => {
    const now = Date.now();
    const stays = usage ?? [];
    const current = stays.filter(
      (stay) =>
        new Date(stay.startDate).getTime() <= now &&
        new Date(stay.endDate).getTime() >= now,
    );
    const pastEndTimes = stays
      .map((stay) => new Date(stay.endDate).getTime())
      .filter((endTime) => endTime < now);
    return {
      currentStays: current,
      lastUsedDate:
        pastEndTimes.length > 0 ? new Date(Math.max(...pastEndTimes)) : null,
    };
  }, [usage]);
  // Approximate fence length: outer boundary of every part (holes aren't fenced)
  const fenceLengthMeters = useMemo(
    () =>
      meadow.geometry.coordinates.reduce(
        (sum, part) =>
          sum + turf.length(turf.lineString(part[0]), { units: "meters" }),
        0,
      ),
    [meadow],
  );

  const currentAnimalCount = currentStays.reduce(
    (sum, stay) => sum + stay.animalCount,
    0,
  );
  const currentHerdNames = [
    ...new Set(currentStays.map((stay) => stay.herdName)),
  ].join(", ");

  return (
    <>
      <Card style={{ marginTop: theme.spacing.m }}>
        <SummaryItem
          label={t("forms.labels.area")}
          value={`${round(meadow.size / 100, 1)}a`}
        />
        <SummaryItem
          label={t("animals.meadows.fence_length")}
          value={`~${round(fenceLengthMeters, 0)} m`}
        />
        <SummaryItem
          label={t("animals.meadows.current_animals")}
          value={currentAnimalCount}
        />
        {currentHerdNames ? (
          <SummaryItem
            label={t("animals.meadows.current_herds")}
            value={currentHerdNames}
          />
        ) : null}
        <SummaryItem
          label={t("animals.meadows.last_used")}
          value={
            // Occupied right now: "now" instead of the last finished stay
            currentStays.length > 0
              ? t("animals.meadows.last_used_now")
              : lastUsedDate
                ? formatLocalizedDate(lastUsedDate, locale, "long", false)
                : "–"
          }
        />
        {meadow.additionalNotes ? (
          <>
            <Label style={{ marginTop: theme.spacing.m }}>
              {t("forms.labels.additional_notes")}
            </Label>
            <Body>{meadow.additionalNotes}</Body>
          </>
        ) : null}
      </Card>

      <View
        style={{
          marginTop: theme.spacing.m,
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: theme.colors.white,
        }}
      >
        <ListItem
          style={{ backgroundColor: theme.colors.white }}
          onPress={() =>
            navigation.navigate("MeadowDetails", { meadowId: meadow.id })
          }
          hideBottomDivider
        >
          <ListItem.Content>
            <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
              {t("animals.meadows.usage")}
            </ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      </View>

      {canWrite("animals") && (
        <Button
          style={{ marginTop: theme.spacing.m }}
          type="accent"
          title={t("buttons.edit")}
          onPress={() =>
            navigation.navigate("MeadowSummary", { meadowId: meadow.id })
          }
        />
      )}
    </>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        marginBottom: theme.spacing.s,
        gap: theme.spacing.m,
        alignItems: "flex-start",
      }}
    >
      <Label numberOfLines={1} style={{ flexShrink: 0 }}>
        {label}
      </Label>
      <Label style={{ flex: 1, fontSize: 18, textAlign: "right" }}>
        {value}
      </Label>
    </View>
  );
}
