import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { ReactNode, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { useTheme } from "styled-components/native";
import { NavigationButton } from "./NavigationButton";
import { Stepper } from "./Stepper";

type OnboardingScreenProps = {
  steps: ReactNode[];
  onFinish: () => void;
};

export function OnboardingScreen({ steps, onFinish }: OnboardingScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const totalSteps = steps.length;

  function goToPage(index: number) {
    pagerRef.current?.setPage(index);
  }

  return (
    <ContentView
      headerVisible={false}
      footerComponent={
        <View
          style={{
            padding: theme.spacing.m,
            borderTopWidth: 1,
            borderTopColor: theme.colors.gray4,
          }}
        >
          <Stepper totalSteps={totalSteps} currentStep={stepIndex + 1} />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: stepIndex > 0 ? "space-between" : "flex-end",
              marginHorizontal: theme.spacing.m,
            }}
          >
            {stepIndex > 0 && (
              <NavigationButton
                title={t("buttons.back")}
                icon="arrow-back-circle-outline"
                onPress={() => goToPage(stepIndex - 1)}
              />
            )}
            {stepIndex < totalSteps - 1 ? (
              <NavigationButton
                title={t("buttons.next")}
                icon="arrow-forward-circle-outline"
                onPress={() => goToPage(stepIndex + 1)}
              />
            ) : (
              <NavigationButton
                title={t("buttons.finish")}
                icon="checkmark-circle-outline"
                onPress={onFinish}
              />
            )}
          </View>
        </View>
      }
    >
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        scrollEnabled={false}
        onPageSelected={(e) => setStepIndex(e.nativeEvent.position)}
      >
        {steps.map((step, i) => (
          <ScrollView
            key={i}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: theme.spacing.l,
            }}
          >
            {step}
          </ScrollView>
        ))}
      </PagerView>
    </ContentView>
  );
}
