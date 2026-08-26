import { Button } from "@/components/buttons/Button";
import { Chip } from "@/components/chips/Chip";
import { NumberInput } from "@/components/inputs/NumberInput";
import { Body, H2 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { useDonationCheckoutMutation } from "./agri-coltivio.hooks";

const PRESET_DONATION_AMOUNTS = [10, 25, 50, 100];

type DonationModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function DonationModal({ visible, onClose }: DonationModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const donationMutation = useDonationCheckoutMutation();

  const [selectedPreset, setSelectedPreset] = useState<number | null>(25);
  const [customAmount, setCustomAmount] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const donationAmount =
    customAmount !== "" ? parseInt(customAmount, 10) : selectedPreset;

  function handleClose() {
    setShowThankYou(false);
    setSelectedPreset(25);
    setCustomAmount("");
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingHorizontal: theme.spacing.m,
            paddingTop: theme.spacing.s,
          }}
        >
          <TouchableOpacity onPress={handleClose} hitSlop={12}>
            <Ionicons name="close" size={26} color={theme.colors.gray1} />
          </TouchableOpacity>
        </View>

        {showThankYou ? (
          <View style={{ flex: 1, padding: theme.spacing.m }}>
            <H2>{t("agri_coltivio.donate_thank_you_title")}</H2>
            <Body style={{ marginTop: theme.spacing.m }}>
              {t("agri_coltivio.donate_thank_you_body")}
            </Body>
            <View style={{ marginTop: "auto" }}>
              <Button
                title={t("agri_coltivio.donate_thank_you_close")}
                onPress={handleClose}
              />
            </View>
          </View>
        ) : (
          <>
            <ScrollView
              contentContainerStyle={{
                padding: theme.spacing.m,
                paddingBottom: theme.spacing.xxl,
              }}
            >
              <H2>{t("agri_coltivio.donate_title")}</H2>
              <Body style={{ marginTop: theme.spacing.m }}>
                {t("agri_coltivio.donate_sub")}
              </Body>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: theme.spacing.xs,
                  marginTop: theme.spacing.l,
                }}
              >
                {PRESET_DONATION_AMOUNTS.map((amount) => (
                  <Chip
                    key={amount}
                    label={`CHF ${amount}`}
                    active={selectedPreset === amount && customAmount === ""}
                    onPress={() => {
                      setSelectedPreset(amount);
                      setCustomAmount("");
                    }}
                  />
                ))}
              </View>
              <NumberInput
                hideLabel
                style={{ marginTop: theme.spacing.s }}
                placeholder={t("agri_coltivio.donate_custom_amount_placeholder")}
                value={customAmount}
                onChangeText={(value) => {
                  setCustomAmount(value);
                  setSelectedPreset(null);
                }}
              />
            </ScrollView>

            <View style={{ padding: theme.spacing.m }}>
              <Button
                type="accent"
                title={t("agri_coltivio.donate_cta")}
                disabled={!donationAmount || donationAmount < 1}
                loading={donationMutation.isPending}
                onPress={() =>
                  donationMutation.mutate(donationAmount!, {
                    onSuccess: (succeeded) => {
                      if (succeeded) {
                        setShowThankYou(true);
                      } else {
                        handleClose();
                      }
                    },
                  })
                }
              />
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}
