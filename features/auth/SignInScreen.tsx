import { useSession } from "@/auth/SessionProvider";
import { Button } from "@/components/buttons/Button";
import { TextInput } from "@/components/inputs/TextInput";
import { Text } from "@/components/text/Text";
import { ScrollView } from "@/components/views/ScrollView";
import { SignInScreenProps } from "@/features/auth/navigation/auth-routes";
import { BrandBackground } from "@/features/splash/BrandBackground";
import { BrandLockup } from "@/features/splash/BrandLockup";
import {
  BRAND_ACCENT,
  BRAND_OFF_WHITE,
  LOCKUP_WIDTH,
  w,
} from "@/features/splash/brand";
import { supabase } from "@/supabase/supabase";
import { Body } from "@/theme/Typography";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";

const TAGLINE_SIZE = w(41.5);

export function SignInScreen({ navigation }: SignInScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { setSession } = useSession();
  const [fetching, setFetching] = useState(false);
  const { width } = useWindowDimensions();

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
    // Same ground as the splash, so the app does not change its look between
    // the loading screen and the first thing a signed-out user sees.
    <BrandBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + theme.spacing.xl,
        }}
        keyboardAware
        keyboardBottomOffset={70}
      >
        <View
          style={{
            alignItems: "center",
            paddingTop: insets.top + theme.spacing.xxl,
            paddingBottom: theme.spacing.xl,
          }}
        >
          <BrandLockup width={width * LOCKUP_WIDTH} />
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{
              color: BRAND_ACCENT,
              fontSize: width * TAGLINE_SIZE,
              letterSpacing: width * TAGLINE_SIZE * -0.03,
              includeFontPadding: false,
              maxWidth: "80%",
              marginTop: theme.spacing.m,
            }}
          >
            {t("splash.tagline")}
          </Text>
        </View>
        <View style={{ padding: theme.spacing.m }}>
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

          {/* Sits directly under the password field and right aligned, so it
              reads as belonging to that field rather than to the form. */}
          <Text
            style={{
              alignSelf: "flex-end",
              marginTop: theme.spacing.xs,
              fontSize: 15,
              color: BRAND_ACCENT,
              fontWeight: "600",
            }}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            {t("buttons.forgot_password")}
          </Text>

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

          <Button
            style={{ marginTop: theme.spacing.l }}
            title="Anmelden"
            type="secondary"
            disabled={fetching}
            loading={fetching}
            onPress={onSignIn}
          />

          {/* One line, centred under the button. French is the longest at
              "Vous n'avez pas encore de compte ? S'inscrire", hence the small
              size plus shrink-to-fit rather than a wrap. */}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{
              marginTop: theme.spacing.m,
              textAlign: "center",
              fontSize: 14,
              color: BRAND_OFF_WHITE,
            }}
          >
            {t("signin.signup_text")}{" "}
            <Text
              style={{ color: BRAND_ACCENT, fontWeight: "600" }}
              onPress={() => navigation.navigate("SignUp")}
            >
              {t("buttons.signup")}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </BrandBackground>
  );
}
