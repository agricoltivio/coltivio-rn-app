import { ContentView } from "@/components/containers/ContentView";
import { FarmSummaryScreenProps } from "@/features/onboarding/navigation/onboarding-routes";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCreateFarmMutation } from "../farms/farms.hooks";
import { useSyncMissingLocalIdsMutation } from "../plots/plots.hooks";
import { NavigationButton } from "./NavigationButton";
import { useOnboarding } from "./OnboardingContext";
import { Stepper } from "./Stepper";
import { FarmSummaryPage } from "./pages/FarmSummaryPage";
import { supabase } from "@/supabase/supabase";
import { useSession } from "@/auth/SessionProvider";
import { useUserQuery } from "../user/users.hooks";

const redirectTo = `${process.env.EXPO_PUBLIC_WEB_URL}/auth/confirm`;

export function FarmSummaryScreen({ navigation }: FarmSummaryScreenProps) {
  const { t } = useTranslation();
  const { data } = useOnboarding();
  const { authUser } = useSession();
  const { user } = useUserQuery();
  const theme = useTheme();

  const syncMissingLocalIdsMutation = useSyncMissingLocalIdsMutation(
    () => {},
    (error) => console.error(error),
  );
  const createFarmMutation = useCreateFarmMutation(() => {
    syncMissingLocalIdsMutation.mutate();
    // Only send verification email if user hasn't verified yet
    if (!user?.emailVerified) {
      setTimeout(() => {
        supabase.auth.signInWithOtp({
          email: authUser!.email!,
          options: {
            emailRedirectTo: redirectTo,
          },
        });
      }, 1000);
    }
    // Reached from onboarding (0 farms): RootStack auto-transitions to the main app stack
    // once the new farm is active, discarding this navigator — no explicit navigation needed.
    // Reached in-app from the My Farm switcher ("create another farm"): "Home" is already in
    // this navigator's history — popTo prunes the whole create-farm flow off the stack, so
    // the back button doesn't lead back into it.
    if (navigation.getState().routes.some((route) => route.name === "Farm")) {
      navigation.popTo("Home");
    }
  });

  function onFinish() {
    createFarmMutation.mutate(data);
  }

  return (
    <ContentView headerVisible={false}>
      <View style={{ justifyContent: "center", flex: 1 }}>
        <FarmSummaryPage federalFarmId={data.federalFarmId} />
        {createFarmMutation.isPending && (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ marginTop: theme.spacing.l }}
          />
        )}
      </View>
      <View style={{ padding: theme.spacing.m }}>
        <Stepper totalSteps={5} currentStep={5} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginHorizontal: theme.spacing.m,
          }}
        >
          <NavigationButton
            title={t("buttons.back")}
            icon="arrow-back-circle-outline"
            disabled={createFarmMutation.isPending}
            onPress={() => navigation.goBack()}
          />
          <NavigationButton
            title={t("buttons.save")}
            icon="checkmark-circle-outline"
            disabled={createFarmMutation.isPending}
            onPress={onFinish}
          />
        </View>
      </View>
    </ContentView>
  );
}
