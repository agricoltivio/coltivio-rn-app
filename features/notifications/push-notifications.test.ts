import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import { ApiError } from "@/api/api";
import * as Sentry from "@sentry/react-native";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { setBeforeSignOutHandler } from "@/auth/SessionProvider";
import { registerPushTokenAsync } from "./push-notifications";

jest.mock("@/api/api", () => {
  class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  }
  return { ApiError, createAuthClient: jest.fn() };
});
jest.mock("@/auth/SessionProvider", () => ({
  setBeforeSignOutHandler: jest.fn(),
}));
jest.mock("@/locales/i18n", () => ({ t: (key: string) => key }));
jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
}));
jest.mock("expo-device", () => ({ isDevice: true }));
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
}));
jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(async () => {}),
  getItemAsync: jest.fn(async () => null),
  deleteItemAsync: jest.fn(async () => {}),
}));

const getExpoPushTokenAsync = jest.mocked(Notifications.getExpoPushTokenAsync);
// Registered when the module loads, before beforeEach clears the mock calls
const registeredBeforeSignOut = jest.mocked(setBeforeSignOutHandler).mock
  .calls[0][0];
function beforeSignOut(authToken: string) {
  if (!registeredBeforeSignOut) {
    throw new Error("push-notifications registers no before-sign-out handler");
  }
  return registeredBeforeSignOut(authToken);
}
const captureException = jest.mocked(Sentry.captureException);
const captureMessage = jest.mocked(Sentry.captureMessage);
const setItemAsync = jest.mocked(SecureStore.setItemAsync);

function expoError(code: string, message: string) {
  return Object.assign(new Error(message), { code });
}

const expoGatewayTimeout = () =>
  expoError(
    "ERR_NOTIFICATIONS_SERVER_ERROR",
    'Error encountered while fetching Expo token, expected an OK response, received: Gateway Timeout (body: "").',
  );

// Runs the registration and skips the waits between the attempts
async function register(
  ...args: Parameters<typeof registerPushTokenAsync>
): Promise<void> {
  const result = registerPushTokenAsync(...args);
  result.catch(() => {});
  await jest.runAllTimersAsync();
  return result;
}

const pushToken = { type: "expo" as const, data: "ExponentPushToken[x]" };

function usersApiMock(registerPushToken = jest.fn(async () => {})) {
  return { registerPushToken } as unknown as Parameters<
    typeof registerPushTokenAsync
  >[0];
}

