import { useApi } from "@/api/api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { H2, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Alert, FlatList, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  EditablePreviewRow,
  TvdImportPreviewScreenProps,
} from "./navigation/animals-routes";
import { ParsedImportRow } from "@/api/animals.api";

export function TvdImportPreviewScreen({
  route,
  navigation,
}: TvdImportPreviewScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const api = useApi();
  const locale = i18n.language;
  const { type } = route.params;

  const [rows, setRows] = useState<EditablePreviewRow[]>(() =>
    route.params.rows.map((row: ParsedImportRow) => ({
      ...row,
      mergeAnimalId: null,
    })),
  );
  const [loading, setLoading] = useState(false);

  // Handle row edits coming back from TvdImportRowDetailScreen
  useEffect(() => {
    const rowEdit = route.params.rowEdit;
    if (!rowEdit) return;
    setRows((prev) =>
      prev.map((r, i) => (i === rowEdit.rowIndex ? rowEdit.updatedRow : r)),
    );
  }, [route.params.rowEdit]);

  function mergeAllConflicts() {
    setRows((prev) =>
      prev.map((r) =>
        r.earTagAssigned && !r.mergeAnimalId
          ? { ...r, mergeAnimalId: r.assignedToAnimalId }
          : r,
      ),
    );
  }

  // Quick action on the list item, the ear tag already identifies the animal to merge with.
  function toggleMerge(index: number) {
    setRows((prev) =>
      prev.map((r, i) =>
        i === index
          ? {
              ...r,
              mergeAnimalId: r.mergeAnimalId ? null : r.assignedToAnimalId,
            }
          : r,
      ),
    );
  }

  const autoSkipCount = useMemo(
    () => rows.filter((r) => r.earTagAssigned && !r.mergeAnimalId).length,
    [rows],
  );

  // Rows that will actually be imported, conflicts that weren't merged are skipped (same as web)
  const rowsToCommit = useMemo(
    () =>
      rows.filter(
        (r) =>
          r.name &&
          r.sex &&
          r.dateOfBirth &&
          r.usage &&
          !(r.earTagAssigned && !r.mergeAnimalId),
      ),
    [rows],
  );

  const hasErrors = useMemo(
    () => rows.some((r) => r.parseErrors.length > 0),
    [rows],
  );

  async function handleCommit() {
    setLoading(true);
    try {
      const commitRows = rowsToCommit.map((r) => ({
        earTagNumber: r.earTagNumber,
        earTagId: r.earTagId,
        name: r.name!,
        sex: r.sex!,
        dateOfBirth: r.dateOfBirth!,
        usage: r.usage!,
        motherEarTagNumber: r.motherEarTagNumber ?? null,
        fatherEarTagNumber: r.fatherEarTagNumber ?? null,
        dateOfDeath: r.dateOfDeath ?? null,
        deathReason: r.dateOfDeath ? (r.deathReason ?? "died") : null,
        mergeAnimalId: r.mergeAnimalId ?? null,
      }));

      const result = await api.animals.commitImport({ type, rows: commitRows });

      let message = t("animals.tvd_import.commit_success_message", {
        created: result.created,
        merged: result.merged,
      });
      if (result.skipped.length > 0) {
        message +=
          "\n" +
          t("animals.tvd_import.commit_skipped", {
            count: result.skipped.length,
          });
      }

      Alert.alert(t("animals.tvd_import.commit_success_title"), message, [
        {
          text: t("buttons.ok"),
          onPress: () => navigation.popTo("TvdImport"),
        },
      ]);
    } catch {
      Alert.alert(t("common.error"), t("common.unknown_error"));
    } finally {
      setLoading(false);
    }
  }

  const renderItem = useCallback(
    ({ item, index }: { item: EditablePreviewRow; index: number }) => {
      const hasError = item.parseErrors.length > 0;
      const willSkip = item.earTagAssigned && !item.mergeAnimalId;
      const willMerge = !!item.mergeAnimalId;

      // Status badge color + label
      let statusColor = theme.colors.success ?? theme.colors.primary;
      let statusLabel = t("animals.tvd_import.status_ok");
      if (hasError) {
        statusColor = theme.colors.danger;
        statusLabel = t("animals.tvd_import.status_error");
      } else if (willMerge) {
        statusColor = theme.colors.blue ?? theme.colors.primary;
        statusLabel = t("animals.tvd_import.status_merge");
      }

      const dateLabel = item.dateOfBirth
        ? formatLocalizedDate(new Date(item.dateOfBirth), locale)
        : "–";

      return (
        <ListItem
          style={{ paddingVertical: 8 }}
          onPress={() =>
            navigation.navigate("TvdImportRowDetail", {
              rowIndex: index,
              row: item,
              type,
            })
          }
        >
          <ListItem.Content>
            <ListItem.Title numberOfLines={1}>
              {item.name ?? "–"}
              {item.earTagNumber ? ` (${item.earTagNumber})` : ""}
            </ListItem.Title>
            <ListItem.Body numberOfLines={1}>{dateLabel}</ListItem.Body>
            {hasError &&
              item.parseErrors.map((err, i) => (
                <Subtitle
                  key={i}
                  style={{ color: theme.colors.danger, fontSize: 12 }}
                >
                  {err}
                </Subtitle>
              ))}
            {/* Unmerged conflicts get no chip, the empty checkmark on the right already shows they're not imported */}
            {!(willSkip && !hasError) && (
              <View
                style={{
                  backgroundColor: statusColor,
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  alignSelf: "flex-start",
                  marginTop: 4,
                }}
              >
                <Subtitle style={{ color: "#fff", fontSize: 11 }}>
                  {statusLabel}
                </Subtitle>
              </View>
            )}
          </ListItem.Content>
          {item.earTagAssigned && item.assignedToAnimalId && (
            <TouchableOpacity
              onPress={() => toggleMerge(index)}
              hitSlop={12}
              style={{
                alignSelf: "center",
                paddingHorizontal: theme.spacing.s,
              }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: willMerge }}
              accessibilityLabel={t("animals.tvd_import.merge_with", {
                name: item.assignedToAnimalName,
              })}
            >
              <Ionicons
                name={
                  willMerge ? "checkmark-circle" : "checkmark-circle-outline"
                }
                size={30}
                color={willMerge ? theme.colors.primary : theme.colors.gray3}
              />
            </TouchableOpacity>
          )}
          <ListItem.Chevron />
        </ListItem>
      );
    },
    [rows, t, locale, theme, navigation, type],
  );

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("animals.tvd_import.commit_button", {
              count: rowsToCommit.length,
            })}
            onPress={handleCommit}
            disabled={loading || hasErrors || rowsToCommit.length === 0}
            loading={loading}
          />
        </BottomActionContainer>
      }
    >
      <H2>{t("animals.tvd_import.preview_title")}</H2>

      {autoSkipCount > 0 && (
        <View
          style={{
            marginTop: theme.spacing.m,
            backgroundColor: theme.colors.white,
            borderRadius: 10,
            padding: theme.spacing.m,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.warning,
          }}
        >
          <Subtitle>
            {t("animals.tvd_import.auto_skip_warning", {
              count: autoSkipCount,
            })}
          </Subtitle>
          <Button
            type="primary"
            style={{ marginTop: theme.spacing.s }}
            title={t("animals.tvd_import.merge_all")}
            onPress={mergeAllConflicts}
          />
        </View>
      )}

      <View style={{ marginTop: theme.spacing.m, flex: 1 }}>
        <FlatList
          contentContainerStyle={{
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            overflow: "hidden",
            backgroundColor: rows.length > 0 ? theme.colors.white : undefined,
          }}
          data={rows}
          keyExtractor={(_, index) => String(index)}
          renderItem={renderItem}
        />
      </View>
    </ContentView>
  );
}
