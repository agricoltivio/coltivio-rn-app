import { useSession } from "@/auth/SessionProvider";
import { Button } from "@/components/buttons/Button";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { Body, H3 } from "@/theme/Typography";
import { isMembershipActive } from "@/utils/membership";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, Modal, Pressable, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useTheme } from "styled-components/native";
import {
  useDeleteFarmMutation,
  useFarmQuery,
  useFarmsQuery,
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
  const { farms } = useFarmsQuery();
  const { membershipStatus } = useMembershipStatusQuery();
  const { clearSession } = useSession();
  // Without a farm the app falls back to onboarding, where the account can't be deleted
  const isLastFarm = farms?.count === 1;

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
    }
  }, [visible, reset]);

  const deleteFarmMutation = useDeleteFarmMutation((deletedAccount) => {
    onClose();
    if (deletedAccount) {
      clearSession();
      return;
    }
    // If other farms remain, RootStack will auto-select the sole remaining one or show the
    // farm picker — but it stays on the same main app stack either way, so "Farm" underneath
    // this dialog is still on the stack and needs to be popped explicitly.
    navigation.popTo("Home");
  });

  function onSubmit() {
    if (!isLastFarm) {
      deleteFarmMutation.mutate(false);
      return;
    }
    const message = [
      t("farm.delete_last_farm.message"),
      isMembershipActive(membershipStatus)
        ? t("users.delete_account.membership_warning")
        : null,
    ]
      .filter(Boolean)
      .join("\n\n");
    Alert.alert(t("farm.delete_last_farm.title"), message, [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("farm.delete_last_farm.farm_only"),
        onPress: () => deleteFarmMutation.mutate(false),
      },
      {
        text: t("farm.delete_last_farm.farm_and_account"),
        style: "destructive",
        onPress: () => deleteFarmMutation.mutate(true),
      },
    ]);
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
