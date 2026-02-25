import { LocationSearchResult } from "@/api/geo-admin";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { SelectFarmLocationSearchModalProps } from "@/features/onboarding/navigation/onboarding-routes";
import { useDebounce } from "@uidotdev/usehooks";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useGeoAdminAddressQuery } from "../geoadmin/geoadmin.hooks";
import { useOnboarding } from "./OnboardingContext";

export function SelectFarmLocationSearchModal({
  navigation,
}: SelectFarmLocationSearchModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data, setData } = useOnboarding();

  const [locationSerachText, setLocationSearchText] = useState(
    data.location?.label || "",
  );
  const debouncedLocationSearchText = useDebounce(locationSerachText, 800);

  const { addresses, isFetching } = useGeoAdminAddressQuery(
    debouncedLocationSearchText,
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
    navigation.goBack();
  }
  const renderItem = ({ item }: { item: LocationSearchResult }) => (
    <ListItem key={item.label} onPress={() => selectLocation(item)}>
      <ListItem.Content>
        <ListItem.Title style={{ flex: 1 }}>{item.label} </ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );
  return (
    <ContentView>
      <View style={{ marginVertical: theme.spacing.m }}>
        <TextInput
          label={t("forms.labels.location_search")}
          placeholder={t("forms.placeholders.location_search")}
          value={locationSerachText}
          onChangeText={handleLocationSearchTextChange}
          autoFocus
        />
        {isFetching && (
          <ActivityIndicator
            size={"small"}
            style={{ position: "absolute", right: 10, top: 20 }}
          />
        )}
      </View>
      <FlatList
        contentContainerStyle={{
          overflow: "hidden",
          backgroundColor: theme.colors.white,
        }}
        keyboardShouldPersistTaps="handled"
        data={addresses}
        keyExtractor={(item) => item.label}
        renderItem={renderItem}
      />
    </ContentView>
  );
}
