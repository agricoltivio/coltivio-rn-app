import { LocationSearchResult } from "@/api/geo-admin";
import { TextInput } from "@/components/inputs/TextInput";
import { ScrollView } from "@/components/views/ScrollView";
import { SelectFarmLocationScreenProps } from "@/features/onboarding/navigation/onboarding-routes";
import { H1, H2, H3 } from "@/theme/Typography";
import { useDebounce } from "@uidotdev/usehooks";
import { Image } from "expo-image";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { useGeoAdminAddressQuery } from "../geoadmin/geoadmin.hooks";
import { NavigationButton } from "./NavigationButton";
import { useOnboarding } from "./OnboardingContext";
import { Stepper } from "./Stepper";
import { useTranslation } from "react-i18next";
import { ContentView } from "@/components/containers/ContentView";

export function SelectFarmLocationScreen({
  navigation,
}: SelectFarmLocationScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { data, setData } = useOnboarding();

  const [locationSerachText, setLocationSearchText] = useState(
    data.location?.label || ""
  );
  const debouncedLocationSearchText = useDebounce(locationSerachText, 800);

  const { addresses, isFetching } = useGeoAdminAddressQuery(
    debouncedLocationSearchText
  );
  function handleLocationSearchTextChange(value: string) {
    setLocationSearchText(value);
    if (data.location) {
      setData((prev) => ({
        ...prev,
        location: null,
      }));
    }
  }
  function selectLocation(location: LocationSearchResult) {
    setLocationSearchText(location.label);
    setData((prev) => ({
      ...prev,
      location: { label: location.label, lat: location.lat, lng: location.lon },
    }));
  }
  return (
    <ContentView headerVisible={false}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        {/* <Image
          source={require("@/assets/images/onboarding2.jpeg")}
          style={{ height: 300, opacity: 0.9 }}
        /> */}
        <View
          style={
            {
              // padding: theme.spacing.m,
              // paddingTop: theme.spacing.l,
              // flex: 1,
            }
          }
        >
          <View>
            <H2 style={{ color: theme.colors.primary }}>
              {t("onboarding.location.heading", { farmName: data.name })}
            </H2>
            <H3
              style={{
                color: theme.colors.primary,
                marginTop: theme.spacing.s,
              }}
            >
              {t("onboarding.location.subheading")}
            </H3>
          </View>

          <View style={{ marginVertical: theme.spacing.xl, flex: 1 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("SelectFarmLocationSearch")}
            >
              <TextInput
                placeholder={t("forms.placeholders.location_search")}
                pointerEvents="none"
                label={t("forms.labels.location")}
                value={data.location?.label}
                disabled
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          padding: theme.spacing.m,
        }}
      >
        <Stepper totalSteps={4} currentStep={2} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            // marginBottom: insets.bottom,
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
            onPress={() => navigation.navigate("SelectFederalFarmIdMap")}
            disabled={!data.location}
          />
        </View>
      </View>
    </ContentView>
  );
}
