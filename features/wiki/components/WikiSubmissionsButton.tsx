import { IonIconButton } from "@/components/buttons/IconButton";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import React from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useMyChangeRequestsQuery } from "../wiki.hooks";

type WikiSubmissionsButtonProps = {
  onPress: () => void;
};

export function WikiSubmissionsButton({ onPress }: WikiSubmissionsButtonProps) {
  const theme = useTheme();
  const { changeRequests } = useMyChangeRequestsQuery();
  const { localSettings } = useLocalSettings();

  const hasActivity = changeRequests.some(
    (cr) => cr.status !== localSettings.wikiSeenCrStatuses[cr.id],
  );

  return (
    <View>
      <IonIconButton
        icon="document-text-outline"
        type="ghost"
        iconSize={28}
        color={theme.colors.primary}
        onPress={onPress}
      />
      {hasActivity && (
        <View
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.colors.amber,
          }}
          pointerEvents="none"
        />
      )}
    </View>
  );
}
