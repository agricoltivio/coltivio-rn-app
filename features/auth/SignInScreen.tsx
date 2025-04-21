import { NativeAppleSignInButton } from "@/auth/NativeAppleSignInButton";
import { useSession } from "@/auth/SessionProvider";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ScrollView } from "@/components/views/ScrollView";
import { SignInScreenProps } from "@/features/auth/navigation/auth-routes";
import { supabase } from "@/supabase/supabase";
import { Body, H2 } from "@/theme/Typography";
import { Image } from "expo-image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";

export function SignInScreen({ navigation }: SignInScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { setSession } = useSession();
  const [fetching, setFetching] = useState(false);

  async function onSignIn() {
    setFetching(true);
    Keyboard.dismiss();
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (
        error.code === "invalid_credentials" ||
        error.code === "validation_failed"
      ) {
        setError("Email oder Passwort falsch");
      } else {
        setError("Unerwarteter Fehler");
      }
    } else {
      setSession(data.session);
    }
    setFetching(false);
  }
  const theme = useTheme();
  return (
    <ContentView
      style={{ paddingHorizontal: 0, paddingTop: 0 }}
      footerComponent={
        <View
          style={{
            padding: theme.spacing.m,
            paddingBottom: insets.bottom + theme.spacing.m,
            backgroundColor: "#1f1f21",
          }}
        >
          <NativeAppleSignInButton />
        </View>
      }
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
            <Text
              style={{
                color: theme.colors.accent,
                fontSize: 18,
                marginTop: theme.spacing.m,
                marginLeft: theme.spacing.s,
              }}
            >
              {t("signin.signup_text")}{" "}
              <Text
                style={{ fontSize: 18, color: theme.colors.secondary }}
                onPress={() => navigation.navigate("SignUp")}
              >
                {t("buttons.signup")}
              </Text>
            </Text>
          </View>
          <Text
            style={{
              marginTop: theme.spacing.s,
              marginLeft: theme.spacing.s,
              fontSize: 18,
              color: theme.colors.secondary,
            }}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            {t("buttons.forgot_password")}
          </Text>
          <View
            style={{ marginTop: theme.spacing.l, alignItems: "center" }}
          ></View>
        </View>
      </ScrollView>
    </ContentView>
  );
}
