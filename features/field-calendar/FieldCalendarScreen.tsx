import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { FieldCalendarScreenProps } from "./navigation/field-calendar.routes";
import { H2 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components/native";
import { List } from "../../components/list/List";

export function FieldCalendarScreen({ navigation }: FieldCalendarScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <ScrollView
      headerTitleOnScroll={t("field_calendar.field_calendar")}
      showHeaderOnScroll
    >
      <ContentView>
        <H2>{t("field_calendar.field_calendar")}</H2>
        <List style={{ marginTop: theme.spacing.l }}>
          <List.Item
            title={t("field_calendar.crop_rotations")}
            onPress={() => navigation.navigate("CropRotations")}
          />
          <List.Item
            title={t("field_calendar.tillages")}
            onPress={() => navigation.navigate("Tillages")}
          />
          <List.Item
            title={t("field_calendar.fertilizer_applications")}
            onPress={() => navigation.navigate("FertilizerApplications")}
          />
          <List.Item
            title={t("field_calendar.crop_protection_applications")}
            onPress={() => navigation.navigate("CropProtectionApplications")}
          />
          <List.Item
            title={t("field_calendar.harvests")}
            onPress={() => navigation.navigate("Harvests")}
            hideBottomDivider
          />
        </List>
        <List style={{ marginTop: theme.spacing.l }}>
          <List.Item
            title={t("field_calendar.crop_families")}
            onPress={() => navigation.navigate("CropFamilies")}
          />
          <List.Item
            title={t("field_calendar.crops")}
            onPress={() => navigation.navigate("Crops")}
          />
          <List.Item
            title={t("field_calendar.fertilizers")}
            onPress={() => navigation.navigate("Fertilizers")}
          />
          <List.Item
            title={t("field_calendar.crop_protection_products")}
            onPress={() => navigation.navigate("CropProtectionProducts")}
            hideBottomDivider
          />
        </List>
        <List style={{ marginTop: theme.spacing.l }}>
          <List.Item
            title={t("field_calendar.export")}
            onPress={() => navigation.navigate("FieldCalendarExport")}
            hideBottomDivider
          />
        </List>
      </ContentView>
    </ScrollView>
  );
}
