import { Button } from "@/components/buttons/Button";
import { Body, H2 } from "@/theme/Typography";
import { openMoreInfoUrl } from "@/utils/membership";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, ScrollView, Text } from "react-native";
import { useTheme } from "styled-components/native";

type MembershipThankYouModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function MembershipThankYouModal({
  visible,
  onClose,
}: MembershipThankYouModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: theme.spacing.l,
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: theme.colors.white,
            borderRadius: theme.radii.l,
            padding: theme.spacing.l,
            width: "100%",
            maxWidth: 400,
            maxHeight: "85%",
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <H2>{t("membership.thank_you.title")}</H2>
            <Body style={{ marginTop: theme.spacing.m }}>
              {t("membership.thank_you.subtitle")}
            </Body>
            <Body style={{ marginTop: theme.spacing.m }}>
              {t("membership.thank_you.body_pre")}
              <Text
                style={{
                  color: theme.colors.primary,
                  textDecorationLine: "underline",
                  fontWeight: "600",
                }}
                onPress={openMoreInfoUrl}
              >
                {t("membership.thank_you.body_link")}
              </Text>
              {t("membership.thank_you.body_post")}
            </Body>
            <Body style={{ marginTop: theme.spacing.s, color: theme.colors.gray1 }}>
              {t("membership.thank_you.confirmation_note")}
            </Body>
          </ScrollView>
          <Button
            style={{ marginTop: theme.spacing.l }}
            title={t("membership.thank_you.close")}
            onPress={onClose}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
