import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem, ListItemContent } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { Body, H2, H3 } from "@/theme/Typography";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { DonationModal } from "@/features/agri-coltivio/DonationModal";
import { useDonationsQuery } from "@/features/agri-coltivio/agri-coltivio.hooks";

function toDateString(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) {
    return new Date(value).toLocaleDateString("de-CH");
  }
  return null;
}

export function UserDonationsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { donations } = useDonationsQuery();
  const [donationModalVisible, setDonationModalVisible] = useState(false);

  // Pending/failed donations never became real support — only show what succeeded.
  const succeededDonations = (donations ?? []).filter(
    (donation) => donation.status === "succeeded",
  );

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            type="accent"
            title={t("donations.cta")}
            onPress={() => setDonationModalVisible(true)}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={t("donations.title")}>
        <H2>{t("donations.title")}</H2>
        <Body style={{ marginTop: theme.spacing.m }}>
          {t("donations.intro")}
        </Body>

        {succeededDonations.length > 0 && (
          <>
            <H3 style={{ marginTop: theme.spacing.xl }}>
              {t("donations.history_heading")}
            </H3>
            <View
              style={{
                marginTop: theme.spacing.m,
                borderRadius: theme.radii.l,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
                marginHorizontal: theme.spacing.xs,
              }}
            >
              {succeededDonations.map((donation, index) => (
                <ListItem
                  key={donation.id}
                  hideBottomDivider={index === succeededDonations.length - 1}
                >
                  <ListItemContent>
                    <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                      {toDateString(donation.createdAt) ?? "—"}
                    </ListItem.Title>
                    <ListItem.Body style={{ paddingLeft: theme.spacing.m }}>
                      {donation.cardBrand && donation.cardLast4
                        ? `${donation.cardBrand.toUpperCase()} •••• ${donation.cardLast4}`
                        : donation.paymentMethodType === "twint"
                          ? t("donations.payment_method_twint")
                          : "—"}
                    </ListItem.Body>
                  </ListItemContent>
                  <ListItem.Body style={{ paddingRight: theme.spacing.m }}>
                    {`${donation.currency.toUpperCase()} ${(donation.amount / 100).toFixed(2)}`}
                  </ListItem.Body>
                </ListItem>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <DonationModal
        visible={donationModalVisible}
        onClose={() => setDonationModalVisible(false)}
      />
    </ContentView>
  );
}