describe("registerPushTokenAsync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("retries after a 504 of exp.host and registers the token", async () => {
    getExpoPushTokenAsync
      .mockRejectedValueOnce(expoGatewayTimeout())
      .mockResolvedValueOnce(pushToken);
    const usersApi = usersApiMock();

    await register(usersApi);

    expect(getExpoPushTokenAsync).toHaveBeenCalledTimes(2);
    expect(usersApi.registerPushToken).toHaveBeenCalledTimes(1);
    expect(setItemAsync).toHaveBeenCalledWith("expoPushToken", pushToken.data);
    expect(captureException).not.toHaveBeenCalled();
  });

  test("retries after a 504 of our API and registers the token", async () => {
    getExpoPushTokenAsync.mockResolvedValue(pushToken);
    const registerPushToken = jest
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new ApiError(504, "504 - Gateway Timeout"))
      .mockResolvedValueOnce();
    const usersApi = usersApiMock(registerPushToken);

    await register(usersApi);

    // the Expo token is kept: only our API is asked again
    expect(getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
    expect(registerPushToken).toHaveBeenCalledTimes(2);
    expect(setItemAsync).toHaveBeenCalledTimes(1);
    expect(captureException).not.toHaveBeenCalled();
  });

  test("gives up on a persistent 504 without reporting an exception", async () => {
    getExpoPushTokenAsync.mockRejectedValue(expoGatewayTimeout());
    const usersApi = usersApiMock();

    await expect(register(usersApi)).rejects.toThrow("Gateway Timeout");

    expect(getExpoPushTokenAsync).toHaveBeenCalledTimes(3);
    expect(usersApi.registerPushToken).not.toHaveBeenCalled();
    expect(captureException).not.toHaveBeenCalled();
    expect(captureMessage).not.toHaveBeenCalled();
    expect(Sentry.addBreadcrumb).toHaveBeenCalledTimes(1);
  });

  test("retries network errors of exp.host", async () => {
    getExpoPushTokenAsync
      .mockRejectedValueOnce(
        expoError(
          "ERR_NOTIFICATIONS_NETWORK_ERROR",
          "Error encountered while fetching Expo token: TypeError: Network request failed.",
        ),
      )
      .mockResolvedValueOnce(pushToken);

    await register(usersApiMock());

    expect(getExpoPushTokenAsync).toHaveBeenCalledTimes(2);
    expect(captureException).not.toHaveBeenCalled();
  });

  test("retries when a fetch of our API times out", async () => {
    getExpoPushTokenAsync.mockResolvedValue(pushToken);
    const registerPushToken = jest
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new TypeError("Network request timed out"))
      .mockResolvedValueOnce();

    await register(usersApiMock(registerPushToken));

    expect(registerPushToken).toHaveBeenCalledTimes(2);
    expect(captureException).not.toHaveBeenCalled();
  });

  test("retries a 5xx of exp.host whatever its status text", async () => {
    getExpoPushTokenAsync
      .mockRejectedValueOnce(
        expoError(
          "ERR_NOTIFICATIONS_SERVER_ERROR",
          'Error encountered while fetching Expo token, expected an OK response, received: Gateway Time-out (body: "").',
        ),
      )
      .mockResolvedValueOnce(pushToken);

    await register(usersApiMock());

    expect(getExpoPushTokenAsync).toHaveBeenCalledTimes(2);
    expect(captureException).not.toHaveBeenCalled();
  });

  test("stops without a report when the session has ended (401)", async () => {
    getExpoPushTokenAsync.mockResolvedValue(pushToken);
    const error = new ApiError(401, "401 - Unauthorized");
    const usersApi = usersApiMock(jest.fn(async () => Promise.reject(error)));

    await expect(register(usersApi)).rejects.toBe(error);

    expect(usersApi.registerPushToken).toHaveBeenCalledTimes(1);
    expect(captureException).not.toHaveBeenCalled();
    expect(Sentry.addBreadcrumb).toHaveBeenCalledTimes(1);
  });

  test("a sign-out during the wait stops the retry", async () => {
    getExpoPushTokenAsync.mockResolvedValue(pushToken);
    const registerPushToken = jest
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new ApiError(504, "504 - Gateway Timeout"))
      .mockResolvedValue();
    const result = registerPushTokenAsync(usersApiMock(registerPushToken));
    // let the first attempt fail, then sign out while the retry waits
    await jest.advanceTimersByTimeAsync(0);
    await beforeSignOut("jwt");
    await jest.runAllTimersAsync();

    await expect(result).resolves.toBeUndefined();
    // the device isn't registered for the signed-out user again
    expect(registerPushToken).toHaveBeenCalledTimes(1);
    expect(setItemAsync).not.toHaveBeenCalled();
  });

  test("a newer registration stops an older one that is still retrying", async () => {
    getExpoPushTokenAsync.mockResolvedValue(pushToken);
    const olderRegisterPushToken = jest
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new ApiError(504, "504 - Gateway Timeout"))
      .mockResolvedValue();
    const older = registerPushTokenAsync(usersApiMock(olderRegisterPushToken));
    await jest.advanceTimersByTimeAsync(0);
    const newer = registerPushTokenAsync(usersApiMock());
    await jest.runAllTimersAsync();

    await expect(older).resolves.toBeUndefined();
    await expect(newer).resolves.toBeUndefined();
    expect(olderRegisterPushToken).toHaveBeenCalledTimes(1);
    expect(setItemAsync).toHaveBeenCalledTimes(1);
  });

  test("reports a 4xx of our API without retrying", async () => {
    getExpoPushTokenAsync.mockResolvedValue(pushToken);
    const error = new ApiError(400, "400 - Invalid token");
    const usersApi = usersApiMock(jest.fn(async () => Promise.reject(error)));

    await expect(register(usersApi)).rejects.toBe(error);

    expect(usersApi.registerPushToken).toHaveBeenCalledTimes(1);
    expect(captureException).toHaveBeenCalledWith(error);
  });

  test("reports a 4xx of exp.host without retrying", async () => {
    const error = expoError(
      "ERR_NOTIFICATIONS_SERVER_ERROR",
      'Error encountered while fetching Expo token, expected an OK response, received: 400 (body: "").',
    );
    getExpoPushTokenAsync.mockRejectedValue(error);

    await expect(register(usersApiMock())).rejects.toBe(error);

    expect(getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
    expect(captureException).toHaveBeenCalledWith(error);
  });

  test("reports a missing Firebase configuration without retrying", async () => {
    const error = new Error(
      "Default FirebaseApp is not initialized in this process. Make sure to call FirebaseApp.initializeApp(Context) first.",
    );
    getExpoPushTokenAsync.mockRejectedValue(error);

    await expect(register(usersApiMock())).rejects.toBe(error);

    expect(getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
    expect(captureException).toHaveBeenCalledWith(error);
  });
});
