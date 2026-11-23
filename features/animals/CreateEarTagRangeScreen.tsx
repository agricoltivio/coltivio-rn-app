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
import {
  buildEarTagRange,
  EAR_TAG_RANGE_DIGITS_PATTERN,
  EarTagRange,
  MAX_EAR_TAG_RANGE_SIZE,
} from "./ear-tag-range";
import { CreateEarTagRangeScreenProps } from "./navigation/animals-routes";
import { useDiscardChangesPrompt } from "@/navigation/useDiscardChangesPrompt";

type EarTagRangeFormValues = {
  prefix: string;
  fromNumber: string;
  amount: string;
};

// Conflicting numbers listed in the preview; the rest is summarized as a count
const MAX_LISTED_CONFLICTS = 10;

type EarTagRangePreview = EarTagRange & {
  // Existing tags inside the range, sorted
  conflictingNumbers: string[];
};

// The range of `amount` tags starting at the first number, and the existing tags in it.
// Null while the input is incomplete or invalid.
function buildRangePreview(
  prefixInput: string,
  fromNumberInput: string,
  amountInput: string,
  existingNumbers: string[],
): EarTagRangePreview | null {
  const range = buildEarTagRange(prefixInput, fromNumberInput, amountInput);
  if (!range) return null;
  return {
    ...range,
    conflictingNumbers: existingNumbers
      .filter(range.contains)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
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
  } = useForm<EarTagRangeFormValues>({
    defaultValues: { prefix: "", fromNumber: "", amount: "" },
  });
  // Asks before leaving with unsaved changes
  useDiscardChangesPrompt(isDirty);
  const { earTags } = useEarTagsQuery();

  // Live preview of the range below the inputs, including overlaps with existing tags
  const prefixInput = useWatch({ control, name: "prefix" }) ?? "";
  const fromNumberInput = useWatch({ control, name: "fromNumber" }) ?? "";
  const amountInput = useWatch({ control, name: "amount" }) ?? "";
  const preview = earTags
    ? buildRangePreview(
        prefixInput,
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
      data.prefix,
      data.fromNumber,
      data.amount,
      earTags.map((earTag) => earTag.number),
    );
    // Overlapping existing tags isn't possible: the API would reject the whole range
    if (!range || range.conflictingNumbers.length > 0) return;
    const { fromNumber, toNumber, amount, prefix, fromDigits, toDigits } =
      range;

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
            createEarTagRangeMutation.mutate({
              fromNumber: fromDigits,
              toNumber: toDigits,
              prefix: prefix || undefined,
            }),
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
          {/* Text in front of the numbers, e.g. "CH" or "CH 120." */}
          <RHTextInput
            name="prefix"
            control={control}
            label={t("ear_tags.prefix")}
            placeholder={t("ear_tags.prefix_placeholder")}
            autoCapitalize="characters"
            optional
          />
          <RHTextInput
            name="fromNumber"
            control={control}
            label={t("ear_tags.first_number")}
            keyboardType="number-pad"
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
              validate: (value) =>
                EAR_TAG_RANGE_DIGITS_PATTERN.test(value.trim()) ||
                t("ear_tags.invalid_digits"),
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
