import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { CropRotationCalendar } from "@/components/datepicker/CropRotationCalendar";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import { H2, H3 } from "@/theme/Typography";
import { isInfiniteDate } from "@/utils/date";
import { addYears, subYears } from "date-fns";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { ViewModeToggle } from "../crop-rotations/components/ViewModeToggle";
import { useCropRotationsByPlotIdsQuery } from "../crop-rotations/crop-rotations.hooks";
import { PlotCropRotationsScreenProps } from "../crop-rotations/navigation/crop-rotations-routes";
import { usePlotByIdQuery } from "./plots.hooks";

export function PlotCropRotationsScreen({
  route,
  navigation,
}: PlotCropRotationsScreenProps) {
  const { t } = useTranslation();
  const { plotId, name } = route.params;
  const { plotCropRotations } = useCropRotationsByPlotIdsQuery(
    [plotId],
    subYears(new Date(), 10),
    addYears(new Date(), 10),
    {}, // use default options: expand=true
  );
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<"timeline" | "list">("timeline");

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
            {plotCropRotations?.map((rotation) => (
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
              rotations={plotCropRotations ?? []}
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
        onPress={() =>
          navigation.navigate("PlanCropRotations", { plotIds: [plotId] })
        }
      />
    </ContentView>
  );
}
