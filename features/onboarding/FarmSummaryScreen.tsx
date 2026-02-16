import { ContentView } from "@/components/containers/ContentView";
import { FarmSummaryScreenProps } from "@/features/onboarding/navigation/onboarding-routes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCreateFarmMutation } from "../farms/farms.hooks";
import { useSyncMissingLocalIdsMutation } from "../plots/plots.hooks";
import { NavigationButton } from "./NavigationButton";
import { useOnboarding } from "./OnboardingContext";
import { Stepper } from "./Stepper";
import { FarmSummaryPage } from "./pages/FarmSummaryPage";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "@/supabase/supabase";
import { useSession } from "@/auth/SessionProvider";

const redirectTo = makeRedirectUri({
  scheme: "ch.agricoltivio.coltivio",
  path: "EmailVerified",
});

export function FarmSummaryScreen({ navigation }: FarmSummaryScreenProps) {
  const { t } = useTranslation();
  const { data } = useOnboarding();
  const { authUser } = useSession();
  const theme = useTheme();

  const syncMissingLocalIdsMutation = useSyncMissingLocalIdsMutation(
    () => {},
    (error) => console.error(error),
  );
  const createFarmMutation = useCreateFarmMutation(() => {
    syncMissingLocalIdsMutation.mutate();
    setTimeout(() => {
      supabase.auth.signInWithOtp({
        email: authUser!.email!,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
    }, 1000);
  });

  function onFinish() {
    createFarmMutation.mutate(data);
  }

  return (
    <ContentView headerVisible={false}>
      <View style={{ justifyContent: "center", flex: 1 }}>
        <FarmSummaryPage federalFarmId={data.federalFarmId} />
      </View>
      <View style={{ padding: theme.spacing.m }}>
        <Stepper totalSteps={4} currentStep={4} />
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
