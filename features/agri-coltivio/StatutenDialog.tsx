import { Button } from "@/components/buttons/Button";
import { Checkbox } from "@/components/inputs/Checkbox";
import { Switch } from "@/components/inputs/Switch";
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
import { STATUTEN_TEXT } from "./statuten-text";

type StatutenDialogProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (autoRenew: boolean) => void;
  // Hidden for a pure trial start, where there's no payment yet to choose a method for
  showAutoRenewal?: boolean;
};

export function StatutenDialog({
  visible,
  onClose,
  onConfirm,
  showAutoRenewal = true,
}: StatutenDialogProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [accepted, setAccepted] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);

  function handleClose() {
    setAccepted(false);
    setAutoRenew(true);
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

        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing.m,
            paddingBottom: theme.spacing.xxl,
          }}
        >
          <H2>{t("membership.statuten.title")}</H2>

          <View
            style={{
              marginTop: theme.spacing.m,
              maxHeight: 260,
              borderWidth: 1,
              borderColor: theme.colors.gray3,
              borderRadius: theme.radii.m,
              padding: theme.spacing.m,
            }}
          >
            <ScrollView nestedScrollEnabled>
              <Body style={{ fontSize: 14, color: theme.colors.gray1 }}>
                {STATUTEN_TEXT}
              </Body>
            </ScrollView>
          </View>

          <TouchableOpacity
            onPress={() => setAccepted((prev) => !prev)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.s,
              marginTop: theme.spacing.m,
            }}
          >
            <Checkbox
              checked={accepted}
              onPress={() => setAccepted((prev) => !prev)}
            />
            <Body style={{ flex: 1 }}>
              {t("membership.statuten.accept_label")}
            </Body>
          </TouchableOpacity>

          {showAutoRenewal && (
            <View style={{ marginTop: theme.spacing.l }}>
              <Switch
                label={t("membership.statuten.auto_renewal_label")}
                value={autoRenew}
                onChange={(e) => setAutoRenew(e.nativeEvent.value)}
              />
              <Body
                style={{
                  marginTop: theme.spacing.xs,
                  fontSize: 13,
                  color: theme.colors.gray1,
                }}
              >
                {t("membership.statuten.auto_renewal_note")}
              </Body>
            </View>
          )}
        </ScrollView>

        <View style={{ padding: theme.spacing.m }}>
          <Button
            title={t("membership.statuten.confirm_button")}
            disabled={!accepted}
            onPress={() => {
              const confirmedAutoRenew = autoRenew;
              handleClose();
              onConfirm(confirmedAutoRenew);
            }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
