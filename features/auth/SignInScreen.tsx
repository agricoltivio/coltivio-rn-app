import { useSession } from "@/auth/SessionProvider";
import { Button } from "@/components/buttons/Button";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ScrollView } from "@/components/views/ScrollView";
import { SignInScreenProps } from "@/features/auth/navigation/auth-routes";
import { useApi } from "@/api/api";
import { Body, H2 } from "@/theme/Typography";
import { Image } from "expo-image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, View } from "react-native";
import { useTheme } from "styled-components/native";

export function SignInScreen(_props: SignInScreenProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { setToken } = useSession();
  const api = useApi();
  const [fetching, setFetching] = useState(false);

  async function onSignIn() {
    setFetching(true);
    Keyboard.dismiss();
    try {
      const { token } = await api.auth.login({ email, password });
      setToken(token);
    } catch {
      setError("Email oder Passwort falsch");
    }
    setFetching(false);
  }
  const theme = useTheme();
  return (
    <ContentView
      style={{
        paddingHorizontal: 0,
        paddingTop: 0,
        backgroundColor: "#1f1f21",
      }}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: "#1f1f21" }}
        keyboardAware
        keyboardBottomOffset={70}
      >
        <Image
          source={require("@/assets/images/login.jpeg")}
          style={{ height: 300, opacity: 0.9 }}
        />
        <View>
          <H2
            style={{
              color: theme.colors.accent,
              fontSize: 50,
              textAlign: "center",
            }}
          >
            Coltivio
          </H2>
        </View>
        <View
          style={{
            padding: theme.spacing.m,
            paddingTop: theme.spacing.xxl,
            flex: 1,
          }}
        >
          <View style={{ gap: theme.spacing.s }}>
            <TextInput
              label={t("forms.labels.email")}
              onChangeText={(text) => setEmail(text)}
              value={email}
              autoCapitalize={"none"}
            />
            <TextInput
              label={t("forms.labels.password")}
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={true}
              autoCapitalize={"none"}
            />
          </View>

          {error && (
            <View
              style={{
                borderRadius: 10,
                backgroundColor: theme.colors.danger,
                opacity: 0.7,
                marginTop: theme.spacing.m,
                padding: theme.spacing.s,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Body style={{ fontWeight: 800, color: "white" }}>{error}</Body>
            </View>
          )}
          <View style={{ marginTop: theme.spacing.m }}>
            <Button
              title="Anmelden"
              disabled={fetching}
              loading={fetching}
              onPress={onSignIn}
            />
          </View>
          <View
            style={{ marginTop: theme.spacing.l, alignItems: "center" }}
          ></View>
        </View>
      </ScrollView>
    </ContentView>
  );
}
