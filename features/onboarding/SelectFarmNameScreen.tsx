import { TextInput } from "@/components/inputs/TextInput";
import { SelectFarmNameScreenProps } from "@/navigation/rootStackTypes";
import { H1, H2, H3 } from "@/theme/Typography";
import { Image } from "expo-image";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { NavigationButton } from "./NavigationButton";
import { useOnboarding } from "./OnboardingContext";
import { Stepper } from "./Stepper";
import { useEffect } from "react";
import { ScrollView } from "@/components/views/ScrollView";
import { useTranslation } from "react-i18next";
import { ContentView } from "@/components/containers/ContentView";

export function SelectFarmNameScreen({
  navigation,
}: SelectFarmNameScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const { data, setData, clear } = useOnboarding();

  useEffect(() => clear(), []);

  function onFarmNameChange(value: string) {
    setData((prev) => ({ ...prev, name: value }));
  }

  return (
    // <View style={{ flex: 1 }}>
    <ContentView headerVisible={false}>
      <ScrollView
        // keyboardAware
        style={{}}
        contentContainerStyle={{ justifyContent: "center", flexGrow: 1 }}
      >
        {/* <Image
          source={require("@/assets/images/farm.png")}
          style={{ height: 300, opacity: 0.9 }}
        /> */}
        {/* <View
          style={{
            // padding: theme.spacing.m,
            // paddingTop: theme.spacing.l,
            flexGrow: 1,
            justifyContent: "center",
          }}
        > */}
        <View>
          <View>
            <H1 style={{ color: theme.colors.primary }}>
              {t("onboarding.farm_name.heading")}
            </H1>
            <H3
              style={{
                color: theme.colors.primary,
                marginTop: theme.spacing.s,
              }}
            >
              {t("onboarding.farm_name.subheading")}
            </H3>
          </View>

          <View style={{ flexGrow: 1, paddingVertical: theme.spacing.xl }}>
            <TextInput
              label={t("forms.labels.farm_name")}
              // placeholder="Hofname"
              value={data.name}
              onChangeText={onFarmNameChange}
            />
          </View>
        </View>
        {/* </View> */}
      </ScrollView>
      <View
        style={{
          padding: theme.spacing.m,
        }}
      >
        <Stepper totalSteps={4} currentStep={1} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            // marginBottom: insets.bottom,
            marginHorizontal: theme.spacing.m,
          }}
        >
          <NavigationButton
            title={t("buttons.next")}
            icon="arrow-forward-circle-outline"
            onPress={() => navigation.navigate("SelectFarmLocation")}
            disabled={!data.name}
          />
        </View>
      </View>
      {/* </View> */}
    </ContentView>
  );
}
