import { FederalFarmPlot } from "@/api/layers.api";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { View, Text, FlatList } from "react-native";
import { useOnboarding } from "./OnboardingContext";
import _ from "lodash";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { useTheme } from "styled-components/native";
import { Button } from "@/components/buttons/Button";

export function Step4ListModal({}) {
  const theme = useTheme();
  const navigation = useNavigation();
  const { data } = useOnboarding();
  const farmParcels = Object.values(data.parcelsById).sort((a, b) =>
    a.communalId > b.communalId ? 1 : b.communalId > a.communalId ? -1 : 0
  );

  const aggregatedParcels: Record<
    string,
    { communalId: string; area: number }
  > = {};
  for (const farmParcel of farmParcels) {
    if (farmParcel.communalId in aggregatedParcels) {
      aggregatedParcels[farmParcel.communalId].area += farmParcel.area;
    } else {
      aggregatedParcels[farmParcel.communalId] = {
        communalId: farmParcel.communalId,
        area: farmParcel.area,
      };
    }
  }
  const renderItem = useCallback(
    ({ item }: { item: { communalId: string; area: number } }) => (
      <ListItem
        key={item.communalId}
        style={{
          paddingVertical: 5,

          backgroundColor: theme.colors.background,
          borderColor: theme.colors.gray3,
          borderBottomWidth: 1,
        }}
        // onPress={() => onFederalFarmIdSelected(item)}
      >
        <ListItem.Content>
          <ListItem.Title style={{ flex: 1 }}>
            Parzelle: {item.communalId}
          </ListItem.Title>
          <ListItem.Body>Fläche: {item.area}m²</ListItem.Body>
        </ListItem.Content>
      </ListItem>
    ),
    []
  );

  return (
    <View
      style={{
        flex: 1,
        // alignItems: "center",
        // justifyContent: "center",
        width: "100%",
        // backgroundColor: "blue",
      }}
    >
      <Button
        type="secondary"
        onPress={() => navigation.goBack()}
        title="Schliessen"
      />
      <ContentView style={{ flex: 1 }} headerVisible>
        <FlatList
          style={{ flex: 1 }}
          data={Object.values(aggregatedParcels)}
          keyExtractor={(item) => item.communalId}
          renderItem={renderItem}
        />
      </ContentView>
    </View>
  );
}
