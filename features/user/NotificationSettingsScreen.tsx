import { useApi } from "@/api/api";
import { Button } from "@/components/buttons/Button";
import { ContentView } from "@/components/containers/ContentView";
import { Switch } from "@/components/inputs/Switch";
import { ScrollView } from "@/components/views/ScrollView";
import {
  getNotificationPermissionAsync,
  registerPushTokenAsync,
} from "@/features/notifications/push-notifications";
import { Body, H2 } from "@/theme/Typography";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, View } from "react-native";
import { useTheme } from "styled-components/native";
import { NotificationSettingsScreenProps } from "./navigation/user-routes";
import {
  useUpdateTaskPushNotificationsMutation,
  useUserQuery,
} from "./users.hooks";

export function NotificationSettingsScreen(
  _props: NotificationSettingsScreenProps,
) {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi();
  const { user } = useUserQuery();
  const updateTaskPushNotificationsMutation =
    useUpdateTaskPushNotificationsMutation();
  const [notificationPermissionBlocked, setNotificationPermissionBlocked] =
    useState(false);

  // Re-checked on focus so the note disappears after returning from the system settings
  const refreshNotificationPermission = useCallback(() => {
    getNotificationPermissionAsync({ requestPermission: false })
      .then((permission) =>
        setNotificationPermissionBlocked(permission?.blocked ?? false),
      )
      .catch(() => setNotificationPermissionBlocked(false));
  }, []);
  useFocusEffect(refreshNotificationPermission);

  // Enabling asks for permission first and only turns the setting on once it's granted,
  // so it's never enabled without permission. If the OS won't prompt anymore, the switch
  // stays off and the note below points to the system settings.
  async function handleTaskPushNotificationsChange(enabled: boolean) {
    if (!enabled) {
      updateTaskPushNotificationsMutation.mutate(false);
      return;
    }
    try {
      const permission = await getNotificationPermissionAsync({
        requestPermission: true,
      });
      setNotificationPermissionBlocked(permission?.blocked ?? false);
      // null: simulator/emulator without push support, the setting can still be toggled
      if (permission != null && !permission.granted) {
        return;
      }
      updateTaskPushNotificationsMutation.mutate(true);
      if (permission != null) {
        await registerPushTokenAsync(api.users);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <ScrollView
      headerTitleOnScroll={t("settings.notifications.title")}
      showHeaderOnScroll
    >
      <ContentView>
        <H2>{t("settings.notifications.title")}</H2>

        <View
          style={{
            marginTop: theme.spacing.l,
            padding: theme.spacing.m,
            borderRadius: 10,
            backgroundColor: theme.colors.white,
            gap: theme.spacing.s,
          }}
        >
          <Switch
            label={t("settings.notifications.tasks_due")}
            value={user?.taskPushNotifications ?? false}
            disabled={!user}
            onChange={(event) =>
              handleTaskPushNotificationsChange(event.nativeEvent.value)
            }
          />
          {notificationPermissionBlocked && (
            <>
              <Body style={{ color: theme.colors.gray2 }}>
                {t("settings.task_push_notifications.permission_denied")}
              </Body>
              <Button
                title={t("settings.task_push_notifications.open_settings")}
                onPress={() => Linking.openSettings()}
              />
            </>
          )}
        </View>
      </ContentView>
    </ScrollView>
  );
}
