import * as Sentry from "@sentry/react-native";
import { useApi } from "@/api/api";
import { useSession } from "@/auth/SessionProvider";
import { useActiveFarm } from "@/features/farms/ActiveFarmContext";
import { useFarmsQuery } from "@/features/farms/farms.hooks";
import {
  useUpdateBreedingRemindersMutation,
  useUpdateTaskPushNotificationsMutation,
  useUserQuery,
} from "@/features/user/users.hooks";
import { RootStackParamList } from "@/navigation/rootStackTypes";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AppState } from "react-native";
import {
  getNotificationPermissionAsync,
  parseBreedingDueNotificationData,
  parseTasksDueNotificationData,
  registerPushTokenAsync,
  setUpAndroidNotificationChannelAsync,
} from "./push-notifications";

// Rendered next to RootStack inside the NavigationContainer. Keeps the push token registered
// and routes taps on "tasks due" / "breeding due" notifications (including cold starts).
export function PushNotificationsHandler() {
  const { token } = useSession();
  const api = useApi();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeFarmId, setActiveFarmId, farmSelectionHydrated } =
    useActiveFarm();
  const { farms } = useFarmsQuery(token != null);
  const { user } = useUserQuery(token != null && farmSelectionHydrated);
  const updateTaskPushNotificationsMutation =
    useUpdateTaskPushNotificationsMutation();
  const updateBreedingRemindersMutation = useUpdateBreedingRemindersMutation();
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  // The same response is returned on every render, it must only navigate once
  const handledResponseIdRef = useRef<string | null>(null);
  const { i18n } = useTranslation();

  // Firebase drops pushes into its own fallback channel until ours exists, so set it up on
  // every start regardless of login, and again when the language changes to rename it
  useEffect(() => {
    setUpAndroidNotificationChannelAsync().catch((error) =>
      Sentry.captureException(error),
    );
  }, [i18n.language]);

  // Re-register silently on every app start while logged in (never prompts), and again
  // whenever the OS rotates the device token
  useEffect(() => {
    if (!token) {
      return;
    }
    getNotificationPermissionAsync({ requestPermission: false })
      .then((permission) => {
        if (permission?.granted) {
          return registerPushTokenAsync(api.users);
        }
      })
      .catch((error) => Sentry.captureException(error));
    // Only fires when a device token exists, so permission is granted
    const subscription = Notifications.addPushTokenListener(
      (devicePushToken) => {
        registerPushTokenAsync(api.users, devicePushToken).catch((error) =>
          Sentry.captureException(error),
        );
      },
    );
    return () => subscription.remove();
    // Keyed by the session: useApi returns a new object on every render and would register again each time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // The setting must never stay enabled without permission: turn it off when permission
  // was revoked in the system settings, checked on start and whenever the app returns to
  // the foreground. Only "blocked" counts, so a never-asked user (e.g. before the tasks
  // onboarding) keeps the enabled default until they get asked.
  // Breeding reminders are push notifications too and get turned off the same way.
  const taskPushNotificationsEnabled = user?.taskPushNotifications === true;
  const breedingRemindersEnabled =
    user?.breedingReminderDaysBefore1 != null ||
    user?.breedingReminderDaysBefore2 != null;
  useEffect(() => {
    if (!taskPushNotificationsEnabled && !breedingRemindersEnabled) {
      return;
    }
    function disableIfPermissionBlocked() {
      getNotificationPermissionAsync({ requestPermission: false })
        .then((permission) => {
          if (!permission?.blocked) return;
          if (taskPushNotificationsEnabled) {
            updateTaskPushNotificationsMutation.mutate(false);
          }
          if (breedingRemindersEnabled) {
            updateBreedingRemindersMutation.mutate({
              breedingReminderDaysBefore1: null,
              breedingReminderDaysBefore2: null,
            });
          }
        })
        .catch((error) => Sentry.captureException(error));
    }
    disableIfPermissionBlocked();
    const subscription = AppState.addEventListener("change", (appState) => {
      if (appState === "active") {
        disableIfPermissionBlocked();
      }
    });
    return () => subscription.remove();
    // The mutation objects are new on every render, listing them would recheck the permission each time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskPushNotificationsEnabled, breedingRemindersEnabled]);

  useEffect(() => {
    if (!lastNotificationResponse || !token) {
      return;
    }
    const responseId = lastNotificationResponse.notification.request.identifier;
    if (handledResponseIdRef.current === responseId) {
      return;
    }
    const notificationContentData =
      lastNotificationResponse.notification.request.content.data;
    const notificationData =
      parseTasksDueNotificationData(notificationContentData) ??
      parseBreedingDueNotificationData(notificationContentData);
    if (!notificationData) {
      handledResponseIdRef.current = responseId;
      return;
    }
    if (!farms) {
      return;
    }
    const isMemberOfFarm = farms.result.some(
      (farm) => farm.id === notificationData.farmId,
    );
    if (isMemberOfFarm && activeFarmId !== notificationData.farmId) {
      // Switching drops all cached queries; this effect re-runs once farms and the user
      // are refetched for the new farm, and navigates then
      setActiveFarmId(notificationData.farmId);
      return;
    }
    // RootStack only renders the app screens once the user is loaded for an active farm
    if (!user || activeFarmId == null) {
      return;
    }
    handledResponseIdRef.current = responseId;
    // Otherwise the same response is returned again on the next cold start
    Notifications.clearLastNotificationResponseAsync().catch(() => {});

    if (notificationData.type === "breeding_due") {
      navigation.navigate("BreedingCalendar");
    } else if (isMemberOfFarm && notificationData.taskIds.length === 1) {
      navigation.navigate("TaskDetail", {
        taskId: notificationData.taskIds[0],
      });
    } else {
      navigation.navigate("TaskList");
    }
    // setActiveFarmId isn't memoized and also persists the selection; rerunning on every render
    // could switch the farm repeatedly before the response is marked as handled
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastNotificationResponse, token, farms, user, activeFarmId]);

  return null;
}
