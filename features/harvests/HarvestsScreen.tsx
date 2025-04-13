import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { List } from "@/components/list/List";
import { ScrollView } from "@/components/views/ScrollView";
import { HarvestsScreenProps } from "@/navigation/rootStackTypes";
import { H2, Headline } from "@/theme/Typography";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useHarvestYearsQuery } from "../harvests/harvests.hooks";
import { useTranslation } from "react-i18next";

export function HarvestsScreen({ navigation, route }: HarvestsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { harvestYears } = useHarvestYearsQuery();

  if (!harvestYears) {
    return null;
  }
  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("harvests.harvest")}
      >
        <H2>{t("harvests.harvest")}</H2>
        <View
          style={{
            marginTop: theme.spacing.m,
          }}
        >
          {harvestYears.length === 0 ? (
            <Headline>{t("common.no_entries")}</Headline>
          ) : (
            <List>
              {harvestYears.map((year) => (
                <List.Item
                  key={year}
                  title={year.toString()}
                  onPress={() =>
                    navigation.navigate("HarvestsOfYear", {
                      year: Number(year),
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
        onPress={() => navigation.navigate("SelectHarvestDate")}
      />
    </ContentView>
  );
}
