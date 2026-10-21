import { Meadow } from "@/api/meadows.api";
import { Banner } from "@/components/banners/Banner";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { ListItem } from "@/components/list/ListItem";
import { usePermissions } from "@/features/user/users.hooks";
import { Body, Label } from "@/theme/Typography";
import { formatLocalizedDate, toLocalDateString } from "@/utils/date";
import { round } from "@/utils/math";
import { NavigationProp } from "@react-navigation/native";
import * as turf from "@turf/turf";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useMeadowUsageQuery, useUpdateMeadowMutation } from "./meadows.hooks";

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
  // Compared as whole calendar days ("YYYY-MM-DD" strings sort chronologically):
  // the dates are midnight UTC, so comparing timestamps would end a stay early
  // on its last day
  const { currentStays, lastUsedDate } = useMemo(() => {
    const today = toLocalDateString(new Date());
    const stays = usage ?? [];
    const current = stays.filter(
      (stay) =>
        stay.startDate.slice(0, 10) <= today &&
        stay.endDate.slice(0, 10) >= today,
    );
    const pastEndDays = stays
      .map((stay) => stay.endDate.slice(0, 10))
      .filter((endDay) => endDay < today)
      .sort();
    const lastEndDay = pastEndDays[pastEndDays.length - 1];
    let lastUsed: Date | null = null;
    if (lastEndDay) {
      const [year, month, day] = lastEndDay.split("-").map(Number);
      lastUsed = new Date(year, month - 1, day);
    }
    return { currentStays: current, lastUsedDate: lastUsed };
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

  const restoreMeadowMutation = useUpdateMeadowMutation(undefined, () =>
    Alert.alert(t("common.error"), t("common.unknown_error")),
  );
  const canEdit = canWrite("animals");

  return (
    <>
      {meadow.archivedAt ? (
        <Banner
          style={{ marginTop: theme.spacing.m }}
          variant="warning"
          title={t("archive.archived_since", {
            date: formatLocalizedDate(new Date(meadow.archivedAt), locale),
          })}
          actionLabel={canEdit ? t("archive.restore") : undefined}
          loading={restoreMeadowMutation.isPending}
          onPress={
            canEdit
              ? () =>
                  // Meadows added since archiving may overlap, so restoring asks first
                  Alert.alert(
                    t("archive.meadow_restore_title", { name: meadow.name }),
                    t("archive.meadow_restore_warning"),
                    [
                      { text: t("buttons.cancel"), style: "cancel" },
                      {
                        text: t("archive.restore"),
                        onPress: () =>
                          restoreMeadowMutation.mutate({
                            id: meadow.id,
                            archived: false,
                          }),
                      },
                    ],
                  )
              : undefined
          }
        />
      ) : null}
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

      {canEdit && (
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
