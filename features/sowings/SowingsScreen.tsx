import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2, Headline } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";
import { SowingOverview } from "./components/SowingOverview";
import { SowingsScreenProps } from "./navigation/sowing-routes";
import { useSowingsQuery, useSowingSummariesQuery } from "./sowings.hooks";

export function SowingsScreen({ navigation }: SowingsScreenProps) {
  const { t } = useTranslation();
  const { canWrite } = usePermissions();
  const { sowings, isError: entriesError } = useSowingsQuery();
  const { sowingSummaries, isError: summariesError } =
    useSowingSummariesQuery();
  const title = t("sowings.sowing");

  const header = <H2>{title}</H2>;

  return (
    <ContentView headerVisible>
      {!sowings || !sowingSummaries ? (
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
        <SowingOverview
          title={title}
          header={header}
          summaries={sowingSummaries}
          sowings={sowings}
          onPressSowing={(sowingId) =>
            navigation.navigate("SowingDetails", { sowingId })
          }
        />
      )}
      {canWrite("field_calendar") && (
        <FAB
          icon={{ name: "add", color: "white" }}
          onPress={() => navigation.navigate("SelectSowingSeedAndDate")}
        />
      )}
    </ContentView>
  );
}
