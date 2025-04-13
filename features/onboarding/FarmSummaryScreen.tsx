import { Body, H2, H3, Subheadline, Subtitle, Title } from "@/theme/Typography";
import { Image } from "expo-image";
import { View } from "react-native";
import { Stepper } from "./Stepper";
import { NavigationButton } from "./NavigationButton";
import { useTheme } from "styled-components/native";
import { useOnboarding } from "./OnboardingContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "@/components/card/Card";
import { useCreateFarmMutation } from "../farms/farms.hooks";
import { FarmSummaryScreenProps } from "@/navigation/rootStackTypes";
import { useTranslation } from "react-i18next";
import { ContentView } from "@/components/containers/ContentView";
import { useSyncMissingLocalIdsMutation } from "../plots/plots.hooks";

export function FarmSummaryScreen({ navigation }: FarmSummaryScreenProps) {
  const { t } = useTranslation();
  const { data, setData } = useOnboarding();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const syncMissingLocalIdsMutation = useSyncMissingLocalIdsMutation(
    () => {},
    (error) => console.error(error)
  );
  const createFarmMutation = useCreateFarmMutation(() => {
    syncMissingLocalIdsMutation.mutate();
  });

  function onFinish() {
    createFarmMutation.mutate(data);
  }
  return (
    <ContentView headerVisible={false}>
      {/* <Image
        source={require("@/assets/images/crops.png")}
        style={{ height: 300, opacity: 0.9 }}
      /> */}
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
          <H2 style={{ color: theme.colors.primary }}>
            {/* {t("onboarding.summary.heading")} */}
            {t("common.federal_farm_id", { number: data.federalFarmId })}
          </H2>
          <H3 style={{ marginTop: theme.spacing.s }}>
            {t("onboarding.summary.plots_info")}
          </H3>
          <H3 style={{ marginTop: theme.spacing.s }}>
            {t("onboarding.summary.crops_info")}
          </H3>
          <H3 style={{ marginTop: theme.spacing.s }}>
            {t("onboarding.summary.edit_plots_info")}
          </H3>
          <H3
            style={{
              color: theme.colors.primary,
              marginTop: theme.spacing.xxl,
            }}
          >
            {t("onboarding.summary.press_save_to_finish")}
          </H3>
        </View>
        {/* <View
          style={{
            flexDirection: "row",
            marginTop: theme.spacing.l,
            marginBottom: theme.spacing.s,
            gap: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.gray4,
            paddingVertical: theme.spacing.s,
          }}
        >
          <Body style={{ fontWeight: 600, fontSize: 18, flex: 1 }}>Name:</Body>
          <Body style={{ fontSize: 18 }}>{data.name}</Body>
        </View>
        <View
          style={{
            flexDirection: "row",
            marginBottom: theme.spacing.s,
            gap: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.gray4,
            paddingVertical: theme.spacing.s,
          }}
        >
          <Body
            style={{
              fontWeight: 600,
              fontSize: 18,
              flexGrow: 1,
            }}
          >
            Adresse:
          </Body>
          <Body style={{ fontSize: 18, flexShrink: 1 }}>
            {data.location?.label}
          </Body>
        </View>
        <View
          style={{
            flexDirection: "row",
            marginBottom: theme.spacing.s,
            gap: theme.spacing.m,
            paddingTop: theme.spacing.s,
          }}
        >
          <Body style={{ fontWeight: 600, fontSize: 18, flexGrow: 1 }}>
            Betriebsnummer:
          </Body>
          <Body style={{ fontSize: 18 }}>{data.federalFarmId}</Body>
        </View> */}
      </View>
      <View style={{ padding: theme.spacing.m }}>
        <Stepper totalSteps={4} currentStep={4} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            // marginBottom: insets.bottom + theme.spacing.xxs,
            marginHorizontal: theme.spacing.m,
          }}
        >
          <NavigationButton
            title={t("buttons.back")}
            icon="arrow-back-circle-outline"
            // disabled={setupFarmMutation.isPending}
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
