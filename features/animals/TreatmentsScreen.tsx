import { Treatment } from "@/api/treatments.api";
import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
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

  // Group treatments by date (descending)
  const groupedTreatments = useMemo(() => {
    if (!treatments) return [];

    const sorted = [...treatments].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const groups: { date: string; treatments: Treatment[] }[] = [];
    sorted.forEach((treatment) => {
      const dateStr = formatLocalizedDate(new Date(treatment.date), locale);
      const existingGroup = groups.find((g) => g.date === dateStr);
      if (existingGroup) {
        existingGroup.treatments.push(treatment);
      } else {
        groups.push({ date: dateStr, treatments: [treatment] });
      }
    });

    return groups;
  }, [treatments]);

  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("treatments.treatments")}
      >
        <H2>{t("treatments.treatments")}</H2>

        <View style={{ marginTop: theme.spacing.m }}>
          {groupedTreatments.length === 0 && (
            <Subtitle>{t("treatments.no_treatments")}</Subtitle>
          )}

          {groupedTreatments.map((group) => (
            <View key={group.date} style={{ marginBottom: theme.spacing.m }}>
              <H3 style={{ marginBottom: theme.spacing.s }}>{group.date}</H3>
              <View
                style={{
                  borderRadius: 10,
                  overflow: "hidden",
                  backgroundColor: theme.colors.white,
                }}
              >
                {group.treatments.map((treatment) => (
                  <ListItem
                    key={treatment.id}
                    style={{ paddingVertical: 5 }}
                    onPress={() => navigation.navigate("EditTreatment", { treatmentId: treatment.id })}
                  >
                    <ListItem.Content>
                      <ListItem.Title>{treatment.name}</ListItem.Title>
                      <ListItem.Body>
                        {treatment.drug?.name || treatment.reason}
                      </ListItem.Body>
                    </ListItem.Content>
                    <ListItem.Chevron />
                  </ListItem>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <FAB
        icon={{ name: "add", color: "white" }}
        onPress={() => navigation.navigate("CreateTreatment", {})}
      />
    </ContentView>
  );
}
