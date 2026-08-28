import { Body, H3 } from "@/theme/Typography";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text } from "@/components/text/Text";
import { useTheme } from "styled-components/native";
import { DonationModal } from "./DonationModal";
import { MembershipBenefitsList } from "./MembershipBenefitsList";

type AgriColtivioPitchProps = {
  // Skips the open-source/data-security paragraphs and the donate link — for surfaces (like
  // the membership screen) where the full pitch is too much
  compact?: boolean;
};

export function AgriColtivioPitch({ compact = false }: AgriColtivioPitchProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [donationModalVisible, setDonationModalVisible] = useState(false);

  return (
    <>
      {!compact && (
        <H3 style={{ marginTop: theme.spacing.s }}>
          {t("agri_coltivio.subheading")}
        </H3>
      )}
      <Body style={{ marginTop: theme.spacing.m }}>
        {t("agri_coltivio.membership_intro_pre")}
        <Text style={{ fontWeight: "bold" }}>
          {t("agri_coltivio.membership_intro_bold_1")}
        </Text>
        {t("agri_coltivio.membership_intro_mid")}
        <Text style={{ fontWeight: "bold" }}>
          {t("agri_coltivio.membership_intro_bold_2")}
        </Text>
      </Body>

      <H3 style={{ marginTop: theme.spacing.l }}>
        {t("membership.community_heading")}
      </H3>
      <View style={{ marginTop: theme.spacing.s }}>
        <MembershipBenefitsList />
      </View>

      {!compact && (
        <>
          <Body
            style={{
              marginTop: theme.spacing.l,
              color: theme.colors.primary,
              textDecorationLine: "underline",
              fontWeight: "600",
            }}
            onPress={() => setDonationModalVisible(true)}
          >
            {t("agri_coltivio.donate_link_alt")}
          </Body>
          <H3 style={{ marginTop: theme.spacing.l }}>
            {t("agri_coltivio.section_2_heading")}
          </H3>
          <Body style={{ marginTop: theme.spacing.m }}>
            {t("agri_coltivio.section_2")}
          </Body>
          <Body style={{ marginTop: theme.spacing.m }}>
            <Text style={{ fontWeight: "bold" }}>
              {t("agri_coltivio.section_3_bold")}
            </Text>
            {t("agri_coltivio.section_3")}
          </Body>
        </>
      )}

      <Body style={{ marginTop: theme.spacing.m }}>
        {t("agri_coltivio.community_text")}
      </Body>

      {!compact && (
        <DonationModal
          visible={donationModalVisible}
          onClose={() => setDonationModalVisible(false)}
        />
      )}
    </>
  );
}
