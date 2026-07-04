import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { Chip } from "@/components/chips/Chip";
import { FarmUser } from "@/api/user.api";
import { H2, H3 } from "@/theme/Typography";
import { FarmUsersScreenProps } from "./navigation/farm-routes";
import { useRemoveMemberMutation, useUpdateMemberRoleMutation } from "./farms.hooks";
import { useFarmUsersQuery } from "@/features/tasks/tasks.hooks";
import { useUserQuery } from "@/features/user/users.hooks";
import { useTranslation } from "react-i18next";
import { Alert, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

export function FarmUsersScreen({ navigation }: FarmUsersScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { user: currentUser } = useUserQuery();
  const isOwner = currentUser?.farmRole === "owner";

  const { users: members = [] } = useFarmUsersQuery();

  const removeMemberMutation = useRemoveMemberMutation();
  const updateRoleMutation = useUpdateMemberRoleMutation();

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
