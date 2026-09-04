import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { Select } from "@/components/select/Select";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { Body, H2, H3 } from "@/theme/Typography";
import { PermissionAccess, PermissionFeature } from "@/api/farms.api";
import {
  useMemberPermissionsQuery,
  useSetMemberPermissionMutation,
  useUpdateMemberRoleMutation,
} from "./farms.hooks";
import {
  ALL_PERMISSION_FEATURES,
  PermissionAccessTable,
} from "./PermissionAccessTable";
import { useFarmUsersQuery } from "@/features/tasks/tasks.hooks";
import { MemberDetailScreenProps } from "./navigation/farm-routes";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useTheme } from "styled-components/native";

export function MemberDetailScreen({
  route,
  navigation,
}: MemberDetailScreenProps) {
  const { userId, memberName } = route.params;
  const { t } = useTranslation();
  const theme = useTheme();

  const { users: members } = useFarmUsersQuery();
  const member = members.find((m) => m.id === userId);
  const originalRole = member?.farmRole === "owner" ? "owner" : "member";

  const { permissions, isLoading: permissionsLoading } =
    useMemberPermissionsQuery(userId);
  const setPermission = useSetMemberPermissionMutation(userId);
  const updateRoleMutation = useUpdateMemberRoleMutation();

  const accessMap = new Map<PermissionFeature, PermissionAccess>(
    permissions.map((p) => [p.feature, p.access]),
  );

  // Role and permission edits are staged locally and only sent on "Save" — these two pieces
  // of state hold the pending edits, layered on top of the server data until saved.
  const [roleOverride, setRoleOverride] = useState<"owner" | "member" | null>(
    null,
  );
  const [permissionOverrides, setPermissionOverrides] = useState<
    Map<PermissionFeature, PermissionAccess>
  >(new Map());

  const role = roleOverride ?? originalRole;

  function savedAccessFor(feature: PermissionFeature): PermissionAccess {
    return accessMap.get(feature) ?? "none";
  }

  function accessFor(feature: PermissionFeature): PermissionAccess {
    return permissionOverrides.get(feature) ?? savedAccessFor(feature);
  }

  function onChangeAccess(feature: PermissionFeature, access: PermissionAccess) {
    setPermissionOverrides((prev) => new Map(prev).set(feature, access));
  }

  function onChangeRole(value: string) {
    setRoleOverride(value === "owner" ? "owner" : "member");
  }

  const roleDirty = role !== originalRole;
  const permissionsDirty = ALL_PERMISSION_FEATURES.some(
    (feature) => accessFor(feature) !== savedAccessFor(feature),
  );
  const isSaving = updateRoleMutation.isPending || setPermission.isPending;

  async function onSave() {
    const pendingSaves: Promise<unknown>[] = [];
    if (roleDirty) {
      pendingSaves.push(updateRoleMutation.mutateAsync({ userId, role }));
    }
    for (const feature of ALL_PERMISSION_FEATURES) {
      const access = accessFor(feature);
      if (access === savedAccessFor(feature)) continue;
      pendingSaves.push(setPermission.mutateAsync({ feature, access }));
    }
    try {
      await Promise.all(pendingSaves);
      navigation.goBack();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={onSave}
            disabled={(!roleDirty && !permissionsDirty) || isSaving}
            loading={isSaving}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView headerTitleOnScroll={memberName} showHeaderOnScroll>
        <H2>{memberName}</H2>

        <View style={{ marginTop: theme.spacing.l }}>
          <Select
            label={t("farm.invite_role_label")}
            value={role}
            onChange={onChangeRole}
            disabled={isSaving}
            data={[
              { value: "member", label: t("farm.role_member") },
              { value: "owner", label: t("farm.role_owner") },
            ]}
          />
        </View>

        {role === "member" && (
          <View style={{ marginTop: theme.spacing.l }}>
            <H3 style={{ marginBottom: theme.spacing.xs }}>
              {t("farm.member_permissions")}
            </H3>
            <Body
              style={{
                color: theme.colors.gray1,
                marginBottom: theme.spacing.m,
              }}
            >
              {t("farm.member_permissions_description")}
            </Body>
            {permissionsLoading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <PermissionAccessTable
                accessFor={accessFor}
                onChange={onChangeAccess}
                disabled={isSaving}
              />
            )}
          </View>
        )}
      </ScrollView>
    </ContentView>
  );
}
