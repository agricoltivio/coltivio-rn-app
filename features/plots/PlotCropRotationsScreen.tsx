import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import { PlotCropRotationsScreenProps } from "../crop-rotations/navigation/crop-rotations-routes";
import { H2, H3 } from "@/theme/Typography";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "styled-components/native";
import { usePlotByIdQuery } from "./plots.hooks";
import { useTranslation } from "react-i18next";
import { isInfiniteDate } from "@/utils/date";
import { CropRotationCalendar } from "@/components/datepicker/CropRotationCalendar";
import { useState } from "react";
import { ViewModeToggle } from "../crop-rotations/components/ViewModeToggle";

export function PlotCropRotationsScreen({
  route,
  navigation,
}: PlotCropRotationsScreenProps) {
  const { t } = useTranslation();
  const { plotId, name } = route.params;
  const { plot } = usePlotByIdQuery(plotId);
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<"timeline" | "list">("timeline");
  console.log(plot?.cropRotations[0]?.crop.name);

  return (
    <ContentView>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("crop_rotations.crop_rotation")}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <H2>{t("crop_rotations.crop_rotation")}</H2>
            <H3>{t("plots.plot_name", { name })}</H3>
          </View>

          <ViewModeToggle viewMode={viewMode} onChangeViewMode={setViewMode} />
        </View>
        {/* View toggle */}
        {/* <View
          style={{
            flexDirection: "row",
            gap: theme.spacing.xs,
            marginTop: theme.spacing.m,
          }}
        >
          <Pressable
            onPress={() => setViewMode("calendar")}
            style={{
              flex: 1,
              paddingVertical: theme.spacing.s,
              paddingHorizontal: theme.spacing.m,
              borderRadius: 8,
              backgroundColor:
                viewMode === "calendar"
                  ? theme.colors.primary
                  : theme.colors.gray5,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color:
                  viewMode === "calendar"
                    ? theme.colors.white
                    : theme.colors.text,
              }}
            >
              {t("crop_rotations.view_calendar")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode("list")}
            style={{
              flex: 1,
              paddingVertical: theme.spacing.s,
              paddingHorizontal: theme.spacing.m,
              borderRadius: 8,
              backgroundColor:
                viewMode === "list"
                  ? theme.colors.primary
                  : theme.colors.gray5,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color:
                  viewMode === "list"
                    ? theme.colors.white
                    : theme.colors.text,
              }}
            >
              {t("crop_rotations.view_list")}
            </Text>
          </Pressable>
        </View> */}

        {/* List view */}
        {viewMode === "list" && (
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
                    isInfiniteDate(new Date(rotation.toDate))
                      ? ` - ${t("crop_rotations.permanent")}`
                      : ` - ${new Intl.DateTimeFormat(locale, {
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
        )}

        {/* Calendar view */}
        {viewMode === "timeline" && (
          <View style={{ marginTop: theme.spacing.l }}>
            <CropRotationCalendar
              rotations={plot?.cropRotations ?? []}
              onDatePress={(date, rotation) => {
                if (rotation) {
                  navigation.navigate("EditPlotCropRotation", {
                    rotationId: rotation.id,
                  });
                }
              }}
            />
          </View>
        )}
      </ScrollView>
      <FAB
        icon={{ name: "add", color: "white" }}
        onPress={() => navigation.navigate("AddPlotCropRotation", { plotId })}
      />
    </ContentView>
  );
}
