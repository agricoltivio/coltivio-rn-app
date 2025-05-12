import { Button } from "@/components/buttons/Button";
import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { Card } from "@/components/card/Card";
import { Checkbox } from "@/components/inputs/Checkbox";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import { Subtitle, Title } from "@/theme/Typography";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";

export function PlotSelectionOrDrawTip() {
  const { t } = useTranslation();
  const { localSettings, updateLocalSettings } = useLocalSettings();
  const theme = useTheme();
  const [showTip, setShowTip] = useState(
    localSettings.showSelectPlotsOrDrawTip
  );

  const [visible, setVisible] = useState(
    localSettings.showSelectPlotsOrDrawTip
  );

  if (!visible) {
    return null;
  }

  function onDone() {
    if (!showTip) {
      updateLocalSettings("showSelectPlotsOrDrawTip", false);
    }
    setVisible(false);
  }
  return (
    <Card
      style={{
        position: "absolute",
        top: 170,
        left: theme.spacing.m,
        right: theme.spacing.m,
        zIndex: 100,
      }}
    >
      <Title>{t("tips.select_or_draw_area.select_area")}</Title>
      <View style={{ marginTop: theme.spacing.m }}>
        <Subtitle style={{ marginBottom: theme.spacing.s }}>
          {t("tips.select_or_draw_area.chose_select_or_draw")}
        </Subtitle>
        <Subtitle style={{ marginBottom: theme.spacing.s }}>
          {t("tips.select_or_draw_area.draw_tip")}
        </Subtitle>
        <View
          style={{
            flexDirection: "row",
            gap: theme.spacing.s,
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIconButton
            style={{
              width: 45,
              backgroundColor: "white",
              alignSelf: "center",
            }}
            type="accent"
            color="black"
            iconSize={30}
            icon="vector-polyline-plus"
          />
          <MaterialCommunityIconButton
            style={{
              width: 45,
              backgroundColor: "white",
              alignSelf: "center",
            }}
            type="accent"
            color="black"
            iconSize={30}
            icon="check"
          />
        </View>
      </View>
      <View style={{ marginTop: theme.spacing.m }}>
        <View
          style={{
            flexDirection: "row",
            gap: theme.spacing.m,
            justifyContent: "center",
            marginBottom: theme.spacing.m,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              gap: theme.spacing.m,
              paddingVertical: theme.spacing.s,
            }}
            onPress={() => {
              setShowTip((prev) => !prev);
            }}
          >
            <Subtitle>{t("common.dont_show_again")}</Subtitle>
            <Checkbox
              checked={!showTip}
              onPress={() => {
                setShowTip((prev) => !prev);
              }}
            />
          </TouchableOpacity>
        </View>
        <Button fontSize={16} title={t("buttons.ok")} onPress={onDone} />
      </View>
    </Card>
  );
}
