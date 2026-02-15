import { useSession } from "@/auth/SessionProvider";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { UserAccountScreenProps } from "./navigation/user-routes";
import { Body } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useUserQuery } from "./users.hooks";

export function UserAccountScreen({ navigation }: UserAccountScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useUserQuery();
  const queryClient = useQueryClient();
  const { clearSession, authUser } = useSession();
  const usesSocialLogin = authUser?.app_metadata.provider !== "email";

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            type="secondary"
            title={t("buttons.signout")}
            onPress={() => {
              clearSession();
              queryClient.removeQueries();
            }}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView>
        <View
          style={{ alignItems: "center", marginVertical: theme.spacing.xl }}
        >
          <Ionicons
            name="person-circle-outline"
            size={100}
            color={theme.colors.primary}
          />
          <Body>
            {user?.fullName} - {user?.email}
          </Body>
        </View>
        <View style={{ flex: 1 }}>
          <View
            style={{
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: theme.colors.white,
              marginBottom: theme.spacing.m,
            }}
          >
            <ListItem
              style={{ backgroundColor: theme.colors.white }}
              onPress={() => navigation.navigate("UserSettings")}
              hideBottomDivider
            >
              <ListItem.Content>
                <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                  {t("settings.settings")}
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          </View>
          <View
            style={{
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: theme.colors.white,
            }}
          >
            <ListItem
              style={{ backgroundColor: theme.colors.white }}
              onPress={() => {
                navigation.navigate("ChangeUserName");
              }}
            >
              <ListItem.Content>
                <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                  {t("forms.labels.name")}
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
            <ListItem
              style={{ backgroundColor: theme.colors.white }}
              onPress={() => {
                navigation.navigate("ChangeEmail");
              }}
              hideBottomDivider={usesSocialLogin}
            >
              <ListItem.Content>
                <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                  {t("forms.labels.email")}
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
            {!usesSocialLogin ? (
              <ListItem
                onPress={() => {
                  navigation.navigate("ChangePassword");
                }}
                style={{ backgroundColor: theme.colors.white }}
                hideBottomDivider
              >
                <ListItem.Content>
                  <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                    {t("forms.labels.password")}
                  </ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </ContentView>
  );
}
