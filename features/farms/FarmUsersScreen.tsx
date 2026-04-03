import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { Button } from "@/components/buttons/Button";
import { Chip } from "@/components/chips/Chip";
import { TextInput } from "@/components/inputs/TextInput";
import { CreateInviteInput, FarmInvite, PermissionFeature } from "@/api/farms.api";
import { FarmUser } from "@/api/user.api";
import { Body, H2, H3 } from "@/theme/Typography";
import { FarmUsersScreenProps } from "./navigation/farm-routes";
import {
  useCreateInviteMutation,
  useFarmInvitesQuery,
  useMembership,
  useRemoveMemberMutation,
  useRevokeInviteMutation,
  useUpdateMemberRoleMutation,
} from "./farms.hooks";
import { useFarmUsersQuery } from "@/features/tasks/tasks.hooks";
import { useUserQuery } from "@/features/user/users.hooks";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { Select } from "@/components/select/Select";
import { Checkbox } from "@/components/inputs/Checkbox";

const ALL_FEATURES: PermissionFeature[] = [
  "animals",
  "field_calendar",
  "commerce",
  "tasks",
];

type InvitePermissionAccess = "none" | "read" | "write";

function getInviteStatus(invite: FarmInvite): "pending" | "used" | "expired" {
  if (invite.usedAt != null) return "used";
  if (
    invite.expiresAt != null &&
    new Date(invite.expiresAt as string) < new Date()
  )
    return "expired";
  return "pending";
}

