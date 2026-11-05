import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";
import { SowingOverview } from "./components/SowingOverview";
import { SowingsScreenProps } from "./navigation/sowing-routes";
import { useSowingsQuery, useSowingSummariesQuery } from "./sowings.hooks";

export function SowingsScreen({ navigation }: SowingsScreenProps) {
  const { t } = useTranslation();
  const { canWrite } = usePermissions();
  const { sowings } = useSowingsQuery();
  const { sowingSummaries } = useSowingSummariesQuery();
  const title = t("sowings.sowing");

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
        {!sowings || !sowingSummaries ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" />
        ) : (
          <SowingOverview
            summaries={sowingSummaries}
            sowings={sowings}
            onPressSowing={(sowingId) =>
              navigation.navigate("SowingDetails", { sowingId })
            }
          />
        )}
      </ScrollView>
      {canWrite("field_calendar") && (
        <FAB
          icon={{ name: "add", color: "white" }}
          onPress={() => navigation.navigate("SelectSowingSeedAndDate")}
        />
      )}
    </ContentView>
  );
}
