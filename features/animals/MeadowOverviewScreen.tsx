import { IonIconButton } from "@/components/buttons/IconButton";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { useLayoutEffect } from "react";
import { useTheme } from "styled-components/native";
import { MeadowDetailsContent } from "./MeadowDetailsContent";
import { useMeadowByIdQuery } from "./meadows.hooks";
import { MeadowOverviewScreenProps } from "./navigation/animals-routes";

export function MeadowOverviewScreen({
  route,
  navigation,
}: MeadowOverviewScreenProps) {
  const theme = useTheme();
  const { meadowId } = route.params;
  const { meadow } = useMeadowByIdQuery(meadowId);

  // Archived meadows open the map with the archived layer visible
  const isArchived = meadow?.archivedAt != null;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IonIconButton
          icon="globe-outline"
          type="ghost"
          iconSize={26}
          color={theme.colors.primary}
          onPress={() =>
            navigation.navigate("PlotsMap", {
              selectedMeadowId: meadowId,
              showArchived: isArchived,
            })
          }
        />
      ),
    });
  }, [navigation, isArchived, meadowId, theme.colors.primary]);

  if (!meadow) {
    return null;
  }

  return (
    <ContentView>
      <ScrollView showHeaderOnScroll headerTitleOnScroll={meadow.name}>
        <H2>{meadow.name}</H2>
        <MeadowDetailsContent meadow={meadow} navigation={navigation} />
      </ScrollView>
    </ContentView>
  );
}
