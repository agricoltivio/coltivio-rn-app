import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";

type BottomDrawerModalProps = {
  onClose?: () => void;
  backdropDisappearsOnIndex?: number;
  containerStyle?: ViewStyle;
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  // Fits the content like the default drawer, but scrolls once the content is taller than this (px)
  maxContentHeight?: number;
  onChange?: (index: number) => void;
};

export const BottomDrawerModal = forwardRef<
  BottomSheetModal,
  BottomDrawerModalProps
>(
  (
    {
      onClose,
      containerStyle,
      backdropDisappearsOnIndex = -1,
      snapPoints,
      maxContentHeight,
      onChange,
      children,
    },
    ref,
  ) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    // Owners close the sheet from their state (e.g. selection cleared), also after the user swiped it
    // closed. dismiss() on an already closed sheet keeps the next present() from showing it
    // (bottom-sheet 5.2), so dismiss() only reaches the sheet while it is open.
    const sheetRef = useRef<BottomSheetModal>(null);
    const isOpenRef = useRef(false);
    useImperativeHandle(
      ref,
      () => ({
        present: (...args: Parameters<BottomSheetModal["present"]>) => {
          isOpenRef.current = true;
          sheetRef.current?.present(...args);
        },
        dismiss: (...args: Parameters<BottomSheetModal["dismiss"]>) => {
          if (!isOpenRef.current) return;
          sheetRef.current?.dismiss(...args);
        },
        snapToIndex: (...args: Parameters<BottomSheetModal["snapToIndex"]>) =>
          sheetRef.current?.snapToIndex(...args),
        snapToPosition: (
          ...args: Parameters<BottomSheetModal["snapToPosition"]>
        ) => sheetRef.current?.snapToPosition(...args),
        expand: (...args: Parameters<BottomSheetModal["expand"]>) =>
          sheetRef.current?.expand(...args),
        collapse: (...args: Parameters<BottomSheetModal["collapse"]>) =>
          sheetRef.current?.collapse(...args),
        close: (...args: Parameters<BottomSheetModal["close"]>) =>
          sheetRef.current?.close(...args),
        forceClose: (...args: Parameters<BottomSheetModal["forceClose"]>) =>
          sheetRef.current?.forceClose(...args),
      }),
      [],
    );

    const contentStyle = {
      paddingBottom: insets.bottom + theme.spacing.s,
      paddingHorizontal: theme.spacing.l,
      ...containerStyle,
    };

    return (
      <BottomSheetModal
        ref={sheetRef}
        enablePanDownToClose
        onDismiss={() => {
          isOpenRef.current = false;
          onClose?.();
        }}
        onChange={(index: number) => {
          if (index >= 0) isOpenRef.current = true;
          onChange?.(index);
        }}
        {...(snapPoints ? { snapPoints, enableDynamicSizing: false } : {})}
        {...(maxContentHeight
          ? { maxDynamicContentSize: maxContentHeight }
          : {})}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            disappearsOnIndex={backdropDisappearsOnIndex}
            {...props}
          />
        )}
      >
        {snapPoints || maxContentHeight ? (
          <BottomSheetScrollView contentContainerStyle={contentStyle}>
            {children}
          </BottomSheetScrollView>
        ) : (
          <BottomSheetView style={contentStyle}>{children}</BottomSheetView>
        )}
      </BottomSheetModal>
    );
  },
);
BottomDrawerModal.displayName = "BottomDrawerModal";
