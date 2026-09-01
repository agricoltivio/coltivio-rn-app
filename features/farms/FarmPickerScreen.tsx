import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { Chip } from "@/components/chips/Chip";
import { H1, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useActiveFarm } from "./ActiveFarmContext";
import { useFarmRoleUi } from "./farm-role-ui";
import { useFarmsQuery } from "./farms.hooks";

// A blocking, non-navigable gate — rendered by RootStack in place of the main app stack
// whenever a multi-farm user has no (or a stale) active farm selection. There's no server-side
// "current farm" concept, so the app must ask before making any farm-scoped request.
export function FarmPickerScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { farms } = useFarmsQuery();
  const { setActiveFarmId } = useActiveFarm();
  const { roleColors, roleLabels } = useFarmRoleUi();

  return (
    <ContentView headerVisible={false}>
      <H1 style={{ color: theme.colors.primary }}>
        {t("farm_picker.heading")}
      </H1>
      <H3 style={{ color: theme.colors.primary, marginTop: theme.spacing.s }}>
        {t("farm_picker.subheading")}
      </H3>
      <View style={{ marginTop: theme.spacing.xl }}>
        {farms?.result.map((farm) => (
          <ListItem key={farm.id} onPress={() => setActiveFarmId(farm.id)}>
            <ListItem.Content>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: theme.spacing.s,
                }}
              >
                <ListItem.Title>{farm.name}</ListItem.Title>
                <Chip
                  label={roleLabels[farm.role]}
                  bgColor={roleColors[farm.role].bg}
                  textColor={roleColors[farm.role].text}
                  small
                />
              </View>
              {farm.address ? (
                <ListItem.Body>{farm.address}</ListItem.Body>
              ) : null}
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        ))}
      </View>
    </ContentView>
  );
}
