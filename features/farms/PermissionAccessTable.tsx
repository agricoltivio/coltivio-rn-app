import { PermissionAccess, PermissionFeature } from "@/api/farms.api";
import { RadioButton } from "@/components/buttons/RadioButton";
import { Body } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";

export const ALL_PERMISSION_FEATURES: PermissionFeature[] = [
  "animals",
  "field_calendar",
  "commerce",
  "tasks",
];

// The three levels the backend stores per feature. "none" is what a member without a stored
// row gets, so it has to be selectable here rather than implied by the absence of a row.
const ACCESS_LEVELS: PermissionAccess[] = ["none", "read", "write"];

const COLUMN_WIDTH = 64;

type PermissionAccessTableProps = {
  accessFor: (feature: PermissionFeature) => PermissionAccess;
  onChange: (feature: PermissionFeature, access: PermissionAccess) => void;
  disabled?: boolean;
};

export function PermissionAccessTable({
  accessFor,
  onChange,
  disabled,
}: PermissionAccessTableProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.white,
        borderRadius: theme.radii.m,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: theme.spacing.m,
          paddingVertical: theme.spacing.s,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.gray4,
        }}
      >
        <Body style={{ flex: 1 }} />
        {ACCESS_LEVELS.map((level) => (
          <Body
            key={level}
            style={{
              width: COLUMN_WIDTH,
              textAlign: "center",
              color: theme.colors.gray1,
              fontSize: 12,
            }}
          >
            {t(`farm.permission_${level}` as Parameters<typeof t>[0])}
          </Body>
        ))}
      </View>
      {ALL_PERMISSION_FEATURES.map((feature, index) => {
        const access = accessFor(feature);
        return (
          <View
            key={feature}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: theme.spacing.m,
              paddingVertical: theme.spacing.s,
              borderBottomWidth:
                index < ALL_PERMISSION_FEATURES.length - 1 ? 1 : 0,
              borderBottomColor: theme.colors.gray4,
            }}
          >
            <Body style={{ flex: 1 }}>
              {t(
                `farm.permission_feature_${feature}` as Parameters<typeof t>[0],
              )}
            </Body>
            {ACCESS_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => onChange(feature, level)}
                disabled={disabled}
                accessibilityRole="radio"
                accessibilityState={{ checked: access === level, disabled }}
                accessibilityLabel={t(
                  `farm.permission_${level}` as Parameters<typeof t>[0],
                )}
                hitSlop={8}
                style={{
                  width: COLUMN_WIDTH,
                  alignItems: "center",
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                <RadioButton selected={access === level} />
              </TouchableOpacity>
            ))}
          </View>
        );
      })}
    </View>
  );
}
