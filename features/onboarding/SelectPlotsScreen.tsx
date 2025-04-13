import { AutocompleteInput } from "@/components/inputs/AutocompleteInput";
import {
  SelectFarmNameScreenProps,
  SelectFederalFarmIdScreenProps,
  SelectPlotsScreenProps,
} from "@/navigation/rootStackTypes";
import { Body, H2, H3, Subtitle } from "@/theme/Typography";
import { useDebounce } from "@uidotdev/usehooks";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Button as NativeButton, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { useFederalFarmIdSearchQuery } from "../federal-plots/federalPlots.hooks";
import { NavigationButton } from "./NavigationButton";
import { useOnboarding } from "./OnboardingContext";
import { Stepper } from "./Stepper";
import { Card } from "@/components/card/Card";

export function SelectPlotsScreens({ navigation }: SelectPlotsScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { data, setData } = useOnboarding();
  const { createParcelPlots } = data;

  function onCreatePlotsFromParcelsChange() {
    setData({ ...data, createParcelPlots: !createParcelPlots });
  }

  return (
    <View style={{ flex: 1 }}>
      <Image
        source={require("@/assets/images/crops.png")}
        style={{ height: 300, opacity: 0.9 }}
      />
      <View
        style={{
          padding: theme.spacing.m,
          paddingTop: theme.spacing.l,
          flex: 1,
        }}
      >
        <View>
          <H2 style={{ color: theme.colors.primary }}>Schläge</H2>
          <H3
            style={{
              color: theme.colors.primary,
              marginTop: theme.spacing.s,
            }}
          >
            Ein Schlag ist eine Bewirtschaftungseinheit auf welcher Du
            Arbeitsgänge wie Ernten erfassen kannst.
          </H3>
          <H3 style={{ marginTop: theme.spacing.s }}>
            Du kann automatisch Schläge aus deinen Parzellen erstellen.
          </H3>
        </View>

        <View
          style={{
            marginVertical: theme.spacing.m,
            flex: 1,
            gap: theme.spacing.l,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: theme.spacing.m,
            }}
          >
            <Subtitle style={{ flexGrow: 1 }}>
              Schläge aus Parzellen erstellen
            </Subtitle>
            <Switch
              value={createParcelPlots}
              onChange={onCreatePlotsFromParcelsChange}
            />
          </View>
          <Card style={{ backgroundColor: theme.colors.secondary }}>
            <Subtitle style={{ color: theme.colors.white }}>
              Nachdem dein Hof erstellt wurde kannst du deine Schläge anpassen
              oder eigene Schläge einzeichnen!
            </Subtitle>
          </Card>
        </View>

        <Stepper totalSteps={6} currentStep={3} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: insets.bottom + theme.spacing.xxs,
            marginHorizontal: theme.spacing.m,
          }}
        >
          <NavigationButton
            title="Zurück"
            icon="arrow-back-circle-outline"
            onPress={() => navigation.goBack()}
          />
          <NavigationButton
            title={t("buttons.next")}
            icon="arrow-forward-circle-outline"
            onPress={() => navigation.navigate("SelectCrops")}
            disabled={!data.federalFarmId}
          />
        </View>
      </View>
      {/* </TouchableWithoutFeedback> */}
    </View>
  );
}
