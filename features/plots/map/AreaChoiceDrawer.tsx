import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import { ListItem } from "@/components/list/ListItem";
import { H3 } from "@/theme/Typography";
import { round } from "@/utils/math";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "./plots-map-mode";

// Asks which area was meant when a tap hits several overlapping ones (e.g. a meadow over plots)
export function AreaChoiceDrawer() {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    mode,
    dispatch,
    areaChoiceOptions,
    setAreaChoiceOptions,
    setSelectedMeadowId,
  } = usePlotsMapContext();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // RAF defers present() by one frame so a freshly-mounted sheet has time to initialize
  useEffect(() => {
    if (areaChoiceOptions) {
      const raf = requestAnimationFrame(() => {
        bottomSheetModalRef.current?.present();
      });
      return () => cancelAnimationFrame(raf);
    }
    bottomSheetModalRef.current?.dismiss();
  }, [areaChoiceOptions]);

  if (mode.type !== "view") return null;

  return (
    <BottomSheetModalProvider>
      <BottomDrawerModal
        onClose={() => setAreaChoiceOptions(null)}
        ref={bottomSheetModalRef}
      >
        <View style={{ gap: theme.spacing.s }}>
          <H3>{t("plots.map.choose_area")}</H3>
          <View>
            {(areaChoiceOptions ?? []).map((option) => (
              <ListItem
                key={option.id}
                onPress={() => {
                  setAreaChoiceOptions(null);
                  if (option.kind === "meadow") {
                    dispatch({ type: "SELECT_PLOT", plotId: null });
                    setSelectedMeadowId(option.id);
                  } else {
                    setSelectedMeadowId(null);
                    dispatch({ type: "SELECT_PLOT", plotId: option.id });
                  }
                }}
              >
                <ListItem.Content>
                  <View style={{ flexDirection: "row" }}>
                    <ListItem.Title numberOfLines={1} style={{ flex: 1 }}>
                      {option.name}
                    </ListItem.Title>
                    <ListItem.Body>
                      {" "}
                      ({round(option.size / 100, 1)}a)
                    </ListItem.Body>
                  </View>
                  <ListItem.Body>
                    {option.kind === "meadow"
                      ? t("animals.meadows.meadow")
                      : t("plots.plot")}
                  </ListItem.Body>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            ))}
          </View>
        </View>
      </BottomDrawerModal>
    </BottomSheetModalProvider>
  );
}
