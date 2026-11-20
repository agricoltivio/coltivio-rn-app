import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2, Headline } from "@/theme/Typography";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";
import { HarvestOverview } from "./components/HarvestOverview";
import { useHarvestSummariesOfFarm, useHarvestsQuery } from "./harvests.hooks";
import { HarvestsScreenProps } from "./navigation/harvest-routes";

export function HarvestsScreen({ navigation }: HarvestsScreenProps) {
  const { t } = useTranslation();
  const { canWrite } = usePermissions();
  const title = t("harvests.harvest");

  // Render the charts only after the push transition, so it stays smooth
  const [ready, setReady] = useState(false);
  useEffect(() => {
    return navigation.addListener("transitionEnd", (e) => {
      if (!e.data.closing) setReady(true);
    });
  }, [navigation]);

  const { harvestSummaries, isError: summariesError } =
    useHarvestSummariesOfFarm();
  const { harvests, isError: entriesError } = useHarvestsQuery();

  const header = <H2>{title}</H2>;

  return (
    <ContentView headerVisible>
      {!ready || !harvestSummaries || !harvests ? (
        <ScrollView showHeaderOnScroll headerTitleOnScroll={title}>
          {header}
          {/* A failed request would otherwise keep the spinner forever */}
          {summariesError || entriesError ? (
            <Headline style={{ marginTop: 40 }}>
              {t("errors.unexpected_retry_later")}
            </Headline>
          ) : (
            <ActivityIndicator style={{ marginTop: 40 }} size="large" />
          )}
        </ScrollView>
      ) : (
        // Scrolls itself: a virtualized list with the charts in its header
        <HarvestOverview
          title={title}
          header={header}
          summaries={harvestSummaries}
          harvests={harvests}
          onPressHarvest={(harvestId) =>
            navigation.navigate("HarvestDetails", { harvestId })
          }
        />
      )}
      {canWrite("field_calendar") && (
        <FAB
          icon={{ name: "add", color: "white" }}
          onPress={() => navigation.navigate("SelectHarvestCropAndDate")}
        />
      )}
    </ContentView>
  );
}
