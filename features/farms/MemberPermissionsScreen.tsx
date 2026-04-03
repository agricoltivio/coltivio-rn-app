import { ContentView } from "@/components/containers/ContentView";
import { Switch } from "@/components/inputs/Switch";
import { ScrollView } from "@/components/views/ScrollView";
import { Body, H2, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { useTheme } from "styled-components/native";
import { PermissionFeature } from "@/api/farms.api";
import {
  useDeleteMemberPermissionMutation,
  useMemberPermissionsQuery,
  useSetMemberPermissionMutation,
} from "./farms.hooks";
import { MemberPermissionsScreenProps } from "./navigation/farm-routes";

const ALL_FEATURES: PermissionFeature[] = [
  "animals",
  "field_calendar",
  "commerce",
  "tasks",
];

export function MemberPermissionsScreen({
  route,
}: MemberPermissionsScreenProps) {
  const { userId, memberName } = route.params;
  const { t } = useTranslation();
  const theme = useTheme();

  const { permissions, isLoading } = useMemberPermissionsQuery(userId);
  const setPermission = useSetMemberPermissionMutation(userId);
  const deletePermission = useDeleteMemberPermissionMutation(userId);

  // Build lookup: feature → "read" | "write". Absence = "read" (server default).
  const accessMap = new Map<PermissionFeature, "read" | "write">(
    permissions.map((p) => [p.feature, p.access as "read" | "write"]),
  );

  function onToggleWrite(feature: PermissionFeature, enabled: boolean) {
    if (enabled) {
      setPermission.mutate({ feature, access: "write" });
    } else {
      deletePermission.mutate(feature);
    }
  }

  const isPending =
    setPermission.isPending || deletePermission.isPending;

  return (
    <ContentView>
      <ScrollView
        headerTitleOnScroll={t("farm.member_permissions")}
        showHeaderOnScroll
      >
        <H2>{t("farm.member_permissions")}</H2>
        <H3 style={{ marginTop: theme.spacing.xs, fontWeight: "400" }}>
          {memberName}
        </H3>
        <Body style={{ marginTop: theme.spacing.s, color: theme.colors.gray1 }}>
          {t("farm.member_permissions_description")}
        </Body>

        {isLoading ? (
          <ActivityIndicator
            style={{ marginTop: theme.spacing.xl }}
            color={theme.colors.primary}
          />
        ) : (
          <View
            style={{
              marginTop: theme.spacing.l,
              backgroundColor: theme.colors.white,
              borderRadius: theme.radii.m,
              overflow: "hidden",
            }}
          >
            {ALL_FEATURES.map((feature, index) => {
              const isWrite = accessMap.get(feature) === "write";
              return (
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
                    value={isWrite}
                    onChange={(e) => onToggleWrite(feature, e.nativeEvent.value)}
                    disabled={isPending}
                  />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ContentView>
  );
}
