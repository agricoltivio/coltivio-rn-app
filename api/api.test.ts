import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { ApiError, createAuthClient } from "./api";

jest.mock("@/auth/SessionProvider", () => ({ useSession: jest.fn() }));
jest.mock("@/supabase/supabase", () => ({
  supabase: { auth: { refreshSession: jest.fn() } },
}));
jest.mock("@/locales/i18n", () => ({ language: "de" }));

function respondWith(response: Response) {
  jest.spyOn(globalThis, "fetch").mockResolvedValue(response);
}

function asApiError(error: unknown): ApiError {
  if (!(error instanceof ApiError)) {
    throw new Error(`expected an ApiError, got ${String(error)}`);
  }
  return error;
}

async function registerPushTokenError() {
  const client = createAuthClient("token");
  return client
    .POST("/v1/me/push-tokens", {
      body: { token: "ExponentPushToken[x]", platform: "android" },
    })
    .then(
      () => {
        throw new Error("expected the request to fail");
      },
      (error: unknown) => asApiError(error),
    );
}

describe("api middleware error responses", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("throws an ApiError for a 504 with an empty body", async () => {
    respondWith(
      new Response("", { status: 504, statusText: "Gateway Timeout" }),
    );
    const error = await registerPushTokenError();
    expect(error.status).toBe(504);
    expect(error.message).toContain("504 - Gateway Timeout");
    expect(error.serverMessage).toBeUndefined();
    expect(error.code).toBeUndefined();
  });

  test("keeps message and code of a JSON error body", async () => {
    respondWith(
      new Response(
        JSON.stringify({ error: "Plot overlaps", code: "PLOT_OVERLAP" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
    );
    const error = await registerPushTokenError();
    expect(error.status).toBe(400);
    expect(error.message).toContain("400 - Plot overlaps");
    expect(error.serverMessage).toBe("Plot overlaps");
    expect(error.code).toBe("PLOT_OVERLAP");
  });

  test("keeps the text of a JSON body that isn't the API's error shape", async () => {
    respondWith(
      new Response(JSON.stringify({ message: "Service Unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const error = await registerPushTokenError();
    expect(error.status).toBe(503);
    expect(error.message).toContain('503 - {"message":"Service Unavailable"}');
    expect(error.serverMessage).toBeUndefined();
    expect(error.code).toBeUndefined();
  });

  test("throws an ApiError with a shortened body for an HTML error page", async () => {
    const html = `<html><body>${"Bad Gateway ".repeat(50)}</body></html>`;
    respondWith(
      new Response(html, {
        status: 502,
        headers: { "Content-Type": "text/html" },
      }),
    );
    const error = await registerPushTokenError();
    expect(error.status).toBe(502);
    expect(error.message).toContain("502 - <html><body>");
    expect(error.message.length).toBeLessThan(html.length);
    expect(error.serverMessage).toBeUndefined();
  });
});
