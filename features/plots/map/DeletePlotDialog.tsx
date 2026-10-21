import { Button } from "@/components/buttons/Button";
import { H3, Body } from "@/theme/Typography";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, Modal, Pressable, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useDeletePlotMutation, useUpdatePlotMutation } from "../plots.hooks";
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

  // Archived plots leave the map like deleted ones, but keep their entries
  function handleRemoved() {
    dispatch({ type: "SELECT_PLOT", plotId: null });
    onClose();
  }
  const showError = () =>
    Alert.alert(t("common.error"), t("common.unknown_error"));
  const deletePlotMutation = useDeletePlotMutation(handleRemoved, showError);
  const archivePlotMutation = useUpdatePlotMutation(handleRemoved, showError);
  const isPending =
    deletePlotMutation.isPending || archivePlotMutation.isPending;

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
          <Body style={{ marginTop: theme.spacing.s }}>
            {t("archive.plot_delete_hint")}
          </Body>
          <Button
            style={{ marginTop: theme.spacing.l }}
            type="accent"
            fontSize={15}
            title={t("archive.archive")}
            onPress={() =>
              // Same confirmation as archiving from the edit screen
              Alert.alert(
                t("archive.plot_confirm_title", { name: plotName }),
                t("archive.plot_info"),
                [
                  { text: t("buttons.cancel"), style: "cancel" },
                  {
                    text: t("archive.archive"),
                    onPress: () =>
                      archivePlotMutation.mutate({
                        plotId,
                        data: { archived: true },
                      }),
                  },
                ],
              )
            }
            loading={archivePlotMutation.isPending}
            disabled={isPending}
          />
          <View
            style={{
              flexDirection: "row",
              gap: theme.spacing.m,
              marginTop: theme.spacing.s,
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
              disabled={isPending}
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
