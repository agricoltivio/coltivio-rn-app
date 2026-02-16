import { ContentView } from "@/components/containers/ContentView";
import { FarmSummaryScreenProps } from "@/features/onboarding/navigation/onboarding-routes";
import { H2, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCreateFarmMutation } from "../farms/farms.hooks";
import { useSyncMissingLocalIdsMutation } from "../plots/plots.hooks";
import { NavigationButton } from "./NavigationButton";
import { useOnboarding } from "./OnboardingContext";
import { Stepper } from "./Stepper";
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

    // Defer OTP call so it doesn't trigger an auth state change
    // that could cause a user query refetch before navigation switches
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
      <View
        style={{
          // padding: theme.spacing.m,
          // paddingTop: theme.spacing.l,
          justifyContent: "center",
          // backgroundColor: "green",
          flex: 1,
        }}
      >
        <View>
          {data.federalFarmId ? (
            <>
              <H2 style={{ color: theme.colors.primary }}>
                {t("onboarding.summary.heading")}
              </H2>
              <H3 style={{ marginTop: theme.spacing.s }}>
                {t("onboarding.summary.subheading", {
                  federalFarmId: data.federalFarmId,
                })}
              </H3>
              {/* <H3 style={{ marginTop: theme.spacing.s }}>
                {t("onboarding.summary.plots_info")}
              </H3>
              <H3 style={{ marginTop: theme.spacing.s }}>
                {t("onboarding.summary.crops_info")}
              </H3>
              <H3 style={{ marginTop: theme.spacing.s }}>
                {t("onboarding.summary.edit_plots_info")}
              </H3> */}
            </>
          ) : (
            <H3 style={{ marginTop: theme.spacing.s }}>
              {t("onboarding.summary.no_federal_farm_id")}
            </H3>
          )}
        </View>
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
