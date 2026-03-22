import { LocationSearchResult } from "@/api/geo-admin";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { SearchFarmLocationModalProps } from "./navigation/farm-routes";
import { useDebounce } from "@uidotdev/usehooks";
import { useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useGeoAdminAddressQuery } from "../geoadmin/geoadmin.hooks";
import { useUpdateFarmMutation } from "./farms.hooks";
import { useTranslation } from "react-i18next";

export function SearchFarmLocationModal({
  navigation,
}: SearchFarmLocationModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [locationSerachText, setLocationSearchText] = useState("");
  const debouncedLocationSearchText = useDebounce(locationSerachText, 800);
  const updateFarmMutation = useUpdateFarmMutation(() => navigation.goBack());

  const { addresses, isFetching } = useGeoAdminAddressQuery(
    debouncedLocationSearchText,
  );
  function handleLocationSearchTextChange(value: string) {
    setLocationSearchText(value);
  }
  function selectLocation(location: LocationSearchResult) {
    updateFarmMutation.mutate({
      location: { type: "Point", coordinates: [location!.lon, location!.lat] },
      address: location.label,
    });
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
