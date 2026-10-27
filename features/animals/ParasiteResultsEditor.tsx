import { IonIconButton } from "@/components/buttons/IconButton";
import { NumberInput } from "@/components/inputs/NumberInput";
import { Select } from "@/components/select/Select";
import { Subtitle } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { PARASITE_TYPES, parasiteCountUnitKey } from "./ParasiteCharts";
import {
  hasDuplicateParasiteType,
  nextResultKey,
  ParasiteResultDraft,
} from "./parasite-sample-draft.store";

const EGGS_INPUT_WIDTH = 72;

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
    onChange([
      ...results,
      { key: nextResultKey(), parasiteType: nextType, countPerGram: "" },
    ]);
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
                  if (matchingType) {
                    updateResult(result.key, { parasiteType: matchingType });
                  }
                }}
              />
            </View>
            <View style={{ width: EGGS_INPUT_WIDTH }}>
              <NumberInput
                float
                label={t(parasiteCountUnitKey(result.parasiteType))}
                value={result.countPerGram}
                onChangeText={(countPerGram) =>
                  updateResult(result.key, { countPerGram })
                }
              />
            </View>
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
