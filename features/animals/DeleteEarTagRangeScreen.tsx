import { EarTag } from "@/api/earTags.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  buildEarTagRange,
  EAR_TAG_RANGE_DIGITS_PATTERN,
  EarTagRange,
  MAX_EAR_TAG_RANGE_SIZE,
} from "./ear-tag-range";
import { useDeleteEarTagRangeMutation, useEarTagsQuery } from "./earTags.hooks";
import { DeleteEarTagRangeScreenProps } from "./navigation/animals-routes";

type DeleteEarTagRangeFormValues = {
  prefix: string;
  fromNumber: string;
  amount: string;
};

// Kept numbers listed in the preview; the rest is summarized as a count
const MAX_LISTED_ASSIGNED = 10;

type DeleteRangePreview = EarTagRange & {
  // Existing tags in the range: unassigned ones get deleted, assigned ones are kept
  deletableNumbers: string[];
  assignedNumbers: string[];
};

// The range of `amount` numbers starting at the first number, and the existing tags in it.
// Null while the input is incomplete or invalid.
function buildDeletePreview(
  prefixInput: string,
  fromNumberInput: string,
  amountInput: string,
  earTags: EarTag[],
): DeleteRangePreview | null {
  const range = buildEarTagRange(prefixInput, fromNumberInput, amountInput);
  if (!range) return null;
  const tagsInRange = earTags
    .filter((earTag) => range.contains(earTag.number))
    .sort((a, b) =>
      a.number.localeCompare(b.number, undefined, { numeric: true }),
    );
  return {
    ...range,
    deletableNumbers: tagsInRange
      .filter((earTag) => !earTag.animal)
      .map((earTag) => earTag.number),
    assignedNumbers: tagsInRange
      .filter((earTag) => earTag.animal)
      .map((earTag) => earTag.number),
  };
}

export function DeleteEarTagRangeScreen({
  navigation,
}: DeleteEarTagRangeScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DeleteEarTagRangeFormValues>({
    defaultValues: { prefix: "", fromNumber: "", amount: "" },
  });
  const { earTags } = useEarTagsQuery();

  // Live preview of what the range deletes and keeps
  const prefixInput = useWatch({ control, name: "prefix" }) ?? "";
  const fromNumberInput = useWatch({ control, name: "fromNumber" }) ?? "";
  const amountInput = useWatch({ control, name: "amount" }) ?? "";
  const preview = earTags
    ? buildDeletePreview(prefixInput, fromNumberInput, amountInput, earTags)
    : null;
  const listedAssigned =
    preview?.assignedNumbers.slice(0, MAX_LISTED_ASSIGNED) ?? [];
  const remainingAssignedCount =
    (preview?.assignedNumbers.length ?? 0) - listedAssigned.length;

  const deleteRangeMutation = useDeleteEarTagRangeMutation(undefined, () =>
    Alert.alert(t("common.error"), t("common.unknown_error")),
  );

  function onSubmit(data: DeleteEarTagRangeFormValues) {
    if (!earTags) return;
    const range = buildDeletePreview(
      data.prefix,
      data.fromNumber,
      data.amount,
      earTags,
    );
    if (!range || range.deletableNumbers.length === 0) return;
    const { fromNumber, toNumber, prefix, fromDigits, toDigits } = range;
    Alert.alert(
      t("ear_tags.confirm_delete_range_title"),
      t("ear_tags.confirm_delete_range_message", {
        from: fromNumber,
        to: toNumber,
        count: range.deletableNumbers.length,
      }),
      [
        { text: t("buttons.cancel"), style: "cancel" },
        {
          text: t("buttons.delete"),
          style: "destructive",
          onPress: () =>
            deleteRangeMutation.mutate(
              {
                fromNumber: fromDigits,
                toNumber: toDigits,
                prefix: prefix || undefined,
              },
              {
                // Tags may have been assigned meanwhile, the API skips those too
                onSuccess: (result) => {
                  Alert.alert(
                    t("ear_tags.delete_range_done_title"),
                    result.skippedAssigned.length > 0
                      ? t("ear_tags.delete_range_done_skipped", {
                          count: result.deletedCount,
                          skipped: result.skippedAssigned.length,
                        })
                      : t("ear_tags.delete_range_done", {
                          count: result.deletedCount,
                        }),
                  );
                  navigation.goBack();
                },
              },
            ),
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
            type="danger"
            title={t("buttons.delete")}
            onPress={handleSubmit(onSubmit)}
            disabled={
              !earTags ||
              !preview ||
              preview.deletableNumbers.length === 0 ||
              deleteRangeMutation.isPending
            }
            loading={deleteRangeMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("ear_tags.delete_range")}
        keyboardAware
      >
        <H2>{t("ear_tags.delete_range")}</H2>
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
                // The API deletes at most this many numbers at once
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
                {preview.deletableNumbers.length > 0
                  ? t("ear_tags.delete_range_preview_count", {
                      count: preview.deletableNumbers.length,
                    })
                  : t("ear_tags.delete_range_preview_none")}
              </Subtitle>
              {listedAssigned.length > 0 && (
                <Subtitle
                  style={{
                    marginTop: theme.spacing.xs,
                    color: theme.colors.amber,
                  }}
                >
                  {remainingAssignedCount > 0
                    ? t("ear_tags.delete_range_kept_more", {
                        numbers: listedAssigned.join(", "),
                        remaining: remainingAssignedCount,
                      })
                    : t("ear_tags.delete_range_kept", {
                        numbers: listedAssigned.join(", "),
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
