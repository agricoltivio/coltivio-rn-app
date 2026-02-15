import { Button } from "@/components/buttons/Button";
import { H3, Body } from "@/theme/Typography";
import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useDeletePlotMutation } from "../plots.hooks";
import { usePlotsMapContext } from "./plots-map-mode";

type DeletePlotDialogProps = {
  visible: boolean;
  plotId: string;
  plotName: string;
  onClose: () => void;
};

export function DeletePlotDialog({
  visible,
  plotId,
  plotName,
  onClose,
}: DeletePlotDialogProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { dispatch } = usePlotsMapContext();

  const deletePlotMutation = useDeletePlotMutation(
    () => {
      dispatch({ type: "SELECT_PLOT", plotId: null });
      onClose();
    },
    (error) => console.error(error),
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onClose}
      >
        <View
          style={{
            backgroundColor: theme.colors.white,
            borderRadius: 12,
            width: "80%",
            padding: theme.spacing.l,
          }}
        >
          <H3>{t("plots.delete.heading", { name: plotName })}</H3>
          <Body style={{ marginTop: theme.spacing.m }}>
            {t("plots.delete.entries_warning")}
          </Body>
          <View
            style={{
              flexDirection: "row",
              gap: theme.spacing.m,
              marginTop: theme.spacing.l,
            }}
          >
            <Button
              style={{ flex: 1 }}
              type="accent"
              fontSize={15}
              title={t("buttons.cancel")}
              onPress={onClose}
            />
            <Button
              style={{ flex: 1 }}
              type="danger"
              fontSize={15}
              title={t("buttons.delete")}
              onPress={() => deletePlotMutation.mutate(plotId)}
              loading={deletePlotMutation.isPending}
              disabled={deletePlotMutation.isPending}
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
