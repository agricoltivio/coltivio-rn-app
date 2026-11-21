import { createAuthClient } from "@/api/api";
import { userApi } from "@/api/user.api";
import { setBeforeSignOutHandler } from "@/auth/SessionProvider";
import i18n from "@/locales/i18n";
import * as Sentry from "@sentry/react-native";
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
    .catch((error) => Sentry.captureException(error));
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

export type BreedingDueNotificationData = {
  type: "breeding_due";
  farmId: string;
};

export function parseBreedingDueNotificationData(
  data: Record<string, unknown> | undefined,
): BreedingDueNotificationData | null {
  if (
    !data ||
    data.type !== "breeding_due" ||
    typeof data.farmId !== "string"
  ) {
    return null;
  }
  return { type: "breeding_due", farmId: data.farmId };
}

// Must match defaultChannel of the expo-notifications plugin in app.config.js and the channelId
// the API sends (coltivio-api src/push/expo-client.ts).
const ANDROID_NOTIFICATION_CHANNEL_ID = "reminders";

// Creates the channel, or renames it after a language change. HIGH makes reminders pop up as
// a banner. Android ignores a raised importance on an existing channel, which is why this is
// a new id instead of the old "default" channel (created with DEFAULT importance).
export async function setUpAndroidNotificationChannelAsync() {
  if (Platform.OS !== "android") {
    return;
  }
  await Notifications.setNotificationChannelAsync(
    ANDROID_NOTIFICATION_CHANNEL_ID,
    {
      name: i18n.t("settings.notifications.android_channel_name"),
      // eslint-disable-next-line import/namespace -- re-exported enum, the import plugin can't follow it (tsc checks it)
      importance: Notifications.AndroidImportance.HIGH,
    },
  );
  await Notifications.deleteNotificationChannelAsync("default");
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
  await setUpAndroidNotificationChannelAsync();

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
// Only called once permission is granted, so every failure is a real one (e.g. Firebase not
// configured on Android) and goes to Sentry: callers only log it, nobody sees the console.
export async function registerPushTokenAsync(
  usersApi: UsersApi,
  devicePushToken?: Notifications.DevicePushToken,
) {
  try {
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
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
}
