import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { FarmScreenProps } from "./navigation/farm-routes";
import { useTheme } from "styled-components/native";
import { H2, Body, Subtitle, Caption1 } from "@/theme/Typography";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { Button } from "@/components/buttons/Button";
import { useTranslation } from "react-i18next";
import { Alert, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatCard } from "@/components/card/StatCard";
import { Card } from "@/components/card/Card";
import { DonutChartCard } from "@/components/charts/DonutChartCard";
import {
  animalTypeColor,
  hslToHex,
  getYearColor,
} from "@/components/charts/chartColors";
import { round } from "@/utils/math";
import { FarmUser } from "@/api/user.api";
import {
  useFarmQuery,
  useFarmStatsQuery,
  useLeaveFarmMutation,
  useRemoveMemberMutation,
} from "./farms.hooks";
import { useFarmUsersQuery } from "@/features/tasks/tasks.hooks";
import { useUserQuery } from "@/features/user/users.hooks";
import { useState } from "react";
import { FarmSwitcherSheet } from "./FarmSwitcherSheet";
import { DeleteFarmDialog } from "./DeleteFarmDialog";
import { useActiveFarm } from "./ActiveFarmContext";

export function FarmScreen({ navigation }: FarmScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { farm } = useFarmQuery();
  const { farmStats } = useFarmStatsQuery();
  const { users } = useFarmUsersQuery();
  const { user: currentUser } = useUserQuery();
  const isOwner = currentUser?.farmRole === "owner";
  const isOnlyMember = users.length === 1;
  const { clearActiveFarmId } = useActiveFarm();
  const [switcherVisible, setSwitcherVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const removeMemberMutation = useRemoveMemberMutation();
  const leaveFarmMutation = useLeaveFarmMutation(() => {
    clearActiveFarmId();
    navigation.popTo("Home");
  });

  function onRemoveMember(user: FarmUser) {
    Alert.alert(t("farm.remove_member"), user.fullName ?? user.email, [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("buttons.delete"),
        style: "destructive",
        onPress: () => removeMemberMutation.mutate(user.id),
      },
    ]);
  }

  function onLeaveFarm() {
    Alert.alert(t("farm.leave_farm"), t("farm.leave_farm_description"), [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("farm.leave_farm"),
        style: "destructive",
        onPress: () => leaveFarmMutation.mutate(),
      },
    ]);
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            type="primary"
            title={t("farm.switcher.title")}
            onPress={() => setSwitcherVisible(true)}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView headerTitleOnScroll={farm?.name} showHeaderOnScroll>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <H2>{farm?.name}</H2>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditFarm")}
            hitSlop={10}
          >
            <Ionicons
              name="create-outline"
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
        {farm?.address ? (
          <Subtitle style={{ color: theme.colors.gray2 }}>
            {farm.address}
          </Subtitle>
        ) : null}

        <View style={{ marginTop: theme.spacing.l, gap: theme.spacing.m }}>
          {farmStats && (
            <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
              <StatCard
                label={t("forms.labels.area_hectares")}
                value={`${round(farmStats.plots.totalAreaM2 / 10000, 1)} ${t("units.short.ha")}`}
              />
              <StatCard
                label={t("plots.plots")}
                value={farmStats.plots.total}
              />
            </View>
          )}

          <Card>
            <Card.Title>{t("farm.users")}</Card.Title>
            <Card.Content style={{ gap: theme.spacing.s }}>
              {users.map((user) => {
                const role = user.farmRole === "owner" ? "owner" : "member";
                const isSelf = user.id === currentUser?.id;
                return (
                  <View
                    key={user.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: theme.spacing.s,
                    }}
                  >
                    <View style={{ width: 20, alignItems: "center" }}>
                      {role === "owner" ? (
                        <MaterialCommunityIcons
                          name="crown"
                          size={18}
                          color={theme.colors.primary}
                        />
                      ) : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Body>{user.fullName ?? user.email}</Body>
                      {user.fullName ? <Caption1>{user.email}</Caption1> : null}
                    </View>
                    {isOwner && !isSelf ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: theme.spacing.m,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => onRemoveMember(user)}
                          disabled={removeMemberMutation.isPending}
                          hitSlop={10}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={24}
                            color={theme.colors.danger}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("MemberDetail", {
                              userId: user.id,
                              memberName: user.fullName ?? user.email,
                            })
                          }
                          hitSlop={10}
                        >
                          <Ionicons
                            name="settings-outline"
                            size={24}
                            color={theme.colors.gray1}
                          />
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </Card.Content>
            {isOwner && (
              <View style={{ marginTop: theme.spacing.m }}>
                <Button
                  type="accent"
                  title={t("farm.invite_user")}
                  onPress={() => navigation.navigate("InviteUser")}
                />
              </View>
            )}
          </Card>

          {farmStats && (
            <>
              <DonutChartCard
                title={t("animals.charts.animals_by_type")}
                data={farmStats.animals.byType.map(({ type, count }) => ({
                  value: count,
                  color: hslToHex(animalTypeColor(type)),
                  label: String(count),
                }))}
                legendItems={farmStats.animals.byType.map(
                  ({ type, count }) => ({
                    color: hslToHex(animalTypeColor(type)),
                    label: `${t(`animals.animal_types.${type}`)} (${count})`,
                  }),
                )}
                emptyMessage={t("animals.charts.no_data")}
              />

              <DonutChartCard
                title={t("farm.charts.crops_by_area")}
                data={farmStats.cropRotations.active.map((crop, index) => ({
                  value: crop.totalAreaM2,
                  color: getYearColor(theme, index),
                  label: crop.cropName,
                }))}
                legendItems={farmStats.cropRotations.active.map(
                  (crop, index) => ({
                    color: getYearColor(theme, index),
                    label: `${crop.cropName} (${round(crop.totalAreaM2 / 10000, 1)} ${t("units.short.ha")})`,
                  }),
                )}
                emptyMessage={t("farm.charts.no_crops")}
              />
            </>
          )}

          <Card style={{ borderWidth: 1, borderColor: theme.colors.danger }}>
            <Card.Title style={{ color: theme.colors.danger }}>
              {t("farm.danger_zone")}
            </Card.Title>
            <Card.Content style={{ gap: theme.spacing.m }}>
              <View style={{ gap: theme.spacing.m }}>
                <Subtitle>{t("farm.leave_farm")}</Subtitle>
                <Body style={{ color: theme.colors.gray2 }}>
                  {t("farm.leave_farm_description")}
                </Body>
                {isOnlyMember ? (
                  <Caption1>{t("farm.leave_farm_only_member_hint")}</Caption1>
                ) : (
                  <Button
                    type="dangerGhost"
                    title={t("farm.leave_farm")}
                    onPress={onLeaveFarm}
                    loading={leaveFarmMutation.isPending}
                    disabled={leaveFarmMutation.isPending}
                  />
                )}
              </View>

              {isOwner && (
                <View
                  style={{
                    gap: theme.spacing.m,
                    marginTop: theme.spacing.s,
                    paddingTop: theme.spacing.m,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.gray4,
                  }}
                >
                  <Subtitle>{t("farm.delete_farm")}</Subtitle>
                  <Body style={{ color: theme.colors.gray2 }}>
                    {t("farm.danger_zone_description")}
                  </Body>
                  <Button
                    type="danger"
                    title={t("farm.delete_farm")}
                    onPress={() => setDeleteDialogVisible(true)}
                  />
                </View>
              )}
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
      <FarmSwitcherSheet
        visible={switcherVisible}
        onClose={() => setSwitcherVisible(false)}
        navigation={navigation}
      />
      <DeleteFarmDialog
        visible={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(false)}
        navigation={navigation}
      />
    </ContentView>
  );
}
