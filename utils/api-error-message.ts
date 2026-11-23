import { ApiError } from "@/api/api";
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
