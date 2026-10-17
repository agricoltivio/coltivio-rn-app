import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { ListItem } from "@/components/list/ListItem";
import {
  useMeadowsQuery,
  useMeadowUsageQuery,
} from "@/features/animals/meadows.hooks";
import { usePermissions } from "@/features/user/users.hooks";
import { Body, H3, Label } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { round } from "@/utils/math";
import { Ionicons } from "@expo/vector-icons";
import * as turf from "@turf/turf";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "./plots-map-mode";

// Used until the content has been measured
const FALLBACK_HEIGHT = 260;
const SHEET_HANDLE_HEIGHT = 24;

export function MeadowDetailsDrawer() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const { mode, navigation, selectedMeadowId, setSelectedMeadowId } =
    usePlotsMapContext();
  const { canWrite } = usePermissions();
  const { meadows } = useMeadowsQuery();
  const { usage } = useMeadowUsageQuery(
    selectedMeadowId ?? "",
    selectedMeadowId !== null,
  );

  // Opens fully: one snap point that fits the content (measured below), so the
  // drawer ends right under the buttons. The content is short, so a collapsed
  // step would only hide the useful part.
  const insets = useSafeAreaInsets();
  const [contentHeight, setContentHeight] = useState(0);
  const snapPoints = useMemo(() => {
    if (contentHeight === 0) return [FALLBACK_HEIGHT];
    // Sheet handle + the drawer's bottom padding around the measured content
    return [
      contentHeight + SHEET_HANDLE_HEIGHT + insets.bottom + theme.spacing.s,
    ];
  }, [contentHeight, insets.bottom, theme.spacing.s]);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const selectedMeadow = selectedMeadowId
    ? meadows?.find((meadow) => meadow.id === selectedMeadowId)
    : undefined;

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
  const fenceLengthMeters = useMemo(() => {
    if (!selectedMeadow) return 0;
    return selectedMeadow.geometry.coordinates.reduce(
      (sum, part) =>
        sum + turf.length(turf.lineString(part[0]), { units: "meters" }),
      0,
    );
  }, [selectedMeadow]);

  const currentAnimalCount = currentStays.reduce(
    (sum, stay) => sum + stay.animalCount,
    0,
  );
  const currentHerdNames = [
    ...new Set(currentStays.map((stay) => stay.herdName)),
  ].join(", ");

  // RAF defers present() by one frame so a freshly-mounted sheet has time to initialize
  useEffect(() => {
    if (selectedMeadow) {
      const raf = requestAnimationFrame(() => {
        bottomSheetModalRef.current?.present();
      });
      return () => cancelAnimationFrame(raf);
    }
    bottomSheetModalRef.current?.dismiss();
  }, [selectedMeadow?.id]);

  if (mode.type !== "view") return null;

  return (
    <BottomSheetModalProvider>
      <BottomDrawerModal
        onClose={() => setSelectedMeadowId(null)}
        ref={bottomSheetModalRef}
        backdropDisappearsOnIndex={0}
        snapPoints={snapPoints}
      >
        <View
          onLayout={(event) =>
            setContentHeight(event.nativeEvent.layout.height)
          }
        >
          {/* Header with close toggle */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <H3>{selectedMeadow?.name}</H3>
            </View>
            {/* Closes the drawer; there's no collapsed step */}
            <Pressable onPress={() => setSelectedMeadowId(null)}>
              <Ionicons
                name="chevron-down"
                size={24}
                color={theme.colors.gray2}
              />
            </Pressable>
          </View>

          {selectedMeadow && (
            <>
              <Card style={{ marginTop: theme.spacing.m }}>
                <SummaryItem
                  label={t("forms.labels.area")}
                  value={`${round(selectedMeadow.size / 100, 1)}a`}
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
                        ? formatLocalizedDate(
                            lastUsedDate,
                            locale,
                            "long",
                            false,
                          )
                        : "–"
                  }
                />
                {selectedMeadow.additionalNotes ? (
                  <>
                    <Label style={{ marginTop: theme.spacing.m }}>
                      {t("forms.labels.additional_notes")}
                    </Label>
                    <Body>{selectedMeadow.additionalNotes}</Body>
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
                    navigation.navigate("MeadowDetails", {
                      meadowId: selectedMeadow.id,
                    })
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
                <>
                  <Button
                    style={{ marginTop: theme.spacing.m }}
                    type="accent"
                    title={t("buttons.edit")}
                    onPress={() =>
                      navigation.navigate("MeadowSummary", {
                        meadowId: selectedMeadow.id,
                      })
                    }
                  />
                </>
              )}
            </>
          )}
        </View>
      </BottomDrawerModal>
    </BottomSheetModalProvider>
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
