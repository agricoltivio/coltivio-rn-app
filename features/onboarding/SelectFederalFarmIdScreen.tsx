import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ScrollView } from "@/components/views/ScrollView";
import { SelectFederalFarmIdMapScreenProps } from "@/features/onboarding/navigation/onboarding-routes";
import { H3 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Keyboard, Pressable, View } from "react-native";
import { Text } from "@/components/text/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import {
  useFederalFarmIdSearchQuery,
  usePlotsByLocationQuery,
} from "../federal-plots/federalPlots.hooks";
import { NavigationButton } from "./NavigationButton";
import { useOnboarding } from "./OnboardingContext";
import { Stepper } from "./Stepper";

const NEARBY_RADIUS_KM = 1;
const SEARCH_RADIUS_KM = 3;
const SEARCH_LIMIT = 20;
// The backend matches by trigram similarity, shorter queries (almost) never match
const SEARCH_MIN_CHARS = 3;

type SheetState =
  | { kind: "confirmId"; federalFarmId: string }
  | { kind: "withoutId" };

export function SelectFederalFarmIdScreen({
  navigation,
}: SelectFederalFarmIdMapScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { data, setData } = useOnboarding();

  const {
    plots,
    isFetching: isFetchingPlots,
    isFetched: isPlotsFetched,
    isError: isPlotsError,
    refetch: refetchPlots,
  } = usePlotsByLocationQuery(
    data.location!,
    NEARBY_RADIUS_KM,
    !!data.location,
  );

  const [searchText, setSearchText] = useState("");
  const trimmedSearchText = searchText.trim();
  const debouncedSearchText = useDebounce(trimmedSearchText, 800);

  const {
    federalFarmIds,
    isFetching: isSearching,
    isError: isSearchError,
    refetch: refetchSearch,
  } = useFederalFarmIdSearchQuery(
    debouncedSearchText,
    data.location?.lng!,
    data.location?.lat!,
    SEARCH_RADIUS_KM,
    SEARCH_LIMIT,
    debouncedSearchText.length >= SEARCH_MIN_CHARS,
  );

  const uniqueFarmIds = useMemo(
    () =>
      [
        ...new Set(plots.map((p) => p.federalFarmId).filter(Boolean)),
      ] as string[],
    [plots],
  );

  // initialData ([]) counts as data, so only a first fetch or a retry after an error is "loading";
  // background refetches (e.g. on app focus) keep showing the current result
  const nearbyStatus =
    isFetchingPlots && (!isPlotsFetched || isPlotsError)
      ? "loading"
      : isPlotsError
        ? "error"
        : uniqueFarmIds.length > 0
          ? "found"
          : "notFound";

  const searchStatus =
    trimmedSearchText.length === 0
      ? "idle"
      : trimmedSearchText.length < SEARCH_MIN_CHARS
        ? "tooShort"
        : trimmedSearchText !== debouncedSearchText || isSearching
          ? "loading"
          : isSearchError
            ? "error"
            : (federalFarmIds ?? []).length === 0
              ? "empty"
              : "results";

  // The selected farm id is listed first. It can come from the search or the map, so the
  // nearby list shows it even when it isn't one of the nearby farm ids.
  function withSelectedFirst(farmIds: string[], addIfMissing: boolean) {
    const selected = data.federalFarmId;
    if (!selected || (!addIfMissing && !farmIds.includes(selected))) {
      return farmIds;
    }
    return [selected, ...farmIds.filter((farmId) => farmId !== selected)];
  }

  const listedFarmIds =
    searchStatus === "results"
      ? withSelectedFirst(federalFarmIds ?? [], false)
      : searchStatus === "idle"
        ? withSelectedFirst(nearbyStatus === "found" ? uniqueFarmIds : [], true)
        : [];

  // A new object on every open, so tapping the same farm id again re-opens the sheet.
  // It is not reset on close, so the content doesn't change during the close animation.
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (sheet) {
      bottomSheetRef.current?.expand();
    }
  }, [sheet]);

  function handleFarmIdPress(federalFarmId: string) {
    Keyboard.dismiss();
    if (federalFarmId === data.federalFarmId) {
      setData((prev) => ({ ...prev, federalFarmId: null }));
      return;
    }
    setSheet({ kind: "confirmId", federalFarmId });
  }

  function handleNext() {
    // a selected farm id was already confirmed when it was tapped
    if (data.federalFarmId) {
      navigation.navigate("OnboardingPreference");
      return;
    }
    setSheet({ kind: "withoutId" });
  }

  function handleSheetConfirm() {
    if (sheet?.kind === "confirmId") {
      const { federalFarmId } = sheet;
      setData((prev) => ({ ...prev, federalFarmId }));
    }
    bottomSheetRef.current?.close();
    navigation.navigate("OnboardingPreference");
  }

  const farmIdRows = listedFarmIds.map((farmId) => (
    <FarmIdRow
      key={farmId}
      federalFarmId={farmId}
      selected={farmId === data.federalFarmId}
      onPress={() => handleFarmIdPress(farmId)}
    />
  ));

  return (
    <ContentView headerVisible={false}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ padding: theme.spacing.m, gap: theme.spacing.m }}>
          <TextInput
            label={t("forms.labels.federal_farm_number")}
            placeholder={t("forms.placeholders.federal_farm_number")}
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          {searchStatus === "tooShort" ? (
            <Text style={{ fontSize: 15, color: theme.colors.gray1 }}>
              {t("onboarding.federal_farm_number.search_min_chars", {
                minChars: SEARCH_MIN_CHARS,
              })}
            </Text>
          ) : null}
          {searchStatus === "loading" ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : null}
          {searchStatus === "error" ? (
            <RetryCard
              text={t("onboarding.federal_farm_number.search_error")}
              onRetry={() => refetchSearch()}
            />
          ) : null}
          {searchStatus === "empty" ? (
            <Text style={{ fontSize: 15, color: theme.colors.gray1 }}>
              {t("onboarding.federal_farm_number.search_empty", {
                query: debouncedSearchText,
                radiusKm: SEARCH_RADIUS_KM,
              })}
            </Text>
          ) : null}
          {searchStatus === "results" ? farmIdRows : null}
          {nearbyStatus === "loading" ? (
            <Card
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.s,
              }}
            >
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={{ fontSize: 15, color: theme.colors.gray1 }}>
                {t("onboarding.federal_farm_number.nearby_loading")}
              </Text>
            </Card>
          ) : nearbyStatus === "error" ? (
            <RetryCard
              text={t("onboarding.federal_farm_number.nearby_error")}
              onRetry={() => refetchPlots()}
            />
          ) : nearbyStatus === "notFound" ? (
            <>
              <Card
                style={{
                  backgroundColor: theme.colors.warning,
                  gap: theme.spacing.s,
                }}
              >
                <Text style={{ fontSize: 15, color: theme.colors.black }}>
                  {t("onboarding.federal_farm_number.not_found", {
                    address: data.location?.label,
                    radiusKm: NEARBY_RADIUS_KM,
                  })}
                </Text>
                <Text style={{ fontSize: 15, color: theme.colors.black }}>
                  {t("onboarding.federal_farm_number.not_found_hint")}
                </Text>
              </Card>
              <Card>
                <Text style={{ fontSize: 15, color: theme.colors.gray1 }}>
                  {t("onboarding.federal_farm_number.not_found_cantons")}
                </Text>
              </Card>
            </>
          ) : (
            <Pressable
              onPress={() =>
                navigation.navigate("SelectFederalFarmIdParcelMap")
              }
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
          )}
          {searchStatus === "idle" ? farmIdRows : null}
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
            onPress={handleNext}
          />
        </View>
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        enablePanDownToClose
        index={-1}
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
            {sheet?.kind === "confirmId"
              ? t("onboarding.federal_farm_number.confirmation", {
                  federalFarmId: sheet.federalFarmId,
                })
              : t("onboarding.federal_farm_number.confirmation_without_id")}
          </H3>
          <Button
            title={
              sheet?.kind === "confirmId"
                ? t("buttons.confirm")
                : t("onboarding.federal_farm_number.continue_without_id")
            }
            onPress={handleSheetConfirm}
          />
        </BottomSheetView>
      </BottomSheet>
    </ContentView>
  );
}

function FarmIdRow({
  federalFarmId,
  selected,
  onPress,
}: {
  federalFarmId: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Card
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderWidth: 2,
          borderColor: selected ? theme.colors.primary : "transparent",
        }}
      >
        <Text style={{ fontSize: 16, color: theme.colors.gray0 }}>
          {federalFarmId}
        </Text>
        {selected ? (
          <Ionicons
            name="checkmark-circle"
            size={22}
            color={theme.colors.primary}
          />
        ) : null}
      </Card>
    </Pressable>
  );
}

function RetryCard({ text, onRetry }: { text: string; onRetry: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Card
      style={{ backgroundColor: theme.colors.warning, gap: theme.spacing.s }}
    >
      <Text style={{ fontSize: 15, color: theme.colors.black }}>{text}</Text>
      <Button type="accent" title={t("buttons.retry")} onPress={onRetry} />
    </Card>
  );
}
