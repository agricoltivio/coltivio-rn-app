import { Button } from "@/components/buttons/Button";
import { Body, H2 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, ScrollView } from "react-native";
import { useTheme } from "styled-components/native";

type MembershipCancelledModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function MembershipCancelledModal({
  visible,
  onClose,
}: MembershipCancelledModalProps) {
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
            <H2>{t("membership.cancel_confirmed.title")}</H2>
            <Body style={{ marginTop: theme.spacing.m }}>
              {t("membership.cancel_confirmed.body_1")}
            </Body>
            <Body style={{ marginTop: theme.spacing.m }}>
              {t("membership.cancel_confirmed.body_2")}
            </Body>
            <Body style={{ marginTop: theme.spacing.m }}>
              {t("membership.cancel_confirmed.body_3")}
            </Body>
          </ScrollView>
          <Button
            style={{ marginTop: theme.spacing.l }}
            title={t("membership.cancel_confirmed.close")}
            onPress={onClose}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
