import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2, Headline } from "@/theme/Typography";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";
import { CropProtectionApplicationOverview } from "./components/CropProtectionApplicationOverview";
import {
  useCropProtectionApplicationSummariesOfFarmQuery,
  useCropProtectionApplicationsQuery,
} from "./cropProtectionApplications.hooks";
import { CropProtectionApplicationsScreenProps } from "./navigation/crop-protection-application-routes";

export function CropProtectionApplicationsScreen({
  navigation,
}: CropProtectionApplicationsScreenProps) {
  const { t } = useTranslation();
  const { canWrite } = usePermissions();
  const title = t("crop_protection_applications.crop_protection");

  // Render the charts only after the push transition, so it stays smooth
  const [ready, setReady] = useState(false);
  useEffect(() => {
    return navigation.addListener("transitionEnd", (e) => {
      if (!e.data.closing) setReady(true);
    });
  }, [navigation]);

  const { applicationSummaries, isError: summariesError } =
    useCropProtectionApplicationSummariesOfFarmQuery();
  const { cropProtectionApplications, isError: entriesError } =
    useCropProtectionApplicationsQuery();

  const header = <H2>{title}</H2>;

  return (
    <ContentView headerVisible>
      {!ready || !applicationSummaries || !cropProtectionApplications ? (
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
              {},
            )
          }
        />
      )}
    </ContentView>
  );
}
