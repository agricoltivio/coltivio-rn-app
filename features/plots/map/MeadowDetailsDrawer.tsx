import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import { MeadowDetailsContent } from "@/features/animals/MeadowDetailsContent";
import { useMeadowsQuery } from "@/features/animals/meadows.hooks";
import { H3 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "./plots-map-mode";

// Used until the content has been measured
const FALLBACK_HEIGHT = 260;
const SHEET_HANDLE_HEIGHT = 24;

export function MeadowDetailsDrawer() {
  const theme = useTheme();
  const { mode, navigation, selectedMeadowId, setSelectedMeadowId } =
    usePlotsMapContext();
  const { meadows } = useMeadowsQuery();

  // Opens fully: one snap point that fits the content (measured below), so the
  // drawer ends right under the buttons. The content is short, so a collapsed
  // step would only hide the useful part.
  const insets = useSafeAreaInsets();
  const [contentHeight, setContentHeight] = useState(0);
  const snapPoints = useMemo(() => {
    if (contentHeight === 0) return [FALLBACK_HEIGHT];
    // Sheet handle + the drawer's bottom padding around the measured content
    return [
      contentHeight + SHEET_HANDLE_HEIGHT + insets.bottom + theme.spacing.s,
    ];
  }, [contentHeight, insets.bottom, theme.spacing.s]);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const selectedMeadow = selectedMeadowId
    ? meadows?.find((meadow) => meadow.id === selectedMeadowId)
    : undefined;

  // RAF defers present() by one frame so a freshly-mounted sheet has time to initialize
  useEffect(() => {
    if (selectedMeadow) {
      const raf = requestAnimationFrame(() => {
        bottomSheetModalRef.current?.present();
      });
      return () => cancelAnimationFrame(raf);
    }
    bottomSheetModalRef.current?.dismiss();
  }, [selectedMeadow?.id]);

  if (mode.type !== "view") return null;

  return (
    <BottomSheetModalProvider>
      <BottomDrawerModal
        onClose={() => setSelectedMeadowId(null)}
        ref={bottomSheetModalRef}
        backdropDisappearsOnIndex={0}
        snapPoints={snapPoints}
      >
        <View
          onLayout={(event) =>
            setContentHeight(event.nativeEvent.layout.height)
          }
        >
          {/* Header with close toggle */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <H3>{selectedMeadow?.name}</H3>
            </View>
            {/* Closes the drawer; there's no collapsed step */}
            <Pressable onPress={() => setSelectedMeadowId(null)}>
              <Ionicons
                name="chevron-down"
                size={24}
                color={theme.colors.gray2}
              />
            </Pressable>
          </View>

          {selectedMeadow && (
            <MeadowDetailsContent
              meadow={selectedMeadow}
              navigation={navigation}
            />
          )}
        </View>
      </BottomDrawerModal>
    </BottomSheetModalProvider>
  );
}
