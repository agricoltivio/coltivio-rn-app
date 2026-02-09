import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { List } from "@/components/list/List";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Headline } from "@/theme/Typography";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useTreatmentsQuery } from "./treatments.hooks";
import { TreatmentsScreenProps } from "./navigation/animals-routes";

export function TreatmentsScreen({ navigation }: TreatmentsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { treatments } = useTreatmentsQuery();

  // Group treatments by year, sorted descending
  const treatmentsByYear = useMemo(() => {
    if (!treatments) return {};
    const grouped: Record<number, typeof treatments> = {};
    for (const treatment of treatments) {
      const year = new Date(treatment.date).getFullYear();
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(treatment);
    }
    // Sort treatments within each year by date descending
    for (const year of Object.keys(grouped)) {
      grouped[Number(year)].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    return grouped;
  }, [treatments]);

  const years = useMemo(
    () => Object.keys(treatmentsByYear).map(Number).sort((a, b) => b - a),
    [treatmentsByYear]
  );

  if (!treatments) {
    return null;
  }

  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("treatments.treatments")}
      >
        <H2>{t("treatments.treatments")}</H2>

        <View style={{ marginTop: theme.spacing.m }}>
          {years.length === 0 ? (
            <Headline>{t("treatments.no_treatments")}</Headline>
          ) : (
            <List>
              {years.map((year) => (
                <List.Item
                  key={year}
                  title={year.toString()}
                  onPress={() =>
                    navigation.navigate("TreatmentsOfYear", {
                      year,
                      treatments: treatmentsByYear[year],
                    })
                  }
                />
              ))}
            </List>
          )}
        </View>
      </ScrollView>
      <FAB
        icon={{ name: "add", color: "white" }}
        onPress={() => navigation.navigate("CreateTreatment", {})}
      />
    </ContentView>
  );
}
