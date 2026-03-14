import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ScrollView } from "@/components/views/ScrollView";
import { SelectFederalFarmIdMapScreenProps } from "@/features/onboarding/navigation/onboarding-routes";
import { H3 } from "@/theme/Typography";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import {
  useFederalFarmIdSearchQuery,
  usePlotsByLocationQuery,
} from "../federal-plots/federalPlots.hooks";
import { NavigationButton } from "./NavigationButton";
import { useOnboarding } from "./OnboardingContext";
import { Stepper } from "./Stepper";

export function SelectFederalFarmIdScreen({
  navigation,
}: SelectFederalFarmIdMapScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { data, setData } = useOnboarding();

  const { plots } = usePlotsByLocationQuery(data.location!, 1, !!data.location);

  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 800);

  const { federalFarmIds } = useFederalFarmIdSearchQuery(
    debouncedSearchText,
    data.location?.lng!,
    data.location?.lat!,
    3,
    20,
    debouncedSearchText !== "",
  );

  const uniqueFarmIds = useMemo(
    () =>
      [
        ...new Set(plots.map((p) => p.federalFarmId).filter(Boolean)),
      ] as string[],
    [plots],
  );

  // When search text is non-empty, show search results; otherwise show unique farm IDs from nearby parcels
  const displayedIds = searchText !== "" ? (federalFarmIds ?? []) : uniqueFarmIds;

  const [selectedFarmId, setSelectedFarmId] = useState<string | undefined>();

  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleExpandBottomDrawer = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleCloseBottomDrawer = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  useEffect(() => {
    if (selectedFarmId) {
      handleExpandBottomDrawer();
    }
  }, [selectedFarmId]);

  function handleOnConfirm() {
    setData({ ...data, federalFarmId: selectedFarmId! });
    handleCloseBottomDrawer();
    navigation.navigate("OnboardingPreference");
  }

  return (
    <ContentView headerVisible={false}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ padding: theme.spacing.m, gap: theme.spacing.m }}>
          <TextInput
            label={t("forms.labels.federal_farm_number")}
            placeholder={t("forms.placeholders.federal_farm_number")}
            value={searchText}
            onChangeText={setSearchText}
          />
          <Pressable
            onPress={() => navigation.navigate("SelectFederalFarmIdParcelMap")}
          >
            <Card>
              <Text
                style={{
                  color: theme.colors.primary,
                  fontSize: 15,
                }}
              >
                {t("onboarding.federal_farm_number.select_on_map_hint")}
              </Text>
            </Card>
          </Pressable>
          {displayedIds.map((farmId) => (
            <Pressable key={farmId} onPress={() => setSelectedFarmId(farmId)}>
              <Card>
                <Text style={{ fontSize: 16, color: theme.colors.gray0 }}>
                  {farmId}
                </Text>
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View style={{ padding: theme.spacing.m }}>
        <Stepper totalSteps={5} currentStep={3} />
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
            title={t("buttons.next")}
            icon="arrow-forward-circle-outline"
            onPress={() => navigation.navigate("OnboardingPreference")}
            disabled={!data.federalFarmId}
          />
        </View>
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        enablePanDownToClose
        index={-1}
        onClose={() => setSelectedFarmId(undefined)}
        backdropComponent={(props) => (
          <BottomSheetBackdrop disappearsOnIndex={-1} {...props} />
        )}
      >
        <BottomSheetView
          style={{
            paddingBottom: insets.bottom + theme.spacing.s,
            paddingHorizontal: theme.spacing.l,
          }}
        >
          <H3
            style={{
              marginVertical: theme.spacing.l,
              fontSize: 16,
              textAlign: "center",
            }}
          >
            {t("onboarding.federal_farm_number.confirmation", {
              federalFarmId: selectedFarmId,
            })}
          </H3>
          <Button title={t("buttons.confirm")} onPress={handleOnConfirm} />
        </BottomSheetView>
      </BottomSheet>
    </ContentView>
  );
}
