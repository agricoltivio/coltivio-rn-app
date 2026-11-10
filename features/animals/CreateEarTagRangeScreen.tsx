import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { ApiError } from "@/api/api";
import { useCreateEarTagRangeMutation, useEarTagsQuery } from "./earTags.hooks";
import { CreateEarTagRangeScreenProps } from "./navigation/animals-routes";

type EarTagRangeFormValues = {
  fromNumber: string;
  amount: string;
};

// Same format the API expects: optional letter prefix + number, e.g. "CH001" or "201231"
export const EAR_TAG_NUMBER_PATTERN = /^([A-Za-z]*)(\d+)$/;

// Conflicting numbers listed in the preview; the rest is summarized as a count
const MAX_LISTED_CONFLICTS = 10;
// Largest range the API creates or deletes at once
export const MAX_EAR_TAG_RANGE_SIZE = 1000;

type EarTagRangePreview = {
  fromNumber: string;
  toNumber: string;
  amount: number;
  // Existing tags inside the range, sorted
  conflictingNumbers: string[];
};

// The range of `amount` tags starting at `fromNumber`, numbered like the API does it:
// same prefix, zero padded to the start number's length, e.g. ("CH001", 50) -> CH001..CH050.
// Conflicts are found by checking each existing tag against the range, so a large
// amount doesn't build a large list. Null while the input is incomplete or invalid.
function buildRangePreview(
  fromNumberInput: string,
  amountInput: string,
  existingNumbers: string[],
): EarTagRangePreview | null {
  const fromNumber = fromNumberInput.trim();
  const match = fromNumber.match(EAR_TAG_NUMBER_PATTERN);
  const amount = /^\d+$/.test(amountInput.trim())
    ? parseInt(amountInput, 10)
    : 0;
  if (!match || amount < 1) return null;
  const [, prefix, digits] = match;
  const firstValue = parseInt(digits, 10);
  const lastValue = firstValue + amount - 1;
  const formatNumber = (value: number) =>
    `${prefix}${value.toString().padStart(digits.length, "0")}`;

  const conflictingNumbers = existingNumbers
    .filter((existingNumber) => {
      const existingMatch = existingNumber.match(EAR_TAG_NUMBER_PATTERN);
      if (!existingMatch || existingMatch[1] !== prefix) return false;
      const existingValue = parseInt(existingMatch[2], 10);
      // Only an exact match counts, e.g. "CH0105" isn't "CH105"
      return (
        existingValue >= firstValue &&
        existingValue <= lastValue &&
        formatNumber(existingValue) === existingNumber
      );
    })
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return {
    fromNumber,
    toNumber: formatNumber(lastValue),
    amount,
    conflictingNumbers,
  };
}

export function CreateEarTagRangeScreen({
  navigation,
}: CreateEarTagRangeScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EarTagRangeFormValues>();
  const { earTags } = useEarTagsQuery();

  // Live preview of the range below the inputs, including overlaps with existing tags
  const fromNumberInput = useWatch({ control, name: "fromNumber" }) ?? "";
  const amountInput = useWatch({ control, name: "amount" }) ?? "";
  const preview = earTags
    ? buildRangePreview(
        fromNumberInput,
        amountInput,
        earTags.map((earTag) => earTag.number),
      )
    : null;
  const listedConflicts =
    preview?.conflictingNumbers.slice(0, MAX_LISTED_CONFLICTS) ?? [];
  const remainingConflictCount =
    (preview?.conflictingNumbers.length ?? 0) - listedConflicts.length;

  const createEarTagRangeMutation = useCreateEarTagRangeMutation(
    () => navigation.goBack(),
    // Conflicts are checked before confirming; the API still rejects them if tags were
    // created in the meantime (e.g. on another device)
    (error) =>
      Alert.alert(
        t("common.error"),
        error instanceof ApiError && error.code === "ear_tag_range_conflict"
          ? t("ear_tags.range_conflict_server")
          : t("common.unknown_error"),
      ),
  );

  // Creating a wrong range produces many tags that are tedious to clean up, so confirm first
  function onSubmit(data: EarTagRangeFormValues) {
    if (!earTags) return;
    const range = buildRangePreview(
      data.fromNumber,
      data.amount,
      earTags.map((earTag) => earTag.number),
    );
    // Overlapping existing tags isn't possible: the API would reject the whole range
    if (!range || range.conflictingNumbers.length > 0) return;
    const { fromNumber, toNumber, amount } = range;

    Alert.alert(
      t("ear_tags.confirm_create_title"),
      t("ear_tags.confirm_create_message", {
        from: fromNumber,
        to: toNumber,
        total: amount,
      }),
      [
        { text: t("buttons.cancel"), style: "cancel" },
        {
          text: t("buttons.confirm"),
          onPress: () =>
            createEarTagRangeMutation.mutate({ fromNumber, toNumber }),
        },
      ],
    );
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmit)}
            disabled={
              !isDirty ||
              !earTags ||
              (preview?.conflictingNumbers.length ?? 0) > 0 ||
              createEarTagRangeMutation.isPending
            }
            loading={createEarTagRangeMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("ear_tags.new_ear_tag_range")}
        keyboardAware
      >
        <H2>{t("ear_tags.new_ear_tag_range")}</H2>
        <View
          style={{ gap: theme.spacing.xs, flex: 1, marginTop: theme.spacing.m }}
        >
          <RHTextInput
            name="fromNumber"
            control={control}
            label={t("ear_tags.first_number")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
              validate: (value) =>
                EAR_TAG_NUMBER_PATTERN.test(value.trim()) ||
                t("ear_tags.invalid_number"),
            }}
            error={errors.fromNumber?.message}
          />
          <RHNumberInput
            name="amount"
            control={control}
            label={t("ear_tags.amount")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
              validate: (value) => {
                const amount = parseInt(value, 10);
                if (!(amount >= 1)) return t("ear_tags.invalid_amount");
                // The API creates at most this many tags at once
                if (amount > MAX_EAR_TAG_RANGE_SIZE) {
                  return t("ear_tags.range_too_large", {
                    max: MAX_EAR_TAG_RANGE_SIZE,
                  });
                }
                return true;
              },
            }}
            error={errors.amount?.message}
          />
          {preview && (
            <View
              style={{
                marginTop: theme.spacing.m,
                padding: theme.spacing.m,
                borderRadius: 10,
                backgroundColor: theme.colors.white,
                gap: theme.spacing.xxs,
              }}
            >
              <Subtitle>{t("ear_tags.range_preview_title")}</Subtitle>
              <H3>
                {t("ear_tags.range_preview_range", {
                  from: preview.fromNumber,
                  to: preview.toNumber,
                })}
              </H3>
              <Subtitle>
                {t("ear_tags.range_preview_total", { total: preview.amount })}
              </Subtitle>
              {listedConflicts.length > 0 && (
                <Subtitle
                  style={{
                    marginTop: theme.spacing.xs,
                    color: theme.colors.danger,
                  }}
                >
                  {remainingConflictCount > 0
                    ? t("ear_tags.range_conflict_more", {
                        numbers: listedConflicts.join(", "),
                        remaining: remainingConflictCount,
                      })
                    : t("ear_tags.range_conflict", {
                        numbers: listedConflicts.join(", "),
                      })}
                </Subtitle>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ContentView>
  );
}
