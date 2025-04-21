import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import { PlotCropRotationsScreenProps } from "../crop-rotations/navigation/crop-rotations-routes";
import { H2, H3 } from "@/theme/Typography";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { usePlotByIdQuery } from "./plots.hooks";
import { useTranslation } from "react-i18next";

export function PlotCropRotationsScreen({
  route,
  navigation,
}: PlotCropRotationsScreenProps) {
  const { t } = useTranslation();
  const { plotId, name } = route.params;
  const { plot } = usePlotByIdQuery(plotId);
  const theme = useTheme();
  return (
    <ContentView>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("crop_rotations.crop_rotation")}
      >
        <H2>{t("crop_rotations.crop_rotation")}</H2>
        <H3>{t("plots.plot_name", { name })}</H3>
        <View
          style={{
            marginTop: theme.spacing.l,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {plot?.cropRotations.map((rotation) => (
            <ListItem
              key={rotation.id}
              onPress={() =>
                navigation.navigate("EditPlotCropRotation", {
                  rotationId: rotation.id,
                  canDelete: plot.cropRotations.length > 1,
                })
              }
            >
              <ListItem.Content>
                <ListItem.Title>{rotation.crop.name}</ListItem.Title>
                <ListItem.Body>
                  {new Intl.DateTimeFormat(locale, {
                    year: "numeric",
                    month: "2-digit",
                    day: "numeric",
                  }).format(new Date(rotation.fromDate))}
                  {rotation.toDate &&
                    ` - ${new Intl.DateTimeFormat(locale, {
                      year: "numeric",
                      month: "2-digit",
                      day: "numeric",
                    }).format(new Date(rotation.toDate))}`}
                </ListItem.Body>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          ))}
        </View>
      </ScrollView>
      <FAB
        icon={{ name: "add", color: "white" }}
        onPress={() => navigation.navigate("AddPlotCropRotation", { plotId })}
      />
    </ContentView>
  );
}
