import { ApiError } from "@/api/api";
import * as Sentry from "@sentry/react-native";
import { TFunction } from "i18next";

// Message for a failed request: specific when the API returned an error code this app knows
// (errors.codes), otherwise the given fallback (also for codes of newer API versions)
export function apiErrorMessage(
  error: unknown,
  fallback: string,
  t: TFunction,
): string {
  return error instanceof ApiError && error.code
    ? t(`errors.codes.${error.code}`, { defaultValue: fallback })
    : fallback;
}

// Reports a failed request to Sentry unless the API rejected it (4xx: validation, conflicts,
// expired session), which the user is told about. For onError handlers of mutations: passing
// onError skips the global report in App.tsx.
export function reportUnexpectedError(error: unknown) {
  const isExpectedRejection =
    error instanceof ApiError && error.status >= 400 && error.status < 500;
  if (!isExpectedRejection) Sentry.captureException(error);
}
