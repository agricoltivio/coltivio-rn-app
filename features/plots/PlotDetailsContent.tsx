import { Plot } from "@/api/plots.api";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { ListItem } from "@/components/list/ListItem";
import { usePermissions } from "@/features/user/users.hooks";
import { Body, H3, Label } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { isUsageCode } from "./usage-codes";

type PlotDetailsContentProps = {
  plot: Plot;
  navigation: NavigationProp<ReactNavigation.RootParamList>;
  // Screen the new-entry flows navigate back to after saving
  returnTo: "PlotsMap" | "PlotDetails";
};

// Plot summary, links to its records and actions. Shared by the map drawer and the details screen.
export function PlotDetailsContent({
  plot,
  navigation,
  returnTo,
}: PlotDetailsContentProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const [newEntryMenuVisible, setNewEntryMenuVisible] = useState(false);
  const [usageInfoVisible, setUsageInfoVisible] = useState(false);
  // Usage names are often very long, so only the code is shown inline
  const usageName =
    plot.usage && isUsageCode(plot.usage)
      ? t(`plots.usage_codes.${plot.usage}`)
      : null;

  return (
    <>
      <Card style={{ marginTop: theme.spacing.m }}>
        <SummaryItem
          label={t("forms.labels.area")}
          value={`${(plot.size ?? 0) / 100}a`}
        />
        {plot.currentCropRotation ? (
          <SummaryItem
            label={t("crops.crop")}
            value={plot.currentCropRotation.crop.name}
          />
        ) : null}
        <SummaryItem
          label={t("forms.labels.local_id")}
          value={plot.localId ?? t("common.unknown")}
        />
        {plot.usage && (
          <SummaryItem
            label={t("forms.labels.usagecode")}
            value={plot.usage}
            onInfoPress={
              usageName ? () => setUsageInfoVisible(true) : undefined
            }
          />
        )}
        {plot.cuttingDate ? (
          <SummaryItem
            label={t("forms.labels.cutting_date")}
            value={formatLocalizedDate(
              new Date(plot.cuttingDate),
              locale,
              "long",
              false,
            )}
          />
        ) : null}
        {plot.additionalNotes ? (
          <>
            <Label style={{ marginTop: theme.spacing.m }}>
              {t("forms.labels.additional_notes")}
            </Label>
            <Body>{plot.additionalNotes}</Body>
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
            navigation.navigate("PlanCropRotations", {
              plotIds: [plot.id],
              previousScreen: "PlotDetails",
            })
          }
        >
          <ListItem.Content>
            <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
              {t("crop_rotations.crop_rotation")}
            </ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem
          style={{ backgroundColor: theme.colors.white }}
          onPress={() =>
            navigation.navigate("PlotHarvests", {
              plotId: plot.id,
              name: plot.name,
            })
          }
        >
          <ListItem.Content>
            <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
              {t("harvests.harvest")}
            </ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem
          style={{ backgroundColor: theme.colors.white }}
          onPress={() =>
            navigation.navigate("PlotFertilizerApplications", {
              plotId: plot.id,
              name: plot.name,
            })
          }
        >
          <ListItem.Content>
            <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
              {t("fertilizer_application.fertilizer_application")}
            </ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem
          style={{ backgroundColor: theme.colors.white }}
          onPress={() =>
            navigation.navigate("PlotTillages", {
              plotId: plot.id,
              name: plot.name,
            })
          }
        >
          <ListItem.Content>
            <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
              {t("tillages.tillage")}
            </ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem
          style={{ backgroundColor: theme.colors.white }}
          onPress={() =>
            navigation.navigate("PlotCropProtectionApplications", {
              plotId: plot.id,
              name: plot.name,
            })
          }
          hideBottomDivider
        >
          <ListItem.Content>
            <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
              {t("crop_protection_applications.crop_protection")}
            </ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      </View>

      {canWrite("field_calendar") && (
        <Button
          style={{ marginTop: theme.spacing.m }}
          title={t("plots.new_entry")}
          onPress={() => setNewEntryMenuVisible(true)}
        />
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate("PlotJournal", { plotId: plot.id })}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: theme.spacing.xs,
          marginTop: theme.spacing.m,
          padding: 12,
          borderRadius: theme.radii.m,
          borderWidth: 1.5,
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.white,
        }}
      >
        <Ionicons name="book-outline" size={18} color={theme.colors.primary} />
        <Body
          style={{
            color: theme.colors.primary,
            fontWeight: "600",
            fontSize: 16,
          }}
        >
          {t("animals.journal")}
        </Body>
      </TouchableOpacity>

      {canWrite("field_calendar") && (
        <Button
          style={{ marginTop: theme.spacing.m }}
          type="accent"
          title={t("buttons.edit")}
          onPress={() =>
            navigation.navigate("EditPlotModal", { plotId: plot.id })
          }
        />
      )}

      <Modal
        visible={usageInfoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUsageInfoVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: theme.spacing.l,
          }}
          onPress={() => setUsageInfoVisible(false)}
        >
          <Pressable
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: 16,
              padding: theme.spacing.l,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <H3>
              {t("forms.labels.usagecode")} {plot.usage}
            </H3>
            <Body style={{ marginTop: theme.spacing.s }}>{usageName}</Body>
            <Button
              style={{ marginTop: theme.spacing.l }}
              title={t("buttons.close")}
              onPress={() => setUsageInfoVisible(false)}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={newEntryMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNewEntryMenuVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
          onPress={() => setNewEntryMenuVisible(false)}
        >
          <Pressable
            style={{
              backgroundColor: theme.colors.white,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingHorizontal: theme.spacing.l,
              paddingBottom: theme.spacing.xl,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <H3
              style={{
                marginTop: theme.spacing.l,
                marginBottom: theme.spacing.s,
              }}
            >
              {t("plots.new_entry_menu.heading")}
            </H3>
            {(
              [
                {
                  label: t("harvests.harvest"),
                  route: "SelectHarvestCropAndDate",
                },
                {
                  label: t("fertilizer_application.fertilizer_application"),
                  route: "SelectFertilizerAndDate",
                },
                {
                  label: t("crop_protection_applications.crop_protection"),
                  route: "SelectCropProtectionApplicationProductAndDate",
                },
                {
                  label: t("tillages.tillage"),
                  route: "SelectTillageDate",
                },
              ] as const
            ).map(({ label, route }, index, actions) => (
              <ListItem
                key={route}
                onPress={() => {
                  setNewEntryMenuVisible(false);
                  navigation.navigate(route, {
                    plotId: plot.id,
                    name: plot.name,
                    returnTo,
                  });
                }}
                hideBottomDivider={index === actions.length - 1}
              >
                <ListItem.Content>
                  <ListItem.Title>{label}</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function SummaryItem({
  label,
  value,
  onInfoPress,
}: {
  label: string;
  value: string | number;
  // Shows an info icon after the value
  onInfoPress?: () => void;
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
      {onInfoPress ? (
        <Pressable onPress={onInfoPress} hitSlop={8}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={theme.colors.primary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
