import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { Select } from "@/components/select/Select";
import { usePermissions } from "@/features/user/users.hooks";
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
  const { mode, dispatch, exitMeadowFlow, meadowFlowOpenedExternally } =
    usePlotsMapContext();
  const { canWrite } = usePermissions();

  if (mode.type !== "create") return null;
  const isMeadow = mode.target === "meadow";

  // Only offer targets the member is allowed to create
  const targetOptions = [
    ...(canWrite("field_calendar")
      ? [{ label: t("plots.add.map.mode_select.target_plot"), value: "plot" }]
      : []),
    ...(canWrite("animals")
      ? [
          {
            label: t("plots.add.map.mode_select.target_meadow"),
            value: "meadow",
          },
        ]
      : []),
  ];

  return (
    <Card
      style={{
        position: "absolute",
        top: frame.height / 2 - 170,
        left: theme.spacing.m,
        right: theme.spacing.m,
      }}
    >
      {/* Opened from another screen to create a meadow: the target is fixed */}
      {!meadowFlowOpenedExternally && targetOptions.length > 1 && (
        <View style={{ marginBottom: theme.spacing.m }}>
          <Select
            label={t("plots.add.map.mode_select.target")}
            value={mode.target}
            data={targetOptions}
            onChange={(value) => {
              if (value === "plot" || value === "meadow") {
                dispatch({ type: "SET_CREATE_TARGET", target: value });
              }
            }}
          />
        </View>
      )}
      <Subtitle>
        {isMeadow
          ? t("plots.add.map.mode_select.message_meadow")
          : t("plots.add.map.mode_select.message")}
      </Subtitle>
      <View style={{ marginTop: theme.spacing.l, gap: theme.spacing.s }}>
        <Button
          title={t("buttons.draw_area")}
          type="accent"
          onPress={() =>
            dispatch({ type: "SET_CREATE_ACTION", action: "draw" })
          }
        />
        <Button
          title={
            isMeadow
              ? t("plots.add.map.mode_select.select_plots")
              : t("buttons.parcel_select")
          }
          type="accent"
          onPress={() =>
            dispatch({
              type: "SET_CREATE_ACTION",
              action: isMeadow ? "plots" : "parcel",
            })
          }
        />
        <Button
          title={t("buttons.cancel")}
          type="dangerGhost"
          onPress={() =>
            isMeadow ? exitMeadowFlow() : dispatch({ type: "EXIT_MODE" })
          }
        />
      </View>
    </Card>
  );
}
