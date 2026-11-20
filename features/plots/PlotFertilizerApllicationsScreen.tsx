import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { FertilizerApplicationOverview } from "../fertilizer-application/components/FertilizerApplicationOverview";
import {
  useFertilizerApplicationsForPlotQuery,
  useFertilizerApplicationSummaryForPlotQuery,
} from "../fertilizer-application/fertilizerApplications.hooks";
import { PlotFertilizerApplicationsScreenProps } from "./navigation/plots-routes";

export function PlotFertilizerApplicationsScreen({
  navigation,
  route,
}: PlotFertilizerApplicationsScreenProps) {
  const { t } = useTranslation();
  const { canWrite } = usePermissions();
  const { plotId, name } = route.params;
  const title = t("fertilizer_application.fertilizer_application");

  const { fertilizerApplications } =
    useFertilizerApplicationsForPlotQuery(plotId);
  const { applicationSummaries } =
    useFertilizerApplicationSummaryForPlotQuery(plotId);

  const header = (
    <View>
      <H2>{title}</H2>
      <H3>{t("plots.plot_name", { name })}</H3>
    </View>
  );

  return (
    <ContentView headerVisible>
      {!applicationSummaries || !fertilizerApplications ? (
        <ScrollView showHeaderOnScroll headerTitleOnScroll={title}>
          {header}
          <ActivityIndicator style={{ marginTop: 40 }} size="large" />
        </ScrollView>
      ) : (
        // Scrolls itself: a virtualized list with the charts in its header
        <FertilizerApplicationOverview
          title={title}
          header={header}
          summaries={applicationSummaries}
          applications={fertilizerApplications}
          onPressApplication={(fertilizerApplicationId) =>
            navigation.navigate("FertilizerApplicationDetails", {
              fertilizerApplicationId,
            })
          }
        />
      )}
      {canWrite("field_calendar") && (
        <FAB
          icon={{ name: "add", color: "white" }}
          onPress={() =>
            navigation.navigate("SelectFertilizerAndDate", {
              plotId,
              name,
              returnTo: "PlotFertilizerApplications",
            })
          }
        />
      )}
    </ContentView>
  );
}
