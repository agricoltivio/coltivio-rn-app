import { SquareIconCta } from "@/components/buttons/SquareIconCta";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled, { useTheme } from "styled-components/native";
import { useNavigation } from "@react-navigation/core";
import { InsetsProps } from "@/constants/Screen";
import { IonIconButton } from "@/components/buttons/IconButton";

export const TopRightCloseButton = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <AbsoluteView insets={insets}>
      <IonIconButton
        type="accent"
        color={theme.colors.black}
        iconSize={30}
        onPress={() => navigation.goBack()}
        icon={"close"}
      />
    </AbsoluteView>
  );
};

const AbsoluteView = styled.View<InsetsProps>`
  position: absolute;
  right: ${({ theme }) => theme.spacing.m}px;
  top: ${({ insets, theme }) => insets.top}px;
  align-items: center;
`;
