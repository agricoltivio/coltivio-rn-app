import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { FarmScreenProps } from "./navigation/farm-routes";
import { useTheme } from "styled-components/native";
import { H2, Body, Subtitle } from "@/theme/Typography";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { Button } from "@/components/buttons/Button";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatCard } from "@/components/card/StatCard";
import { Card } from "@/components/card/Card";
import { Chip } from "@/components/chips/Chip";
import { DonutChartCard } from "@/components/charts/DonutChartCard";
import {
  animalTypeColor,
  hslToHex,
  getYearColor,
} from "@/components/charts/chartColors";
import { round } from "@/utils/math";
import { useFarmQuery, useFarmStatsQuery } from "./farms.hooks";
import { useFarmUsersQuery } from "@/features/tasks/tasks.hooks";

export function FarmScreen({ navigation }: FarmScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { farm } = useFarmQuery();
  const { farmStats } = useFarmStatsQuery();
  const { users } = useFarmUsersQuery();

  const roleColors: Record<"owner" | "member", { bg: string; text: string }> = {
    owner: { bg: theme.colors.primary + "22", text: theme.colors.primary },
    member: { bg: theme.colors.gray3, text: theme.colors.gray1 },
  };
  const roleLabels: Record<"owner" | "member", string> = {
    owner: t("farm.role_owner"),
    member: t("farm.role_member"),
  };

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            type="danger"
            title={t("buttons.delete")}
            onPress={() => navigation.navigate("DeleteFarm")}
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
            hitSlop={8}
          >
            <Ionicons
              name="create-outline"
              size={22}
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Card.Title>{t("farm.users")}</Card.Title>
              <TouchableOpacity
                onPress={() => navigation.navigate("FarmUsers")}
                hitSlop={8}
              >
                <Ionicons
                  name="create-outline"
                  size={22}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>
            <Card.Content style={{ gap: theme.spacing.s }}>
              {users.map((user) => {
                const role = user.farmRole === "owner" ? "owner" : "member";
                return (
                  <View
                    key={user.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: theme.spacing.s,
                    }}
                  >
                    <Body style={{ flex: 1 }}>
                      {user.fullName ?? user.email}
                    </Body>
                    <Chip
                      label={roleLabels[role]}
                      bgColor={roleColors[role].bg}
                      textColor={roleColors[role].text}
                      small
                    />
                  </View>
                );
              })}
            </Card.Content>
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
        </View>
      </ScrollView>
    </ContentView>
  );
}
