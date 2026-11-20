import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { CropProtectionApplicationOverview } from "../crop-protection-applications/components/CropProtectionApplicationOverview";
import {
  useCropProtectionApplicationsForPlotQuery,
  useCropProtectionApplicationSummariesOfPlotQuery,
} from "../crop-protection-applications/cropProtectionApplications.hooks";
import { PlotCropProtectionApplicationsScreenProps } from "./navigation/plots-routes";

export function PlotCropProtectionApplicationsScreen({
  navigation,
  route,
}: PlotCropProtectionApplicationsScreenProps) {
  const { t } = useTranslation();
  const { canWrite } = usePermissions();
  const { plotId, name } = route.params;
  const title = t("crop_protection_applications.crop_protection");

  const { cropProtectionApplications } =
    useCropProtectionApplicationsForPlotQuery(plotId);
  const { applicationSummaries } =
    useCropProtectionApplicationSummariesOfPlotQuery(plotId);

  const header = (
    <View>
      <H2>{title}</H2>
      <H3>{t("plots.plot_name", { name })}</H3>
    </View>
  );

  return (
    <ContentView headerVisible>
      {!applicationSummaries || !cropProtectionApplications ? (
        <ScrollView showHeaderOnScroll headerTitleOnScroll={title}>
          {header}
          <ActivityIndicator style={{ marginTop: 40 }} size="large" />
        </ScrollView>
      ) : (
        // Scrolls itself: a virtualized list with the charts in its header
        <CropProtectionApplicationOverview
          title={title}
          header={header}
          summaries={applicationSummaries}
          applications={cropProtectionApplications}
          onPressApplication={(cropProtectionApplicationId) =>
            navigation.navigate("CropProtectionApplicationDetails", {
              cropProtectionApplicationId,
            })
          }
        />
      )}
      {canWrite("field_calendar") && (
        <FAB
          icon={{ name: "add", color: "white" }}
          onPress={() =>
            navigation.navigate(
              "SelectCropProtectionApplicationProductAndDate",
              {
                plotId,
                name,
                returnTo: "PlotCropProtectionApplications",
              },
            )
          }
        />
      )}
    </ContentView>
  );
}
