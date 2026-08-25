import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { Subtitle } from "@/theme/Typography";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";

export function CreateModeChooser() {
  const { t } = useTranslation();
  const theme = useTheme();
  const frame = useSafeAreaFrame();
  const { dispatch } = usePlotsMapContext();

  return (
    <Card
      style={{
        position: "absolute",
        top: frame.height / 2 - 130,
        left: theme.spacing.m,
        right: theme.spacing.m,
      }}
    >
      <Subtitle>{t("plots.add.map.mode_select.message")}</Subtitle>
      <View style={{ marginTop: theme.spacing.l, gap: theme.spacing.s }}>
        <Button
          title={t("buttons.draw_area")}
          onPress={() => dispatch({ type: "SET_CREATE_ACTION", action: "draw" })}
        />
        <Button
          title={t("buttons.parcel_select")}
          type="accent"
          onPress={() =>
            dispatch({ type: "SET_CREATE_ACTION", action: "parcel" })
          }
        />
        <Button
          title={t("buttons.cancel")}
          type="secondary"
          onPress={() => dispatch({ type: "EXIT_MODE" })}
        />
      </View>
    </Card>
  );
}
