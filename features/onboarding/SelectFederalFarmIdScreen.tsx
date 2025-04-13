import { AutocompleteInput } from "@/components/inputs/AutocompleteInput";
import { SelectFederalFarmIdScreenProps } from "@/navigation/rootStackTypes";
import { H2, H3 } from "@/theme/Typography";
import { useDebounce } from "@uidotdev/usehooks";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Button as NativeButton, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { useFederalFarmIdSearchQuery } from "../federal-plots/federalPlots.hooks";
import { NavigationButton } from "./NavigationButton";
import { useOnboarding } from "./OnboardingContext";
import { Stepper } from "./Stepper";
import { useTranslation } from "react-i18next";

export function SelectFederalFarmIdScreen({
  navigation,
}: SelectFederalFarmIdScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { data, setData } = useOnboarding();

  const [federalFarmIdSearchText, setFederalFarmIdSearchText] = useState(
    data.federalFarmId || ""
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (!federalFarmIdSearchText && data.federalFarmId) {
        setFederalFarmIdSearchText(data.federalFarmId);
      }
    });
    return unsubscribe;
  }, [navigation, data.federalFarmId]);

  const debouncedFederalFarmIdSearchText = useDebounce(
    federalFarmIdSearchText,
    800
  );

  const { federalFarmIds, isFetching } = useFederalFarmIdSearchQuery(
    debouncedFederalFarmIdSearchText,
    data.location?.lng!,
    data.location?.lat!,
    2,
    20,
    !data.federalFarmId
  );

  function onChangeQuery(value: string) {
    if (data.federalFarmId) {
      setData((prev) => ({ ...prev, federalFarmId: null }));
    }
    setFederalFarmIdSearchText(value);
  }

  function onFederalFarmIdSelect(value: string) {
    setFederalFarmIdSearchText(value);
    setData((prev) => ({ ...prev, federalFarmId: value }));
  }

  return (
    <View style={{ flex: 1 }}>
      <Image
        source={require("@/assets/images/onboarding3.jpg")}
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
          <H2 style={{ color: theme.colors.primary }}>Deine Betriebsnummer</H2>
          <H3
            style={{
              color: theme.colors.primary,
              marginTop: theme.spacing.s,
            }}
          >
            Suche nach deiner Betriebsnummer. Alternativ kannst du auf der Karte
            eine deiner Parzellen auswählen.
          </H3>
        </View>
        <View
          style={{
            marginVertical: theme.spacing.xl,
            flex: 1,
            gap: theme.spacing.l,
            zIndex: 1000,
          }}
        >
          <AutocompleteInput
            label="Betriebsnummer"
            placeholder="z.B.  123/555/4/1"
            setQuery={onChangeQuery}
            results={federalFarmIds ?? []}
            query={federalFarmIdSearchText}
            onResultSelect={onFederalFarmIdSelect}
            getListItemTitel={(item) => item}
            isLoading={isFetching}
          />

          <NativeButton
            title="Karte anzeigen"
            onPress={() => navigation.navigate("SelectFederalFarmIdMap")}
          />
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
            title={t("buttons.back")}
            icon="arrow-back-circle-outline"
            onPress={() => navigation.goBack()}
          />
          <NavigationButton
            title={t("buttons.next")}
            icon="arrow-forward-circle-outline"
            onPress={() => navigation.navigate("SelectParcelsMap")}
            disabled={!data.federalFarmId}
          />
        </View>
      </View>
    </View>
  );
}
