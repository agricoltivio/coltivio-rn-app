import { ContentView } from "@/components/containers/ContentView";
import { List } from "@/components/list/List";
import { ScrollView } from "@/components/views/ScrollView";
import { AnimalsHubScreenProps } from "./navigation/animals-routes";
import { H2 } from "@/theme/Typography";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components/native";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { useMembership } from "../farms/farms.hooks";
import { usePermissions } from "../user/users.hooks";
import { ANIMALS_GROUPS, ANIMALS_ITEMS } from "./animals-settings";

type GroupId = keyof typeof ANIMALS_GROUPS;
type ItemId = keyof typeof ANIMALS_ITEMS;

export function AnimalsHubScreen({ navigation }: AnimalsHubScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { localSettings } = useLocalSettings();
  const { canRead } = usePermissions();
  const { isActive } = useMembership();

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!localSettings.animalsOnboardingCompleted) {
      navigation.replace("AnimalsOnboarding" as never);
    }
  }, []);

  const groups = localSettings.animalsGroups;

  return (
    <ScrollView
      headerTitleOnScroll={t("animals.animal_husbandry")}
      showHeaderOnScroll
    >
      <ContentView>
        <H2>{t("animals.animal_husbandry")}</H2>

        {groups
          .filter((group) => group.visible)
          .map((group) => {
            const groupId = group.groupId as GroupId;
            const groupMeta = ANIMALS_GROUPS[groupId];
            if (!groupMeta) return null;

            const visibleItems = group.items.filter((item) => {
              if (!item.visible) return false;
              const meta = ANIMALS_ITEMS[item.itemId];
              if (!meta) return false;
              if (!canRead(meta.feature)) return false;
              if (meta.membershipRequired && !isActive) return false;
              return true;
            });
            if (visibleItems.length === 0) return null;

            return (
              <List
                key={groupId}
                title={t(groupMeta.translationKey)}
                style={{ marginTop: theme.spacing.l }}
              >
                {visibleItems.map((item, index) => {
                  const itemId = item.itemId as ItemId;
                  const itemMeta = ANIMALS_ITEMS[itemId];
                  if (!itemMeta) return null;

                  return (
                    <List.Item
                      key={itemId}
                      title={t(itemMeta.translationKey)}
                      onPress={() =>
                        navigation.navigate(itemMeta.route as never)
                      }
                      hideBottomDivider={index === visibleItems.length - 1}
                    />
                  );
                })}
              </List>
            );
          })}
      </ContentView>
    </ScrollView>
  );
}
