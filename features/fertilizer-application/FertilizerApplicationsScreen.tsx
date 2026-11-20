import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2 } from "@/theme/Typography";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";
import { FertilizerApplicationOverview } from "./components/FertilizerApplicationOverview";
import {
  useFertilizerApplicationSummaryOfFarmQuery,
  useFertilizerApplicationsQuery,
} from "./fertilizerApplications.hooks";
import { FertilizerApplicationsScreenProps } from "./navigation/fertilizer-application-routes";

export function FertilizerApplicationsScreen({
  navigation,
}: FertilizerApplicationsScreenProps) {
  const { t } = useTranslation();
  const { canWrite } = usePermissions();
  const title = t("fertilizer_application.fertilizer_application");

  // Render the charts only after the push transition, so it stays smooth
  const [ready, setReady] = useState(false);
  useEffect(() => {
    return navigation.addListener("transitionEnd", (e) => {
      if (!e.data.closing) setReady(true);
    });
  }, [navigation]);

  const { applicationSummaries } = useFertilizerApplicationSummaryOfFarmQuery();
  const { fertilizerApplications } = useFertilizerApplicationsQuery();

  const header = <H2>{title}</H2>;

  return (
    <ContentView headerVisible>
      {!ready || !applicationSummaries || !fertilizerApplications ? (
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
          onPress={() => navigation.navigate("SelectFertilizerAndDate", {})}
        />
      )}
    </ContentView>
  );
}
