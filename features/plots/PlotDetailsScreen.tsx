import { IonIconButton } from "@/components/buttons/IconButton";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components/native";
import { PlotDetailsScreenProps } from "./navigation/plots-routes";
import { PlotDetailsContent } from "./PlotDetailsContent";
import { usePlotByIdQuery } from "./plots.hooks";

export function PlotDetailsScreen({
  route,
  navigation,
}: PlotDetailsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plotId } = route.params;
  const { plot } = usePlotByIdQuery(plotId);

  // Plots without geometry (size 0) can't be shown on the map; archived plots
  // open it with the archived layer visible
  const hasGeometry =
    plot !== undefined && plot.geometry.coordinates.length > 0;
  const isArchived = plot?.archivedAt != null;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: hasGeometry
        ? () => (
            <IonIconButton
              icon="globe-outline"
              type="ghost"
              iconSize={26}
              color={theme.colors.primary}
              onPress={() =>
                navigation.navigate("PlotsMap", {
                  selectedPlotId: plotId,
                  showArchived: isArchived,
                })
              }
            />
          )
        : undefined,
    });
  }, [navigation, hasGeometry, isArchived, plotId, theme.colors.primary]);

  if (!plot) {
    return null;
  }

  return (
    <ContentView>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("plots.plot_name", { name: plot.name })}
      >
        <H2>{t("plots.plot_name", { name: plot.name })}</H2>
        <PlotDetailsContent
          plot={plot}
          navigation={navigation}
          returnTo="PlotDetails"
        />
      </ScrollView>
    </ContentView>
  );
}
