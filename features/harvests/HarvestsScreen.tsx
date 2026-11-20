import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2 } from "@/theme/Typography";
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

  const { harvestSummaries } = useHarvestSummariesOfFarm();
  const { harvests } = useHarvestsQuery();

  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={title}
        // room for the FAB below the last entry
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardAware
      >
        <H2>{title}</H2>
        {!ready || !harvestSummaries || !harvests ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" />
        ) : (
          <HarvestOverview
            summaries={harvestSummaries}
            harvests={harvests}
            onPressHarvest={(harvestId) =>
              navigation.navigate("HarvestDetails", { harvestId })
            }
          />
        )}
      </ScrollView>
      {canWrite("field_calendar") && (
        <FAB
          icon={{ name: "add", color: "white" }}
          onPress={() => navigation.navigate("SelectHarvestCropAndDate")}
        />
      )}
    </ContentView>
  );
}