export function FarmUsersScreen({ navigation }: FarmUsersScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"owner" | "member">("member");
  // Map of feature → access for the invite form (default "none" = unchecked)
  const [invitePermissions, setInvitePermissions] = useState<
    Map<PermissionFeature, InvitePermissionAccess>
  >(new Map());

  const { user: currentUser } = useUserQuery();
  const isOwner = currentUser?.farmRole === "owner";
  const { isActive } = useMembership();

  const { users: members = [] } = useFarmUsersQuery();
  const { data: invites = [] } = useFarmInvitesQuery();

  function resetInviteForm() {
    setEmail("");
    setInviteRole("member");
    setInvitePermissions(new Map());
  }

  const createInviteMutation = useCreateInviteMutation(resetInviteForm);
  const revokeInviteMutation = useRevokeInviteMutation();
  const removeMemberMutation = useRemoveMemberMutation();
  const updateRoleMutation = useUpdateMemberRoleMutation();

  function onInvite() {
    if (!email.trim()) return;
    const input: CreateInviteInput = {
      email: email.trim(),
      role: inviteRole,
      // For member invites, always send all features explicitly; default is "none"
      permissions:
        inviteRole === "member"
          ? ALL_FEATURES.map((feature) => ({
              feature,
              access: invitePermissions.get(feature) ?? "none",
            }))
          : undefined,
    };
    createInviteMutation.mutate(input);
  }

  function onToggleInvitePermission(
    feature: PermissionFeature,
    level: "read" | "write",
  ) {
    setInvitePermissions((prev) => {
      const next = new Map(prev);
      const current = next.get(feature) ?? "none";
      // Selecting the same level again clears it back to "none"
      next.set(feature, current === level ? "none" : level);
      return next;
    });
  }

  function onRemoveMember(member: FarmUser) {
    Alert.alert(t("farm.remove_member"), member.fullName ?? member.email, [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("buttons.delete"),
        style: "destructive",
        onPress: () => removeMemberMutation.mutate(member.id),
      },
    ]);
  }

  function onToggleRole(member: FarmUser) {
    const newRole = member.farmRole === "owner" ? "member" : "owner";
    const label =
      newRole === "owner"
        ? t("farm.promote_to_owner")
        : t("farm.demote_to_member");
    Alert.alert(label, member.fullName ?? member.email, [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("buttons.confirm"),
        onPress: () =>
          updateRoleMutation.mutate({ userId: member.id, role: newRole }),
      },
    ]);
  }

  const roleColors: Record<"owner" | "member", { bg: string; text: string }> = {
    owner: { bg: theme.colors.primary + "22", text: theme.colors.primary },
    member: { bg: theme.colors.gray3, text: theme.colors.gray1 },
  };

  const roleLabels: Record<"owner" | "member", string> = {
    owner: t("farm.role_owner"),
    member: t("farm.role_member"),
  };

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
      <ScrollView headerTitleOnScroll={t("farm.users")} showHeaderOnScroll>
        <H2>{t("farm.users")}</H2>

        {/* Current members */}
        {members.length > 0 && (
          <View style={{ marginTop: theme.spacing.l }}>
            <H3 style={{ marginBottom: theme.spacing.m }}>
              {t("farm.members")}
            </H3>
            {members.map((member) => {
              const role = member.farmRole ?? "member";
              const roleColor =
                roleColors[role === "owner" ? "owner" : "member"];
              const isSelf = member.id === currentUser?.id;
              return (
                <MemberRow key={member.id}>
                  <View style={{ flex: 1, gap: theme.spacing.xs }}>
                    <EmailText>{member.fullName ?? member.email}</EmailText>
                    <Chip
                      label={roleLabels[role === "owner" ? "owner" : "member"]}
                      bgColor={roleColor.bg}
                      textColor={roleColor.text}
                    />
                  </View>
                  {isOwner && !isSelf && (
                    <View
                      style={{ flexDirection: "row", gap: theme.spacing.s }}
                    >
                      {role === "member" && (
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("MemberPermissions", {
                              userId: member.id,
                              memberName: member.fullName ?? member.email,
                            })
                          }
                          hitSlop={8}
                        >
                          <Ionicons
                            name="settings-outline"
                            size={22}
                            color={theme.colors.gray1}
                          />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => onToggleRole(member)}
                        disabled={updateRoleMutation.isPending}
                        hitSlop={8}
                      >
                        <Ionicons
                          name={
                            role === "owner"
                              ? "arrow-down-circle-outline"
                              : "arrow-up-circle-outline"
                          }
                          size={22}
                          color={theme.colors.primary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => onRemoveMember(member)}
                        disabled={removeMemberMutation.isPending}
                        hitSlop={8}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={22}
                          color={theme.colors.danger}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </MemberRow>
              );
            })}
          </View>
        )}

        {/* Pending / past invites — only visible to owners with active membership */}
        {isOwner && isActive && invites.length > 0 && (
          <View style={{ marginTop: theme.spacing.l }}>
            <H3 style={{ marginBottom: theme.spacing.m }}>
              {t("farm.invite_user")}
            </H3>
            {invites.map((invite) => {
              const status = getInviteStatus(invite);
              const colors = statusColors[status];
              return (
                <MemberRow key={invite.id}>
                  <View style={{ flex: 1, gap: theme.spacing.xs }}>
                    <EmailText>{invite.email}</EmailText>
                    <Chip
                      label={statusLabels[status]}
                      bgColor={colors.bg}
                      textColor={colors.text}
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
                </MemberRow>
              );
            })}
          </View>
        )}

        {/* Invite new user — only for owners with active membership */}
        {isOwner && isActive && (
          <View style={{ marginTop: theme.spacing.xl }}>
            <H3 style={{ marginBottom: theme.spacing.m }}>
              {t("farm.invite_user")}
            </H3>
            <TextInput
              label={t("farm.invite_email_label")}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
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

            {/* Permission checkboxes — only relevant for member invites */}
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
                <View
                  style={{
                    backgroundColor: theme.colors.white,
                    borderRadius: theme.radii.m,
                    overflow: "hidden",
                  }}
                >
                  {/* Header row */}
                  <View
                    style={{
                      flexDirection: "row",
                      paddingHorizontal: theme.spacing.m,
                      paddingVertical: theme.spacing.s,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.gray4,
                    }}
                  >
                    <Body style={{ flex: 1, color: theme.colors.gray1 }} />
                    <Body
                      style={{
                        width: 56,
                        textAlign: "center",
                        color: theme.colors.gray1,
                        fontSize: 13,
                      }}
                    >
                      {t("farm.permission_read")}
                    </Body>
                    <Body
                      style={{
                        width: 56,
                        textAlign: "center",
                        color: theme.colors.gray1,
                        fontSize: 13,
                      }}
                    >
                      {t("farm.permission_write")}
                    </Body>
                  </View>
                  {ALL_FEATURES.map((feature, index) => {
                    const access = invitePermissions.get(feature) ?? "none";
                    return (
                      <View
                        key={feature}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingHorizontal: theme.spacing.m,
                          paddingVertical: theme.spacing.s,
                          borderBottomWidth:
                            index < ALL_FEATURES.length - 1 ? 1 : 0,
                          borderBottomColor: theme.colors.gray4,
                        }}
                      >
                        <Body style={{ flex: 1 }}>
                          {t(
                            `farm.permission_feature_${feature}` as Parameters<
                              typeof t
                            >[0],
                          )}
                        </Body>
                        <View
                          style={{ width: 56, alignItems: "center" }}
                        >
                          <Checkbox
                            checked={access === "read"}
                            onPress={() =>
                              onToggleInvitePermission(feature, "read")
                            }
                          />
                        </View>
                        <View
                          style={{ width: 56, alignItems: "center" }}
                        >
                          <Checkbox
                            checked={access === "write"}
                            onPress={() =>
                              onToggleInvitePermission(feature, "write")
                            }
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
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
          </View>
        )}
      </ScrollView>
    </ContentView>
  );
}

const MemberRow = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.m}px;
  border-radius: ${({ theme }) => theme.radii.m}px;
  margin-bottom: ${({ theme }) => theme.spacing.s}px;
`;

const EmailText = styled.Text`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.gray1};
  font-weight: 500;
`;
