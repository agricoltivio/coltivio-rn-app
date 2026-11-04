import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { useTheme } from "styled-components/native";
import { SowingList } from "../sowings/components/SowingList";
import { useSowingsOfPlotQuery } from "../sowings/sowings.hooks";
import { PlotSowingsScreenProps } from "./navigation/plots-routes";

export function PlotSowingsScreen({
  navigation,
  route,
}: PlotSowingsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { plotId, name } = route.params;
  const { sowings, isLoading } = useSowingsOfPlotQuery(plotId);

  return (
    <ContentView headerVisible>
      <View style={{ paddingBottom: theme.spacing.s }}>
        <H2>{t("sowings.sowing")}</H2>
      </View>
      {isLoading || !sowings ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      ) : (
        <SowingList
          sowings={sowings}
          onPressSowing={(sowingId) =>
            navigation.navigate("SowingDetails", { sowingId })
          }
        />
      )}
      {canWrite("field_calendar") && (
        <FAB
          icon={{ name: "add", color: "white" }}
          onPress={() =>
            navigation.navigate("SelectSowingSeedAndDate", {
              plotId,
              name,
              returnTo: "PlotSowings",
            })
          }
        />
      )}
    </ContentView>
  );
}
