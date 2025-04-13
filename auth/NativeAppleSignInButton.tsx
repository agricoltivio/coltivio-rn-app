import { supabase } from "@/supabase/supabase";
import * as AppleAuthentication from "expo-apple-authentication";
import { useSession } from "./SessionProvider";
import { Platform } from "react-native";

export function NativeAppleSignInButton() {
  const { setSession } = useSession();
  return Platform.OS === "ios" ? (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
      cornerRadius={10}
      style={{ width: "100%", height: 48 }}
      onPress={async () => {
        try {
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });
          // Sign in via Supabase Auth.
          if (credential.identityToken) {
            const {
              error,
              data: { user, session },
            } = await supabase.auth.signInWithIdToken({
              provider: "apple",
              token: credential.identityToken,
            });
            console.log(JSON.stringify({ error, user }, null, 2));
            if (!error && session) {
              // User is signed in.
              setSession(session);
            }
          } else {
            // throw new Error("No identityToken.");
            console.error("No identityToken.");
            return;
          }
        } catch (error: any) {
          if (error.code === "ERR_REQUEST_CANCELED") {
            // handle that the user canceled the sign-in flow
            console.error("apple sign in request cancelled");
          } else {
            console.error("apple sign in error", error);
            // handle other errors
          }
        }
      }}
    />
  ) : null;
}
