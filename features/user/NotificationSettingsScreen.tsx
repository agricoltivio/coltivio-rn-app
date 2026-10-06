import { useApi } from "@/api/api";
import { Button } from "@/components/buttons/Button";
import { ContentView } from "@/components/containers/ContentView";
import { Switch } from "@/components/inputs/Switch";
import { ScrollView } from "@/components/views/ScrollView";
import { registerForPushNotificationsAsync } from "@/features/notifications/push-notifications";
import { Body, H2 } from "@/theme/Typography";
import { useFocusEffect } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
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
  const [notificationPermissionDenied, setNotificationPermissionDenied] =
    useState(false);

  // Re-checked on focus so the note disappears after returning from the system settings
  const refreshNotificationPermission = useCallback(() => {
    Notifications.getPermissionsAsync()
      .then((permission) =>
        setNotificationPermissionDenied(permission.status === "denied"),
      )
      .catch(() => setNotificationPermissionDenied(false));
  }, []);
  useFocusEffect(refreshNotificationPermission);

  function handleTaskPushNotificationsChange(enabled: boolean) {
    updateTaskPushNotificationsMutation.mutate(enabled);
    if (enabled) {
      registerForPushNotificationsAsync(api.users, { requestPermission: true })
        .catch((error) => console.error(error))
        .finally(refreshNotificationPermission);
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
          {notificationPermissionDenied && user?.taskPushNotifications && (
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
