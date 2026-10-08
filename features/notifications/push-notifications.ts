import { createAuthClient } from "@/api/api";
import { userApi } from "@/api/user.api";
import { setBeforeSignOutHandler } from "@/auth/SessionProvider";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const PUSH_TOKEN_STORAGE_KEY = "expoPushToken";

type UsersApi = ReturnType<typeof userApi>;

// Show notifications as banners while the app is in the foreground too
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Unregister this device before the session is cleared, while the JWT is still valid.
// Failures are ignored: the backend drops dead tokens on its own.
setBeforeSignOutHandler(async (authToken) => {
  const storedPushToken = await SecureStore.getItemAsync(
    PUSH_TOKEN_STORAGE_KEY,
  ).catch(() => null);
  if (!storedPushToken) {
    return;
  }
  await userApi(createAuthClient(authToken))
    .deletePushToken(storedPushToken)
    .catch((error) => console.error(error));
  await SecureStore.deleteItemAsync(PUSH_TOKEN_STORAGE_KEY).catch(() => {});
});

export type TasksDueNotificationData = {
  type: "tasks_due";
  farmId: string;
  taskIds: string[];
};

export function parseTasksDueNotificationData(
  data: Record<string, unknown> | undefined,
): TasksDueNotificationData | null {
  if (!data || data.type !== "tasks_due" || typeof data.farmId !== "string") {
    return null;
  }
  const taskIds = Array.isArray(data.taskIds)
    ? data.taskIds.filter(
        (taskId): taskId is string => typeof taskId === "string",
      )
    : [];
  return { type: "tasks_due", farmId: data.farmId, taskIds };
}

export type NotificationPermission = {
  granted: boolean;
  // Permanently denied: the OS won't show the prompt again, only the system settings help
  blocked: boolean;
  // Whether the OS prompt was shown during this call
  prompted: boolean;
};

// Returns null on simulators/emulators, where push notifications aren't supported
export async function getNotificationPermissionAsync({
  requestPermission,
}: {
  requestPermission: boolean;
}): Promise<NotificationPermission | null> {
  if (!Device.isDevice) {
    return null;
  }
  // Android requires the channel to exist before asking for permission
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  let permission = await Notifications.getPermissionsAsync();
  let prompted = false;
  if (!permission.granted && requestPermission && permission.canAskAgain) {
    permission = await Notifications.requestPermissionsAsync();
    prompted = true;
  }
  return {
    granted: permission.granted,
    blocked: !permission.granted && !permission.canAskAgain,
    prompted,
  };
}

// Gets the Expo push token and registers it with the backend.
// Pass devicePushToken when calling from addPushTokenListener: without it the Expo token
// lookup fetches the device token itself, which fires the listener again (endless loop).
export async function registerPushTokenAsync(
  usersApi: UsersApi,
  devicePushToken?: Notifications.DevicePushToken,
) {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  const { data: pushToken } = await Notifications.getExpoPushTokenAsync({
    projectId,
    devicePushToken,
  });
  await usersApi.registerPushToken({
    token: pushToken,
    platform: Platform.OS === "ios" ? "ios" : "android",
  });
  await SecureStore.setItemAsync(PUSH_TOKEN_STORAGE_KEY, pushToken);
}
