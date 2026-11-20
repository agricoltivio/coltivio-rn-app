import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { HarvestOverview } from "../harvests/components/HarvestOverview";
import {
  useHarvestsOfPlotQuery,
  useHarvestSummariesOfPlotQuery,
} from "../harvests/harvests.hooks";
import { PlotHarvestsScreenProps } from "./navigation/plots-routes";

export function PlotHarvestsScreen({
  navigation,
  route,
}: PlotHarvestsScreenProps) {
  const { t } = useTranslation();
  const { canWrite } = usePermissions();
  const { plotId, name } = route.params;
  const title = t("harvests.harvest");

  const { harvests } = useHarvestsOfPlotQuery(plotId);
  const { harvestSummaries } = useHarvestSummariesOfPlotQuery(plotId);

  const header = (
    <View>
      <H2>{title}</H2>
      <H3>{t("plots.plot_name", { name })}</H3>
    </View>
  );

  return (
    <ContentView headerVisible>
      {!harvestSummaries || !harvests ? (
        <ScrollView showHeaderOnScroll headerTitleOnScroll={title}>
          {header}
          <ActivityIndicator style={{ marginTop: 40 }} size="large" />
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
          onPress={() =>
            navigation.navigate("SelectHarvestCropAndDate", {
              plotId,
              name,
              returnTo: "PlotHarvests",
            })
          }
        />
      )}
    </ContentView>
  );
}
