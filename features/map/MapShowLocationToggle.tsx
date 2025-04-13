import { IonIconButton } from "@/components/buttons/IconButton";
import { InsetsProps } from "@/constants/Screen";
import { PermissionStatus, useForegroundPermissions } from "expo-location";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled, { useTheme } from "styled-components/native";

type MapShowLocationToggleProps = {
  onShowLocationChange?: (showLocation: boolean) => void;
};

export const MapShowLocationToggle = ({
  onShowLocationChange,
}: MapShowLocationToggleProps) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const [showLocationEnabled, setShowLocationEnabled] =
    useState<boolean>(false);
  const [permission, requestPermission] = useForegroundPermissions();
  useEffect(() => {
    if (!permission) {
      return;
    }
    if (permission?.status === PermissionStatus.GRANTED) {
      setShowLocationEnabled(true);
      onShowLocationChange && onShowLocationChange(true);
    } else {
      setShowLocationEnabled(false);
      onShowLocationChange && onShowLocationChange(false);
    }
  }, [permission]);

  const toggleShowLocation = async () => {
    if (showLocationEnabled) {
      // hide the location again:
      setShowLocationEnabled(false);
      onShowLocationChange && onShowLocationChange(false);
    } else {
      if (permission?.status !== PermissionStatus.GRANTED) {
        const permission = await requestPermission();
        const granted = permission.status === PermissionStatus.GRANTED;

        if (granted) {
          setShowLocationEnabled(true);
          onShowLocationChange && onShowLocationChange(true);
        }
        if (!granted) {
          Alert.alert(
            t("permissions.location.error.title"),
            t("permissions.location.error.message")
          );
        }
      } else {
        setShowLocationEnabled(true);
        onShowLocationChange && onShowLocationChange(true);
      }
      //   const permissionGranted = await requestLocationPermission();
      // setShowUserLocation(permissionGranted);
      // onPermissionStatusChange(permissionGranted);
    }
  };

  const showLocation =
    showLocationEnabled && permission?.status === PermissionStatus.GRANTED;

  return (
    <AbsoluteView insets={insets}>
      <IonIconButton
        type="accent"
        color={showLocation ? theme.colors.blue : theme.colors.black}
        iconSize={30}
        onPress={toggleShowLocation}
        icon={showLocation ? "navigate" : "navigate-outline"}
      />
    </AbsoluteView>
  );
};

const AbsoluteView = styled.View<InsetsProps>`
  position: absolute;
  left: ${({ theme }) => theme.spacing.m}px;
  top: ${({ insets, theme }) => insets.top + theme.spacing.s + 50}px;
  align-items: center;
`;
