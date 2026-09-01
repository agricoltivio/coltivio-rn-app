import { useSession } from "@/auth/SessionProvider";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { Body, H3, Label } from "@/theme/Typography";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, Switch, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useTheme } from "styled-components/native";
import {
  useDeleteFarmMutation,
  useFarmQuery,
  useMembershipStatusQuery,
} from "./farms.hooks";
import { FarmScreenProps } from "./navigation/farm-routes";

type DeleteFarmDialogProps = {
  visible: boolean;
  onClose: () => void;
  navigation: FarmScreenProps["navigation"];
};

export function DeleteFarmDialog({
  visible,
  onClose,
  navigation,
}: DeleteFarmDialogProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { farm } = useFarmQuery();
  const { membershipStatus } = useMembershipStatusQuery();
  const { clearSession } = useSession();
  const [deleteAccount, setDeleteAccount] = useState(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<{ name: string }>();

  // Reset to a clean slate every time the dialog is (re)opened, not just on unmount.
  useEffect(() => {
    if (visible) {
      reset();
      setDeleteAccount(false);
    }
  }, [visible, reset]);

  const now = new Date();
  const membershipPeriodEnd = membershipStatus?.lastPeriodEnd
    ? new Date(membershipStatus.lastPeriodEnd as string)
    : null;
  const membershipTrialEnd = membershipStatus?.trialEnd
    ? new Date(membershipStatus.trialEnd as string)
    : null;
  const hasMembershipActive =
    (membershipPeriodEnd !== null && membershipPeriodEnd > now) ||
    (membershipTrialEnd !== null && membershipTrialEnd > now);

  const deleteFarmMutation = useDeleteFarmMutation(() => {
    onClose();
    if (deleteAccount) {
      clearSession();
      return;
    }
    // If other farms remain, RootStack will auto-select the sole remaining one or show the
    // farm picker — but it stays on the same main app stack either way, so "Farm" underneath
    // this dialog is still on the stack and needs to be popped explicitly.
    navigation.popTo("Home");
  });

  function onSubmit(data: { name: string }) {
    deleteFarmMutation.mutate(deleteAccount);
  }

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
        <KeyboardAvoidingView behavior="padding" style={{ width: "100%" }}>
          <Pressable
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: 16,
              padding: theme.spacing.l,
              width: "100%",
              maxWidth: 400,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <H3 style={{ color: theme.colors.danger }}>
              {t("farm.delete_farm")}
            </H3>
            <Body style={{ marginTop: theme.spacing.s }}>
              {t("common.all_entries_will_be_deleted")}
            </Body>

            <View style={{ marginTop: theme.spacing.l }}>
              <RHTextInput
                name="name"
                placeholder={farm?.name}
                control={control}
                label={t("forms.labels.farm_name")}
                autoCapitalize="none"
                autoCorrect={false}
                rules={{
                  required: {
                    value: true,
                    message: t("forms.validation.required"),
                  },
                  validate: (value) =>
                    value === farm?.name
                      ? undefined
                      : t("forms.validation.name_mismatch"),
                }}
                error={errors.name?.message}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: theme.spacing.l,
              }}
            >
              <Label style={{ flex: 1 }}>{t("farm.delete_account")}</Label>
              <Switch value={deleteAccount} onValueChange={setDeleteAccount} />
            </View>

            {deleteAccount && hasMembershipActive ? (
              <Card
                style={{
                  backgroundColor: theme.colors.warning,
                  marginTop: theme.spacing.m,
                }}
              >
                <Body style={{ color: theme.colors.black }}>
                  {t("membership.delete_account_warning")}
                </Body>
              </Card>
            ) : null}

            <View
              style={{
                flexDirection: "row",
                gap: theme.spacing.m,
                marginTop: theme.spacing.l,
              }}
            >
              <Button
                style={{ flex: 1 }}
                type="accent"
                title={t("buttons.cancel")}
                onPress={onClose}
                disabled={deleteFarmMutation.isPending}
              />
              <Button
                style={{ flex: 1 }}
                type="danger"
                title={t("buttons.delete")}
                onPress={handleSubmit(onSubmit)}
                loading={deleteFarmMutation.isPending}
                disabled={!isDirty || deleteFarmMutation.isPending}
              />
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
