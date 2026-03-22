import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef } from "react";
import { ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";

type BottomDrawerModalProps = {
  onClose?: () => void;
  backdropDisappearsOnIndex?: number;
  containerStyle?: ViewStyle;
  children: React.ReactNode;
  snapPoints?: (string | number)[];
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
      onChange,
      children,
    },
    ref,
  ) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const contentStyle = {
      paddingBottom: insets.bottom + theme.spacing.s,
      paddingHorizontal: theme.spacing.l,
      ...containerStyle,
    };

    return (
      <BottomSheetModal
        ref={ref}
        enablePanDownToClose
        onDismiss={onClose}
        onChange={onChange}
        {...(snapPoints ? { snapPoints, enableDynamicSizing: false } : {})}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            disappearsOnIndex={backdropDisappearsOnIndex}
            {...props}
          />
        )}
      >
        {snapPoints ? (
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
