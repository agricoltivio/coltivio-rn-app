import { DateRangeFilterModal } from "@/components/filters/DateRangeFilterModal";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { IonIconButton } from "@/components/buttons/IconButton";
import { H2, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  ScrollView as RNScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { locale } from "@/locales/i18n";
import { usePlotJournalQuery } from "./plot-journal.hooks";
import { PlotJournalScreenProps } from "./navigation/plots-routes";
import { PlotJournalEntry } from "@/api/plot-journal.api";
import { usePermissions } from "@/features/user/users.hooks";

export function PlotJournalScreen({ route, navigation }: PlotJournalScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plotId } = route.params;
  const { entries, isLoading } = usePlotJournalQuery(plotId);
  const { canWrite } = usePermissions();

  const [searchText, setSearchText] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);

  const filteredEntries = useMemo(() => {
    let result = [...entries];
    if (dateFrom) {
      result = result.filter((e) => new Date(e.date) >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((e) => new Date(e.date) <= dateTo);
    }
    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [entries, dateFrom, dateTo]);

  const fuse = new Fuse(filteredEntries, {
    minMatchCharLength: 1,
    keys: ["title", "content"],
  });

  const searchResult: PlotJournalEntry[] =
    searchText.length > 0
      ? fuse.search(searchText).map((r) => r.item)
      : filteredEntries;

  const hasDateFilter = dateFrom !== null || dateTo !== null;

  function handleDateRangeApply(from: Date | null, to: Date | null) {
    setDateFrom(from);
    setDateTo(to);
    setShowDateModal(false);
  }

  return (
    <ContentView headerVisible>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <H2>{t("animals.journal")}</H2>
        {canWrite("field_calendar") && (
          <IonIconButton
            icon="add-outline"
            type="accent"
            iconSize={22}
            color={theme.colors.primary}
            onPress={() => navigation.navigate("PlotJournalEntryForm", { plotId })}
          />
        )}
      </View>

      <View style={{ marginTop: theme.spacing.m }}>
        <TextInput
          hideLabel
          placeholder={t("forms.placeholders.search")}
          onChangeText={setSearchText}
          value={searchText}
        />
      </View>

      <RNScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: theme.spacing.s, flexGrow: 0 }}
        contentContainerStyle={{
          gap: theme.spacing.xs,
          paddingVertical: theme.spacing.xs,
        }}
      >
        <FilterChip
          label={t("forms.labels.date")}
          active={hasDateFilter}
          onPress={() => setShowDateModal(true)}
          theme={theme}
        />
      </RNScrollView>

      <View style={{ marginTop: theme.spacing.s, flex: 1 }}>
        {!isLoading && searchResult.length === 0 && (
          <Subtitle>{t("animals.no_journal_entries")}</Subtitle>
        )}
        <FlatList
          contentContainerStyle={{
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor:
              searchResult.length > 0 ? theme.colors.white : undefined,
          }}
          data={searchResult}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListItem
              style={{ paddingVertical: 5 }}
              onPress={() =>
                navigation.navigate("PlotJournalEntry", {
                  entryId: item.id,
                  plotId,
                })
              }
            >
              <ListItem.Content>
                <ListItem.Title>{item.title}</ListItem.Title>
                <ListItem.Body>
                  {formatLocalizedDate(new Date(item.date), locale)}
                </ListItem.Body>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          )}
        />
      </View>

      <DateRangeFilterModal
        visible={showDateModal}
        onClose={() => setShowDateModal(false)}
        onApply={handleDateRangeApply}
        initialFrom={dateFrom}
        initialTo={dateTo}
      />
    </ContentView>
  );
}

function FilterChip({
  label,
  active,
  onPress,
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: { colors: Record<string, string>; spacing: Record<string, number> };
}) {
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
