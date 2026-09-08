import { useSession } from "@/auth/SessionProvider";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { UserAccountScreenProps } from "./navigation/user-routes";
import { hexToRgba } from "@/theme/theme";
import { Body } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useUserQuery } from "./users.hooks";

export function UserAccountScreen({ navigation }: UserAccountScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useUserQuery();
  const { clearSession, authUser } = useSession();
  const usesSocialLogin = authUser?.app_metadata.provider !== "email";

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.signout")}
            onPress={() => {
              clearSession();
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
              {user && !user.emailVerified ? (
                <View
                  style={{
                    borderRadius: theme.radii.l,
                    borderWidth: 1,
                    borderColor: theme.colors.amber,
                    backgroundColor: hexToRgba(theme.colors.amber, 0.12),
                    paddingHorizontal: theme.spacing.xs,
                    paddingVertical: theme.spacing.xxs,
                  }}
                >
                  <Body
                    style={{
                      color: theme.colors.amber,
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    {t("users.email_not_verified_short")}
                  </Body>
                </View>
              ) : null}
              <ListItem.Chevron />
            </ListItem>
            {!usesSocialLogin ? (
              <ListItem
                onPress={() => {
                  navigation.navigate("ChangePassword");
                }}
                style={{ backgroundColor: theme.colors.white }}
              >
                <ListItem.Content>
                  <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                    {t("forms.labels.password")}
                  </ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            ) : null}
            <ListItem
              onPress={() => navigation.navigate("UserMembership")}
              style={{ backgroundColor: theme.colors.white }}
              hideBottomDivider
            >
              <ListItem.Content>
                <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                  {t("farm.membership")}
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          </View>
        </View>
      </ScrollView>
    </ContentView>
  );
}
