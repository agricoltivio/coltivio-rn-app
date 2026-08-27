import { Body } from "@/theme/Typography";
import { openMoreInfoUrl } from "@/utils/membership";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { useTheme } from "styled-components/native";

const MEMBER_BENEFIT_KEYS = [
  "member_benefit_0",
  "member_benefit_1",
  "member_benefit_2",
  "member_benefit_3",
] as const;

export function MembershipBenefitsList() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.xs }}>
      {MEMBER_BENEFIT_KEYS.map((key) => (
        <View
          key={key}
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: theme.spacing.s,
          }}
        >
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={theme.colors.primary}
            style={{ marginTop: 2 }}
          />
          <Body style={{ flex: 1 }}>{t(`agri_coltivio.${key}`)}</Body>
        </View>
      ))}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: theme.spacing.s,
        }}
      >
        <Ionicons
          name="checkmark-circle"
          size={18}
          color={theme.colors.primary}
          style={{ marginTop: 2 }}
        />
        <Body style={{ flex: 1 }}>
          {t("agri_coltivio.member_benefit_4")}{" "}
          <Text
            style={{
              color: theme.colors.primary,
              textDecorationLine: "underline",
              fontWeight: "600",
            }}
            onPress={openMoreInfoUrl}
          >
            {t("agri_coltivio.learn_more")}
          </Text>
        </Body>
      </View>
    </View>
  );
}
