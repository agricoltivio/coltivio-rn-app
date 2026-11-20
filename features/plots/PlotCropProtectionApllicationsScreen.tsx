import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";
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
        <H3>{t("plots.plot_name", { name })}</H3>
        {!applicationSummaries || !cropProtectionApplications ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" />
        ) : (
          <CropProtectionApplicationOverview
            summaries={applicationSummaries}
            applications={cropProtectionApplications}
            onPressApplication={(cropProtectionApplicationId) =>
              navigation.navigate("CropProtectionApplicationDetails", {
                cropProtectionApplicationId,
              })
            }
          />
        )}
      </ScrollView>
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
