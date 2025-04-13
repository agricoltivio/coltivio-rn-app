import {
  BottomSheetBackdrop,
  BottomSheetModal,
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
};

export const BottomDrawerModal = forwardRef<
  BottomSheetModal,
  BottomDrawerModalProps
>(
  (
    { onClose, containerStyle, backdropDisappearsOnIndex = -1, children },
    ref
  ) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    return (
      <BottomSheetModal
        ref={ref}
        enablePanDownToClose
        onDismiss={onClose}
        backdropComponent={(props) => {
          return (
            <BottomSheetBackdrop
              disappearsOnIndex={backdropDisappearsOnIndex}
              {...props}
            />
          );
        }}
      >
        <BottomSheetView
          style={{
            paddingBottom: insets.bottom + theme.spacing.s,
            paddingHorizontal: theme.spacing.l,
            ...containerStyle,
          }}
        >
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);
