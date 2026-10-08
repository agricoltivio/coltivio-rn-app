import { useApi } from "@/api/api";
import { useSession } from "@/auth/SessionProvider";
import { useActiveFarm } from "@/features/farms/ActiveFarmContext";
import { useFarmsQuery } from "@/features/farms/farms.hooks";
import {
  useUpdateTaskPushNotificationsMutation,
  useUserQuery,
} from "@/features/user/users.hooks";
import { RootStackParamList } from "@/navigation/rootStackTypes";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import {
  getNotificationPermissionAsync,
  parseTasksDueNotificationData,
  registerPushTokenAsync,
} from "./push-notifications";

// Rendered next to RootStack inside the NavigationContainer. Keeps the push token registered
// and routes taps on "tasks due" notifications (including cold starts) to the tasks.
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
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  // The same response is returned on every render, it must only navigate once
  const handledResponseIdRef = useRef<string | null>(null);

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
      .catch((error) => console.error(error));
    // Only fires when a device token exists, so permission is granted
    const subscription = Notifications.addPushTokenListener(
      (devicePushToken) => {
        registerPushTokenAsync(api.users, devicePushToken).catch((error) =>
          console.error(error),
        );
      },
    );
    return () => subscription.remove();
  }, [token]);

  // The setting must never stay enabled without permission: turn it off when permission
  // was revoked in the system settings, checked on start and whenever the app returns to
  // the foreground. Only "blocked" counts, so a never-asked user (e.g. before the tasks
  // onboarding) keeps the enabled default until they get asked.
  const taskPushNotificationsEnabled = user?.taskPushNotifications === true;
  useEffect(() => {
    if (!taskPushNotificationsEnabled) {
      return;
    }
    function disableIfPermissionBlocked() {
      getNotificationPermissionAsync({ requestPermission: false })
        .then((permission) => {
          if (permission?.blocked) {
            updateTaskPushNotificationsMutation.mutate(false);
          }
        })
        .catch((error) => console.error(error));
    }
    disableIfPermissionBlocked();
    const subscription = AppState.addEventListener("change", (appState) => {
      if (appState === "active") {
        disableIfPermissionBlocked();
      }
    });
    return () => subscription.remove();
  }, [taskPushNotificationsEnabled]);

  useEffect(() => {
    if (!lastNotificationResponse || !token) {
      return;
    }
    const responseId = lastNotificationResponse.notification.request.identifier;
    if (handledResponseIdRef.current === responseId) {
      return;
    }
    const notificationData = parseTasksDueNotificationData(
      lastNotificationResponse.notification.request.content.data,
    );
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

    if (isMemberOfFarm && notificationData.taskIds.length === 1) {
      navigation.navigate("TaskDetail", {
        taskId: notificationData.taskIds[0],
      });
    } else {
      navigation.navigate("TaskList");
    }
  }, [lastNotificationResponse, token, farms, user, activeFarmId]);

  return null;
}
