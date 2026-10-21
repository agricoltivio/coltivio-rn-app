import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import { Switch } from "@/components/inputs/Switch";
import { H3 } from "@/theme/Typography";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { type MapVisibleLayers } from "./plots-map-mode";

type MapLayersDrawerProps = {
  visible: boolean;
  onClose: () => void;
  visibleLayers: MapVisibleLayers;
  onChange: (visibleLayers: MapVisibleLayers) => void;
};

export function MapLayersDrawer({
  visible,
  onClose,
  visibleLayers,
  onChange,
}: MapLayersDrawerProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const snapPoints = useMemo(() => [270], []);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // RAF defers present() by one frame so a freshly-mounted sheet has time to initialize
  useEffect(() => {
    if (visible) {
      const raf = requestAnimationFrame(() =>
        bottomSheetModalRef.current?.present(),
      );
      return () => cancelAnimationFrame(raf);
    }
    bottomSheetModalRef.current?.dismiss();
  }, [visible]);

  return (
    <BottomSheetModalProvider>
      <BottomDrawerModal
        onClose={onClose}
        ref={bottomSheetModalRef}
        backdropDisappearsOnIndex={-1}
        snapPoints={snapPoints}
      >
        <H3>{t("plots.map_layers.title")}</H3>
        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.m }}>
          <Switch
            label={t("plots.map_layers.plots")}
            value={visibleLayers.plots}
            onChange={() =>
              onChange({ ...visibleLayers, plots: !visibleLayers.plots })
            }
          />
          <Switch
            label={t("plots.map_layers.meadows")}
            value={visibleLayers.meadows}
            onChange={() =>
              onChange({ ...visibleLayers, meadows: !visibleLayers.meadows })
            }
          />
          <Switch
            label={t("plots.map_layers.archived")}
            value={visibleLayers.archived}
            onChange={() =>
              onChange({ ...visibleLayers, archived: !visibleLayers.archived })
            }
          />
        </View>
      </BottomDrawerModal>
    </BottomSheetModalProvider>
  );
}
