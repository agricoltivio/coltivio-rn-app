import { useApi } from "@/api/api";
import { useSession } from "@/auth/SessionProvider";
import { useActiveFarm } from "@/features/farms/ActiveFarmContext";
import { useFarmsQuery } from "@/features/farms/farms.hooks";
import { useUserQuery } from "@/features/user/users.hooks";
import { RootStackParamList } from "@/navigation/rootStackTypes";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import {
  parseTasksDueNotificationData,
  registerForPushNotificationsAsync,
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
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  // The same response is returned on every render, it must only navigate once
  const handledResponseIdRef = useRef<string | null>(null);

  // Re-register silently on every app start while logged in (never prompts), and again
  // whenever the OS rotates the device token
  useEffect(() => {
    if (!token) {
      return;
    }
    registerForPushNotificationsAsync(api.users, {
      requestPermission: false,
    }).catch((error) => console.error(error));
    const subscription = Notifications.addPushTokenListener(
      (devicePushToken) => {
        registerForPushNotificationsAsync(api.users, {
          requestPermission: false,
          devicePushToken,
        }).catch((error) => console.error(error));
      },
    );
    return () => subscription.remove();
  }, [token]);

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
