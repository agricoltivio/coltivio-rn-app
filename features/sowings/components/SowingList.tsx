import { PlotSowing, Sowing } from "@/api/sowings.api";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { H3, Headline } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useSowingUnitsQuery } from "../sowings.hooks";
import { formatBaseAmount } from "../sowingUnits";

type SowingListProps = {
  sowings: (Sowing | PlotSowing)[];
  onPressSowing: (sowingId: string) => void;
};

// Searchable list grouped by year, newest first
export function SowingList({ sowings, onPressSowing }: SowingListProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { sowingUnits } = useSowingUnitsQuery();
  const [searchText, setSearchText] = useState("");

  const sections = useMemo(() => {
    const items = sowings.map((sowing) => {
      const quantityKind = sowingUnits?.find(
        (unitInfo) => unitInfo.unit === sowing.unit,
      )?.quantityKind;
      return {
        id: sowing.id,
        rawDate: sowing.date,
        date: formatLocalizedDate(
          new Date(sowing.date),
          i18n.language,
          "long",
          false,
        ),
        plotName: "plot" in sowing ? sowing.plot.name : undefined,
        cropName: sowing.crop.name,
        seedName: sowing.seed?.name,
        amount: `${sowing.amount} ${t(`sowings.units.${sowing.unit}`)}`,
        total: quantityKind
          ? formatBaseAmount(sowing.totalBaseAmount, quantityKind, t)
          : undefined,
      };
    });

    let filtered = items;
    if (searchText) {
      const fuse = new Fuse(items, {
        minMatchCharLength: 1,
        keys: ["date", "plotName", "cropName", "seedName"],
      });
      filtered = fuse.search(searchText).map((result) => result.item);
    }

    const byYear: Record<number, typeof filtered> = {};
    for (const item of filtered) {
      const year = new Date(item.rawDate).getFullYear();
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(item);
    }
    return Object.keys(byYear)
      .map(Number)
      .sort((a, b) => b - a)
      .map((year) => ({ title: year.toString(), data: byYear[year] }));
  }, [sowings, sowingUnits, searchText, t, i18n.language]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ marginBottom: theme.spacing.m }}>
        <TextInput
          hideLabel
          placeholder={t("forms.placeholders.search")}
          onChangeText={setSearchText}
          value={searchText}
        />
      </View>
      {sections.length === 0 ? (
        <Headline>{t("common.no_entries")}</Headline>
      ) : (
        <SectionList
          stickySectionHeadersEnabled={false}
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderSectionHeader={({ section: { title } }) => (
            <View
              style={{
                paddingVertical: theme.spacing.s,
                paddingHorizontal: theme.spacing.xs,
                marginTop: theme.spacing.m,
              }}
            >
              <H3>{title}</H3>
            </View>
          )}
          renderItem={({ item }) => (
            <ListItem onPress={() => onPressSowing(item.id)}>
              <ListItem.Content>
                <ListItem.Title style={{ flex: 1 }}>
                  {item.plotName
                    ? t("plots.plot_name_date", {
                        name: item.plotName,
                        date: item.date,
                      })
                    : item.date}
                </ListItem.Title>
                <ListItem.Body>
                  {[item.cropName, item.seedName, item.amount, item.total]
                    .filter(Boolean)
                    .join(", ")}
                </ListItem.Body>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          )}
        />
      )}
    </View>
  );
}
