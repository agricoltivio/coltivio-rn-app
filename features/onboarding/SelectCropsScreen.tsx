import { CropCreateInput } from "@/api/crops.api";
import { ListItem } from "@/components/list/ListItem";
import { SelectCropsScreenProps } from "@/navigation/rootStackTypes";
import { H2, H3 } from "@/theme/Typography";
import { Image } from "expo-image";
import React, { useState } from "react";
import { FlatList, ListRenderItemInfo, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { NavigationButton } from "./NavigationButton";
import { useOnboarding } from "./OnboardingContext";
import { Stepper } from "./Stepper";
import { useTranslation } from "react-i18next";

export function SelectCropsScreen({ navigation }: SelectCropsScreenProps) {
  const { data, setData } = useOnboarding();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [cropOptions, setCropOptions] = useState<CropCreateInput[]>([
    {
      name: "Naturwiese",
      category: "grass",
    },
    {
      name: "Kunstwiese",
      category: "grass",
    },
    {
      name: "Mais (Ganzpflanze)",
      category: "grain",
    },
    {
      name: "Körnermais",
      category: "grain",
    },
  ]);

  function onCropPress(selectedCrop: CropCreateInput) {
    if (data.crops.find((crop) => crop.name === selectedCrop.name)) {
      setData({
        ...data,
        crops: data.crops.filter((crop) => crop.name !== selectedCrop.name),
      });
    } else {
      setData({
        ...data,
        crops: [...data.crops, selectedCrop],
      });
    }
  }

  function renderItem({ item, index }: ListRenderItemInfo<CropCreateInput>) {
    const isSelected = !!data.crops.find((crop) => crop.name === item.name);
    return (
      <ListItem
        key={item.name}
        onPress={() => {
          onCropPress(item);
        }}
      >
        <ListItem.Content>
          <ListItem.Title>{item.name}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Checkbox checked={isSelected} />
      </ListItem>
    );
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
        <H2 style={{ color: theme.colors.primary }}>Futterpflanzen</H2>
        <H3 style={{ color: theme.colors.primary, marginTop: theme.spacing.s }}>
          Wähle deine Futterpflanzen aus. Du kannst diese später anpassen oder
          eigene Hinzufügen.
        </H3>
        <View
          style={{
            flex: 1,
          }}
        >
          <FlatList
            style={{ marginVertical: theme.spacing.m }}
            contentContainerStyle={{
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
              overflow: "hidden",
              backgroundColor: theme.colors.white,
            }}
            data={cropOptions}
            keyExtractor={(item) => item.name}
            renderItem={renderItem}
          />
        </View>
        <Stepper totalSteps={5} currentStep={4} />
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
            // disabled={setupFarmMutation.isPending}
            onPress={() => navigation.goBack()}
          />
          <NavigationButton
            title={t("buttons.next")}
            icon="arrow-forward-circle-outline"
            onPress={() => navigation.navigate("SelectFertilizers")}
          />
        </View>
      </View>
    </View>
  );
}
