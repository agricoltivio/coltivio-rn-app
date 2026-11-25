import { ApiError, createAuthClient } from "@/api/api";
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
  // A registration still retrying must not register this device for the signed-out user again
  registrationGeneration++;
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

// Waits between the attempts of registerPushTokenAsync
const PUSH_TOKEN_RETRY_DELAYS_MS = [2000, 5000];

// exp.host passes the status only in the message ("received: 400 (body: ...)"); a client
// error is named by its number, a server error may be a number or any status text
const CLIENT_ERROR_STATUS = /received: 4\d\d\b/;
// fetch of our API without a response: offline, or the request timed out
const NETWORK_FAILURE = /^Network request (failed|timed out)$/;

// How a failed registration attempt is handled:
// - retry: bad connections and outages of exp.host or our API, which pass on their own
// - quiet: the session ended (401); registration runs again after the next sign-in
// - report: a real failure, e.g. Firebase not configured on Android
function classifyPushTokenError(error: unknown): "retry" | "quiet" | "report" {
  if (error instanceof ApiError) {
    if (error.status === 401) return "quiet";
    return error.status >= 500 ? "retry" : "report";
  }
  if (!(error instanceof Error)) {
    return "report";
  }
  const code = "code" in error ? error.code : undefined;
  if (code === "ERR_NOTIFICATIONS_NETWORK_ERROR") {
    return "retry";
  }
  if (code === "ERR_NOTIFICATIONS_SERVER_ERROR") {
    return CLIENT_ERROR_STATUS.test(error.message) ? "report" : "retry";
  }
  return error instanceof TypeError && NETWORK_FAILURE.test(error.message)
    ? "retry"
    : "report";
}

// Bumped by every registration and by sign-out: an older registration that is still retrying
// stops, so it can neither register this device for a signed-out user nor store an older token
// over a newer one (app start and a rotated device token can register at the same time)
let registrationGeneration = 0;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Gets the Expo push token and registers it with the backend.
// Pass devicePushToken when calling from addPushTokenListener: without it the Expo token
// lookup fetches the device token itself, which fires the listener again (endless loop).
// Transient failures (network, 5xx of exp.host or our API) are retried; if they persist the
// registration is retried on the next app start, so they only leave a breadcrumb, like an ended
// session. Every other failure is a real one (e.g. Firebase not configured on Android) and goes
// to Sentry here; callers don't report it again. A registration superseded by a newer one or by
// sign-out (see registrationGeneration) stops without an error.
export async function registerPushTokenAsync(
  usersApi: UsersApi,
  devicePushToken?: Notifications.DevicePushToken,
) {
  const generation = ++registrationGeneration;
  const isSuperseded = () => generation !== registrationGeneration;
  // Fetched once: when only our API failed, a retry doesn't ask exp.host again
  let pushToken: string | null = null;
  for (let attempt = 0; ; attempt++) {
    try {
      if (pushToken === null) {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;
        const expoToken = await Notifications.getExpoPushTokenAsync({
          projectId,
          devicePushToken,
        });
        pushToken = expoToken.data;
      }
      if (isSuperseded()) return;
      await usersApi.registerPushToken({
        token: pushToken,
        platform: Platform.OS === "ios" ? "ios" : "android",
      });
      if (isSuperseded()) return;
      await SecureStore.setItemAsync(PUSH_TOKEN_STORAGE_KEY, pushToken);
      return;
    } catch (error) {
      const handling = classifyPushTokenError(error);
      if (handling === "report") {
        Sentry.captureException(error);
        throw error;
      }
      if (
        handling === "quiet" ||
        attempt >= PUSH_TOKEN_RETRY_DELAYS_MS.length
      ) {
        Sentry.addBreadcrumb({
          category: "push-notifications",
          level: "warning",
          message: `Push token registration failed after ${attempt + 1} attempts: ${String(error)}`,
        });
        throw error;
      }
      await wait(PUSH_TOKEN_RETRY_DELAYS_MS[attempt]);
      if (isSuperseded()) return;
    }
  }
}
