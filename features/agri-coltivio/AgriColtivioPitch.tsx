import { Body, H3 } from "@/theme/Typography";
import { openMoreInfoUrl } from "@/utils/membership";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";
import { useTheme } from "styled-components/native";
import { DonationModal } from "./DonationModal";

type AgriColtivioPitchProps = {
  // Skips the who-we-are/open-source/data-security paragraphs and the donate link —
  // for surfaces (like the membership screen) where the full pitch is too much
  compact?: boolean;
};

export function AgriColtivioPitch({ compact = false }: AgriColtivioPitchProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [donationModalVisible, setDonationModalVisible] = useState(false);

  return (
    <>
      {!compact && (
        <>
          <H3 style={{ marginTop: theme.spacing.s }}>
            {t("agri_coltivio.subheading")}
          </H3>
          <Body style={{ marginTop: theme.spacing.m }}>
            {t("agri_coltivio.section_1_pre")}
            <Text style={{ fontWeight: "bold" }}>
              {t("agri_coltivio.section_1_bold")}
            </Text>
            {t("agri_coltivio.section_1_post")}
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
      <Body style={{ marginTop: theme.spacing.l, fontWeight: "bold" }}>
        {t("agri_coltivio.section_4")}
      </Body>
      {!compact && (
        <Body
          style={{
            marginTop: theme.spacing.l,
            color: theme.colors.primary,
            textDecorationLine: "underline",
            fontWeight: "600",
          }}
          onPress={() => setDonationModalVisible(true)}
        >
          {t("agri_coltivio.donate_link")}
        </Body>
      )}
      <H3 style={{ marginTop: theme.spacing.l }}>
        {t("membership.community_heading")}
      </H3>
      <Body style={{ marginTop: theme.spacing.m }}>
        {t("agri_coltivio.community_text")}
      </Body>
      <Body style={{ marginTop: theme.spacing.s }}>
        {t("agri_coltivio.community_text_2")}
      </Body>
      <Body
        style={{
          marginTop: theme.spacing.l,
          color: theme.colors.primary,
          textDecorationLine: "underline",
        }}
        onPress={openMoreInfoUrl}
      >
        {t("agri_coltivio.learn_more")}
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
