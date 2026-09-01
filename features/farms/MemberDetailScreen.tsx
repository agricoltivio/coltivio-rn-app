import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { Select } from "@/components/select/Select";
import { Switch } from "@/components/inputs/Switch";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { Body, H2, H3 } from "@/theme/Typography";
import { PermissionFeature } from "@/api/farms.api";
import {
  useDeleteMemberPermissionMutation,
  useMemberPermissionsQuery,
  useSetMemberPermissionMutation,
  useUpdateMemberRoleMutation,
} from "./farms.hooks";
import { useFarmUsersQuery } from "@/features/tasks/tasks.hooks";
import { MemberDetailScreenProps } from "./navigation/farm-routes";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useTheme } from "styled-components/native";

const ALL_FEATURES: PermissionFeature[] = [
  "animals",
  "field_calendar",
  "commerce",
  "tasks",
];

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
  const deletePermission = useDeleteMemberPermissionMutation(userId);
  const updateRoleMutation = useUpdateMemberRoleMutation();

  const accessMap = new Map<PermissionFeature, "read" | "write">(
    permissions.map((p) => [p.feature, p.access as "read" | "write"]),
  );

  // Role and permission edits are staged locally and only sent on "Save" — these two pieces
  // of state hold the pending edits, layered on top of the server data until saved.
  const [roleOverride, setRoleOverride] = useState<"owner" | "member" | null>(
    null,
  );
  const [permissionOverrides, setPermissionOverrides] = useState<
    Map<PermissionFeature, boolean>
  >(new Map());

  const role = roleOverride ?? originalRole;

  function isWriteFor(feature: PermissionFeature): boolean {
    const override = permissionOverrides.get(feature);
    if (override !== undefined) return override;
    return accessMap.get(feature) === "write";
  }

  function onToggleWrite(feature: PermissionFeature, enabled: boolean) {
    setPermissionOverrides((prev) => new Map(prev).set(feature, enabled));
  }

  function onChangeRole(value: string) {
    setRoleOverride(value === "owner" ? "owner" : "member");
  }

  const roleDirty = role !== originalRole;
  const permissionsDirty = ALL_FEATURES.some(
    (feature) => isWriteFor(feature) !== (accessMap.get(feature) === "write"),
  );
  const isSaving =
    updateRoleMutation.isPending ||
    setPermission.isPending ||
    deletePermission.isPending;

  async function onSave() {
    const pendingSaves: Promise<unknown>[] = [];
    if (roleDirty) {
      pendingSaves.push(updateRoleMutation.mutateAsync({ userId, role }));
    }
    for (const feature of ALL_FEATURES) {
      const isWrite = isWriteFor(feature);
      if (isWrite === (accessMap.get(feature) === "write")) continue;
      pendingSaves.push(
        isWrite
          ? setPermission.mutateAsync({ feature, access: "write" })
          : deletePermission.mutateAsync(feature),
      );
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
              <View
                style={{
                  backgroundColor: theme.colors.white,
                  borderRadius: theme.radii.m,
                  overflow: "hidden",
                }}
              >
                {ALL_FEATURES.map((feature, index) => (
                  <View
                    key={feature}
                    style={{
                      paddingHorizontal: theme.spacing.m,
                      paddingVertical: theme.spacing.m,
                      borderBottomWidth:
                        index < ALL_FEATURES.length - 1 ? 1 : 0,
                      borderBottomColor: theme.colors.gray4,
                    }}
                  >
                    <Switch
                      label={t(
                        `farm.permission_feature_${feature}` as Parameters<
                          typeof t
                        >[0],
                      )}
                      value={isWriteFor(feature)}
                      onChange={(e) =>
                        onToggleWrite(feature, e.nativeEvent.value)
                      }
                      disabled={isSaving}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ContentView>
  );
}
