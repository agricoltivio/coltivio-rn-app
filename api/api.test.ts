import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { ApiError, createAuthClient } from "./api";

jest.mock("@/auth/SessionProvider", () => ({ useSession: jest.fn() }));
jest.mock("@/supabase/supabase", () => ({
  supabase: { auth: { refreshSession: jest.fn() } },
}));
jest.mock("@/locales/i18n", () => ({ language: "de" }));

const originalFetch = globalThis.fetch;

function respondWith(response: Response) {
  globalThis.fetch = jest.fn(async () => response) as typeof fetch;
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
      (error: unknown) => error,
    );
}

describe("api middleware error responses", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("throws an ApiError for a 504 with an empty body", async () => {
    respondWith(
      new Response("", { status: 504, statusText: "Gateway Timeout" }),
    );
    const error = await registerPushTokenError();
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(504);
    expect((error as ApiError).message).toContain("504 - Gateway Timeout");
    expect((error as ApiError).serverMessage).toBeUndefined();
    expect((error as ApiError).code).toBeUndefined();
  });

  test("keeps message and code of a JSON error body", async () => {
    respondWith(
      new Response(
        JSON.stringify({ error: "Plot overlaps", code: "PLOT_OVERLAP" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
    );
    const error = await registerPushTokenError();
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(400);
    expect((error as ApiError).message).toContain("400 - Plot overlaps");
    expect((error as ApiError).serverMessage).toBe("Plot overlaps");
    expect((error as ApiError).code).toBe("PLOT_OVERLAP");
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
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(502);
    expect((error as ApiError).message).toContain("502 - <html><body>");
    expect((error as ApiError).message.length).toBeLessThan(html.length);
    expect((error as ApiError).serverMessage).toBeUndefined();
  });
});
