import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { Body, H2 } from "@/theme/Typography";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";
import { useTheme } from "styled-components/native";
import { DonationModal } from "@/features/agri-coltivio/DonationModal";
import { PaymentHistoryList } from "@/features/agri-coltivio/PaymentHistoryList";
import { useDonationsQuery } from "@/features/agri-coltivio/agri-coltivio.hooks";

export function UserDonationsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { donations, isPending, isError } = useDonationsQuery();
  const [donationModalVisible, setDonationModalVisible] = useState(false);

  // Pending and failed donations are hidden on purpose: they never became real support.
  // Refunded ones stay visible with a label so the history matches the user's receipts.
  const visibleDonations = (donations ?? []).filter(
    (donation) =>
      donation.status === "succeeded" || donation.status === "refunded",
  );

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            type="accent"
            title={t("agri_coltivio.donate_cta")}
            onPress={() => setDonationModalVisible(true)}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={t("donations.title")}>
        <H2>{t("donations.title")}</H2>
        <Body style={{ marginTop: theme.spacing.m }}>
          {t("agri_coltivio.donate_sub")}
        </Body>

        {isPending ? (
          <ActivityIndicator
            style={{ marginTop: theme.spacing.xl }}
            size="large"
            color={theme.colors.primary}
          />
        ) : isError ? (
          <Body
            style={{ marginTop: theme.spacing.xl, color: theme.colors.danger }}
          >
            {t("common.unknown_error")}
          </Body>
        ) : (
          visibleDonations.length > 0 && (
            <PaymentHistoryList
              title={t("donations.history_heading")}
              payments={visibleDonations}
            />
          )
        )}
      </ScrollView>

      <DonationModal
        visible={donationModalVisible}
        onClose={() => setDonationModalVisible(false)}
      />
    </ContentView>
  );
}
