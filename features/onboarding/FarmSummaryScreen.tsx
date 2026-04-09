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
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/cache/query-keys";

const redirectTo = `${process.env.EXPO_PUBLIC_WEB_URL}/auth/confirm`;

export function FarmSummaryScreen({ navigation }: FarmSummaryScreenProps) {
  const { t } = useTranslation();
  const { data } = useOnboarding();
  const { authUser } = useSession();
  const { user } = useUserQuery();
  const theme = useTheme();
  const queryClient = useQueryClient();

  const syncMissingLocalIdsMutation = useSyncMissingLocalIdsMutation(
    () => {},
    (error) => console.error(error),
  );
  const createFarmMutation = useCreateFarmMutation(
    () => {
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
    },
    // If the farm was already created (e.g. success but navigation failed), refetch the
    // user so farmId is set and RootStack auto-transitions to the app.
    (error) => {
      if (error.message?.includes("User already has a farm")) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.me.queryKey,
        });
      }
    },
  );

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
