import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { Button } from "@/components/buttons/Button";
import { Chip } from "@/components/chips/Chip";
import { TextInput } from "@/components/inputs/TextInput";
import { Select } from "@/components/select/Select";
import { Body, H2, H3 } from "@/theme/Typography";
import {
  CreateInviteInput,
  FarmInvite,
  PermissionAccess,
  PermissionFeature,
} from "@/api/farms.api";
import {
  useCreateInviteMutation,
  useFarmInvitesQuery,
  useRevokeInviteMutation,
} from "./farms.hooks";
import {
  ALL_PERMISSION_FEATURES,
  PermissionAccessTable,
} from "./PermissionAccessTable";
import { InviteUserScreenProps } from "./navigation/farm-routes";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
import styled from "styled-components/native";

function getInviteStatus(invite: FarmInvite): "pending" | "used" | "expired" {
  if (invite.usedAt != null) return "used";
  if (
    invite.expiresAt != null &&
    new Date(invite.expiresAt as string) < new Date()
  )
    return "expired";
  return "pending";
}

export function InviteUserScreen({}: InviteUserScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"owner" | "member">("member");
  const [invitePermissions, setInvitePermissions] = useState<
    Map<PermissionFeature, PermissionAccess>
  >(new Map());

  const { data: invites = [] } = useFarmInvitesQuery();

  function resetInviteForm() {
    setEmail("");
    setInviteRole("member");
    setInvitePermissions(new Map());
  }

  const createInviteMutation = useCreateInviteMutation(resetInviteForm);
  const revokeInviteMutation = useRevokeInviteMutation();

  function onInvite() {
    if (!email.trim()) return;
    const input: CreateInviteInput = {
      email: email.trim(),
      role: inviteRole,
      // For member invites, always send all features explicitly; default is "none"
      permissions:
        inviteRole === "member"
          ? ALL_PERMISSION_FEATURES.map((feature) => ({
              feature,
              access: accessFor(feature),
            }))
          : undefined,
    };
    createInviteMutation.mutate(input);
  }

  function accessFor(feature: PermissionFeature): PermissionAccess {
    return invitePermissions.get(feature) ?? "none";
  }

  function onChangeAccess(feature: PermissionFeature, access: PermissionAccess) {
    setInvitePermissions((prev) => new Map(prev).set(feature, access));
  }

  const statusColors: Record<
    "pending" | "used" | "expired",
    { bg: string; text: string }
  > = {
    pending: { bg: theme.colors.success + "22", text: theme.colors.success },
    used: { bg: theme.colors.primary + "22", text: theme.colors.primary },
    expired: { bg: theme.colors.gray3, text: theme.colors.gray1 },
  };

  const statusLabels: Record<"pending" | "used" | "expired", string> = {
    pending: t("farm.invite_pending"),
    used: t("farm.invite_used"),
    expired: t("farm.invite_expired"),
  };

  return (
    <ContentView>
      <ScrollView
        headerTitleOnScroll={t("farm.invite_user")}
        showHeaderOnScroll
      >
        <H2>{t("farm.invite_user")}</H2>

        <View style={{ marginTop: theme.spacing.l }}>
          <TextInput
            label={t("farm.invite_email_label")}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>
        <View style={{ marginTop: theme.spacing.m }}>
          <Select
            label={t("farm.invite_role_label")}
            value={inviteRole}
            onChange={(v) => setInviteRole(v as "owner" | "member")}
            data={[
              { value: "member", label: t("farm.role_member") },
              { value: "owner", label: t("farm.role_owner") },
            ]}
          />
        </View>

        {/* Permission selection — only relevant for member invites */}
        {inviteRole === "member" && (
          <View style={{ marginTop: theme.spacing.l }}>
            <H3 style={{ marginBottom: theme.spacing.xs }}>
              {t("farm.invite_permissions_title")}
            </H3>
            <Body
              style={{
                color: theme.colors.gray1,
                marginBottom: theme.spacing.m,
              }}
            >
              {t("farm.invite_permissions_description")}
            </Body>
            <PermissionAccessTable
              accessFor={accessFor}
              onChange={onChangeAccess}
              disabled={createInviteMutation.isPending}
            />
          </View>
        )}

        <View style={{ marginTop: theme.spacing.m }}>
          <Button
            type="primary"
            title={t("farm.invite_user")}
            onPress={onInvite}
            disabled={!email.trim() || createInviteMutation.isPending}
            loading={createInviteMutation.isPending}
          />
        </View>

        {/* Pending / past invites */}
        {invites.length > 0 && (
          <View style={{ marginTop: theme.spacing.xl }}>
            <H3 style={{ marginBottom: theme.spacing.m }}>
              {t("farm.invite_user")}
            </H3>
            {invites.map((invite) => {
              const status = getInviteStatus(invite);
              const colors = statusColors[status];
              return (
                <InviteRow key={invite.id}>
                  <View style={{ flex: 1, gap: theme.spacing.xs }}>
                    <Body>{invite.email}</Body>
                    <Chip
                      label={statusLabels[status]}
                      bgColor={colors.bg}
                      textColor={colors.text}
                      small
                    />
                  </View>
                  {status === "pending" && (
                    <TouchableOpacity
                      onPress={() => revokeInviteMutation.mutate(invite.id)}
                      disabled={revokeInviteMutation.isPending}
                      hitSlop={8}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={22}
                        color={theme.colors.danger}
                      />
                    </TouchableOpacity>
                  )}
                </InviteRow>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ContentView>
  );
}

const InviteRow = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.m}px;
  border-radius: ${({ theme }) => theme.radii.m}px;
  margin-bottom: ${({ theme }) => theme.spacing.s}px;
`;
