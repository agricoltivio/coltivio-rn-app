import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import { Switch } from "@/components/inputs/Switch";
import { type BaseLayer } from "@/components/map/MapLibreMap";
import { H3, Label } from "@/theme/Typography";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { type MapVisibleLayers } from "./plots-map-mode";

type MapLayersDrawerProps = {
  visible: boolean;
  onClose: () => void;
  visibleLayers: MapVisibleLayers;
  onChange: (visibleLayers: MapVisibleLayers) => void;
  baseLayer: BaseLayer;
  onBaseLayerChange: (baseLayer: BaseLayer) => void;
};

const BASE_LAYERS: BaseLayer[] = ["satellite", "map"];

export function MapLayersDrawer({
  visible,
  onClose,
  visibleLayers,
  onChange,
  baseLayer,
  onBaseLayerChange,
}: MapLayersDrawerProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const snapPoints = useMemo(() => [380], []);
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
          <View
            style={{
              flexDirection: "row",
              borderWidth: 1,
              borderColor: theme.colors.primary,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {BASE_LAYERS.map((layer) => {
              const isActive = layer === baseLayer;
              return (
                <TouchableOpacity
                  key={layer}
                  onPress={() => onBaseLayerChange(layer)}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    paddingVertical: theme.spacing.s,
                    backgroundColor: isActive
                      ? theme.colors.primary
                      : theme.colors.white,
                  }}
                >
                  <Label
                    style={{
                      color: isActive
                        ? theme.colors.white
                        : theme.colors.primary,
                    }}
                  >
                    {t(`plots.map_layers.${layer}`)}
                  </Label>
                </TouchableOpacity>
              );
            })}
          </View>
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
          <Switch
            label={t("plots.map_layers.parcels")}
            value={visibleLayers.parcels}
            onChange={() =>
              onChange({ ...visibleLayers, parcels: !visibleLayers.parcels })
            }
          />
        </View>
      </BottomDrawerModal>
    </BottomSheetModalProvider>
  );
}
