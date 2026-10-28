import { IonIconButton } from "@/components/buttons/IconButton";
import { NumberInput } from "@/components/inputs/NumberInput";
import { Select } from "@/components/select/Select";
import { Subtitle } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  PARASITE_RESULT_GRADES,
  PARASITE_TYPES,
  parasiteCountUnitKey,
} from "./ParasiteCharts";
import {
  hasDuplicateParasiteType,
  newResultDraft,
  ParasiteResultDraft,
} from "./parasite-sample-draft.store";

const EGGS_INPUT_WIDTH = 80;

// Editable list of parasite / eggs-per-gram rows of one sample
export function ParasiteResultsEditor({
  results,
  onChange,
}: {
  results: ParasiteResultDraft[];
  onChange: (results: ParasiteResultDraft[]) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();

  const parasiteTypeOptions = PARASITE_TYPES.map((parasiteType) => ({
    label: t(`parasite_checks.parasite_types.${parasiteType}`),
    value: parasiteType,
  }));
  const gradeOptions = PARASITE_RESULT_GRADES.map((grade) => ({
    label: t(`parasite_checks.grades.${grade}`),
    value: grade,
  }));

  function updateResult(
    resultKey: string,
    change: Partial<ParasiteResultDraft>,
  ) {
    onChange(
      results.map((result) =>
        result.key === resultKey ? { ...result, ...change } : result,
      ),
    );
  }

  function addResult() {
    // Suggest the first parasite type not yet used in this sample
    const usedTypes = new Set(results.map((result) => result.parasiteType));
    const nextType =
      PARASITE_TYPES.find((type) => !usedTypes.has(type)) ?? "other";
    onChange([...results, newResultDraft(nextType)]);
  }

  return (
    <View>
      <View
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {results.map((result, index) => (
          <View
            key={result.key}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.xs,
              paddingLeft: theme.spacing.s,
              paddingVertical: theme.spacing.s,
              borderTopWidth: index === 0 ? 0 : 1,
              borderTopColor: theme.colors.gray4,
            }}
          >
            <View style={{ flex: 1 }}>
              <Select
                singleLine
                label={t("parasite_checks.parasite_type")}
                value={result.parasiteType}
                data={parasiteTypeOptions}
                onChange={(parasiteType) => {
                  const matchingType = PARASITE_TYPES.find(
                    (type) => type === parasiteType,
                  );
                  if (!matchingType) return;
                  // An empty row switches to the usual result kind of the parasite
                  const isEmpty =
                    result.countPerGram === "" &&
                    (result.grade === null || result.grade === "negative");
                  updateResult(result.key, {
                    parasiteType: matchingType,
                    ...(isEmpty
                      ? { useGrade: newResultDraft(matchingType).useGrade }
                      : {}),
                  });
                }}
              />
            </View>
            <View style={{ width: EGGS_INPUT_WIDTH }}>
              {result.useGrade ? (
                <Select
                  singleLine
                  label={t("parasite_checks.result_value")}
                  value={result.grade ?? "negative"}
                  data={gradeOptions}
                  onChange={(grade) =>
                    updateResult(result.key, {
                      grade:
                        PARASITE_RESULT_GRADES.find(
                          (option) => option === grade,
                        ) ?? "negative",
                    })
                  }
                />
              ) : (
                <NumberInput
                  float
                  label={t("parasite_checks.result_value")}
                  value={result.countPerGram}
                  onChangeText={(countPerGram) =>
                    updateResult(result.key, { countPerGram })
                  }
                />
              )}
            </View>
            {/* The unit decides whether the value is a count (EpG/OpG/LpG) or a
                grade (+/++/+++); tapping it switches */}
            <TouchableOpacity
              onPress={() =>
                updateResult(result.key, {
                  useGrade: !result.useGrade,
                  grade: result.grade ?? "negative",
                })
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
                paddingHorizontal: 8,
                paddingVertical: 6,
                borderRadius: 14,
                backgroundColor: theme.colors.gray4,
              }}
            >
              <Subtitle style={{ fontSize: 12, color: theme.colors.gray1 }}>
                {result.useGrade
                  ? t("parasite_checks.grade")
                  : t(parasiteCountUnitKey(result.parasiteType))}
              </Subtitle>
              <Ionicons
                name="swap-vertical"
                size={12}
                color={theme.colors.gray2}
              />
            </TouchableOpacity>
            <IonIconButton
              icon="trash-outline"
              type="ghost"
              iconSize={22}
              color={theme.colors.danger}
              onPress={() =>
                onChange(
                  results.filter(
                    (currentResult) => currentResult.key !== result.key,
                  ),
                )
              }
            />
          </View>
        ))}

        {/* Add row as last list entry */}
        <TouchableOpacity
          onPress={addResult}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.xs,
            padding: theme.spacing.m,
            borderTopWidth: results.length === 0 ? 0 : 1,
            borderTopColor: theme.colors.gray4,
          }}
        >
          <Ionicons
            name="add-circle-outline"
            size={22}
            color={theme.colors.primary}
          />
          <Subtitle style={{ color: theme.colors.primary, fontWeight: "600" }}>
            {t("parasite_checks.add_parasite")}
          </Subtitle>
        </TouchableOpacity>
      </View>

      {hasDuplicateParasiteType(results) && (
        <Subtitle style={{ color: theme.colors.danger, marginTop: 6 }}>
          {t("parasite_checks.duplicate_parasite_type")}
        </Subtitle>
      )}
    </View>
  );
}
