import { IonIconButton } from "@/components/buttons/IconButton";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { usePermissions } from "@/features/user/users.hooks";
import { H2, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate, parseDateOnly } from "@/utils/date";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  ScrollView as RNScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { useHerdsQuery } from "./herds.hooks";
import { ParasiteChecksScreenProps } from "./navigation/animals-routes";
import { useParasiteChecksQuery } from "./parasite-checks.hooks";

export function ParasiteChecksScreen({
  navigation,
}: ParasiteChecksScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const [selectedHerdId, setSelectedHerdId] = useState<string | undefined>();
  const { herds } = useHerdsQuery();
  const { checks: allChecks, isLoading } =
    useParasiteChecksQuery(selectedHerdId);
  // Re-checks are shown inside their base check
  const checks = allChecks.filter((check) => check.previousCheckId === null);

  return (
    <ContentView headerVisible>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <H2>{t("parasite_checks.parasite_control")}</H2>
        {canWrite("animals") && (
          <IonIconButton
            icon="add-outline"
            type="accent"
            iconSize={22}
            color={theme.colors.primary}
            onPress={() => navigation.navigate("ParasiteCheckForm", {})}
          />
        )}
      </View>

      {/* Herd filter chips */}
      {herds && herds.length > 0 && (
        <RNScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: theme.spacing.m, flexGrow: 0 }}
          contentContainerStyle={{
            gap: theme.spacing.xs,
            paddingVertical: theme.spacing.xs,
          }}
        >
          <FilterChip
            label={t("parasite_checks.all_checks")}
            active={selectedHerdId === undefined}
            onPress={() => setSelectedHerdId(undefined)}
          />
          {herds.map((herd) => (
            <FilterChip
              key={herd.id}
              label={herd.name}
              active={selectedHerdId === herd.id}
              onPress={() => setSelectedHerdId(herd.id)}
            />
          ))}
        </RNScrollView>
      )}

      {selectedHerdId && (
        <TouchableOpacity
          style={{ marginTop: theme.spacing.s }}
          onPress={() =>
            navigation.navigate("HerdParasiteOverview", {
              herdId: selectedHerdId,
            })
          }
        >
          <Subtitle style={{ color: theme.colors.primary }}>
            {t("parasite_checks.show_herd_overview")}
          </Subtitle>
        </TouchableOpacity>
      )}

      <View style={{ marginTop: theme.spacing.s, flex: 1 }}>
        {!isLoading && checks.length === 0 && (
          <Subtitle>{t("parasite_checks.no_checks")}</Subtitle>
        )}
        <FlatList
          contentContainerStyle={{
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: checks.length > 0 ? theme.colors.white : undefined,
          }}
          data={checks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListItem
              style={{ paddingVertical: 5 }}
              onPress={() =>
                navigation.navigate("ParasiteCheckDetail", {
                  checkId: item.id,
                })
              }
            >
              <ListItem.Content>
                <ListItem.Title>
                  {t(`parasite_checks.methods.${item.method}`)}
                  {item.herd ? ` · ${item.herd.name}` : ""}
                </ListItem.Title>
                <ListItem.Body>
                  {[
                    formatLocalizedDate(parseDateOnly(item.date), locale),
                    item.rechecks.length > 0
                      ? t("parasite_checks.n_rechecks", {
                          count: item.rechecks.length,
                        })
                      : undefined,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </ListItem.Body>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          )}
        />
      </View>
    </ContentView>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: active ? theme.colors.primary : theme.colors.white,
        borderWidth: 1,
        borderColor: active ? theme.colors.primary : theme.colors.gray3,
      }}
    >
      <Subtitle
        style={{
          color: active ? theme.colors.white : theme.colors.gray1,
          fontSize: 14,
        }}
      >
        {label}
      </Subtitle>
    </TouchableOpacity>
  );
}
