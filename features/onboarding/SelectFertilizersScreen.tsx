import { Button } from "@/components/buttons/Button";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { Select } from "@/components/select/Select";
import { SelectFertilizersScreenProps } from "@/features/onboarding/navigation/onboarding-routes";
import { H2, H3 } from "@/theme/Typography";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { NavigationButton } from "./NavigationButton";
import { useOnboarding } from "./OnboardingContext";
import { Stepper } from "./Stepper";
import { FertilizerCreateInput, FertilizerUnit } from "@/api/fertilizers.api";
import { useCreateFarmMutation } from "../farms/farms.hooks";

export function SelectFertilizersScreen({
  navigation,
}: SelectFertilizersScreenProps) {
  const { data, setData, clear } = useOnboarding();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const createFarmMutation = useCreateFarmMutation(() => {
    // clear();
  });

  const [customFertilizerName, setCustomFertilizerName] = useState<string>("");
  const [selectedFertilizer, setSelectedFertilizer] = useState<
    (FertilizerCreateInput & { isCustom?: boolean }) | null
  >(null);

  const [fertilizerOptions, setFertilizerOptions] =
    useState<FertilizerCreateInput[]>(defaultFertilizers);

  const bottomSheetModalRef = useRef<BottomSheet>(null);

  const handleExpandBottomDrawer = useCallback(() => {
    bottomSheetModalRef.current?.expand();
  }, []);
  const handleCloseBottomDrawer = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  function onFinish() {
    createFarmMutation.mutate(data);
  }

  function onFertilizerPress(selectedFertilizer: FertilizerCreateInput) {
    if (
      data.fertilizers.find(
        (fertilizer) => fertilizer.name === selectedFertilizer.name
      )
    ) {
      setData({
        ...data,
        fertilizers: data.fertilizers.filter(
          (fertilizer) => fertilizer.name !== selectedFertilizer.name
        ),
      });
    } else {
      setData({
        ...data,
        fertilizers: [...data.fertilizers, selectedFertilizer],
      });
    }
  }

  function onCustomFertilizerAdd() {
    if (!customFertilizerName) return;
    setSelectedFertilizer({
      name: customFertilizerName,
      unit: "kilogram",
      isCustom: true,
    });
    handleExpandBottomDrawer();
  }

  function onSelectionConfirm() {
    if (!selectedFertilizer) return;
    if (selectedFertilizer.isCustom) {
      setFertilizerOptions([...fertilizerOptions, selectedFertilizer]);
    }
    setData({
      ...data,
      fertilizers: [...data.fertilizers, selectedFertilizer],
    });
    setSelectedFertilizer(null);
    setCustomFertilizerName("");
    handleCloseBottomDrawer();
  }

  function renderItem({
    item,
    index,
  }: ListRenderItemInfo<FertilizerCreateInput>) {
    return (
      <ListItem
        key={item.name}
        onPress={() => {
          onFertilizerPress(item);
        }}
      >
        <ListItem.Content>
          <ListItem.Title>{item.name}</ListItem.Title>
          <ListItem.Body>
            {item.description ? `${item.description}` : "keine Beschreibung"}
          </ListItem.Body>
        </ListItem.Content>
        <ListItem.Checkbox
          checked={
            !!data.fertilizers.find(
              (fertilizer) => fertilizer.name === item.name
            )
          }
        />
      </ListItem>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Image
        source={require("@/assets/images/fertilizers.png")}
        style={{ height: 300, opacity: 0.9 }}
      />
      <View
        style={{
          padding: theme.spacing.m,
          paddingTop: theme.spacing.l,
          flex: 1,
        }}
      >
        <H2 style={{ color: theme.colors.primary }}>Dünger</H2>
        <H3 style={{ color: theme.colors.primary, marginTop: theme.spacing.s }}>
          Wähle deine verwendeten Dünger aus. Du kannst diese später anpassen
          oder eigene hinzufügen.
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
            data={fertilizerOptions}
            keyExtractor={(item) => item.name}
            renderItem={renderItem}
          />
        </View>
        <Stepper totalSteps={5} currentStep={5} />
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
            disabled={createFarmMutation.isPending}
            onPress={() => navigation.goBack()}
          />
          <NavigationButton
            title="Fertig"
            icon="checkmark-circle-outline"
            disabled={createFarmMutation.isPending}
            onPress={onFinish}
          />
        </View>
      </View>
      <BottomSheet
        ref={bottomSheetModalRef}
        enablePanDownToClose
        index={-1}
        backdropComponent={(props) => {
          return <BottomSheetBackdrop disappearsOnIndex={-1} {...props} />;
        }}
      >
        <BottomSheetView
          style={{
            paddingBottom: insets.bottom,
            paddingHorizontal: theme.spacing.l,
            gap: theme.spacing.s,
          }}
        >
          <H3
            style={{
              marginVertical: theme.spacing.l,
              fontSize: 16,
              textAlign: "center",
            }}
          >
            Wähle die Masseinheit und eine Beschreibung für deinen Dünger
          </H3>
          <Select
            label={t("forms.labels.unit")}
            data={[
              { label: "Kilogramm", value: "kilogram" },
              { label: "Liter", value: "liter" },
            ]}
            value={selectedFertilizer?.unit}
            onChange={(value) =>
              setSelectedFertilizer(
                (prev) =>
                  prev && {
                    ...prev,
                    unit: value as FertilizerUnit,
                  }
              )
            }
          />

          <TextInput
            label="Beschreibung"
            placeholder="Optional"
            value={selectedFertilizer?.description || ""}
            onChangeText={(value) =>
              setSelectedFertilizer(
                (prev) => prev && { ...prev, description: value }
              )
            }
          />
          <Button title="Bestätigen" onPress={onSelectionConfirm} />
        </BottomSheetView>
      </BottomSheet>

      {createFarmMutation.isPending && (
        <ActivityIndicator
          animating
          size={"large"}
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
          color={theme.colors.secondary}
        />
      )}
    </View>
  );
}
const defaultFertilizers: FertilizerCreateInput[] = [
  {
    name: "Kuhmist",
    description: "Kuhmist mit Tiefstreu",
    unit: "kilogram",
  },
  {
    name: "Kuhgülle",
    unit: "liter",
  },
  {
    name: "Schafmist",
    description: "Schafmist mit Tiefstreu",
    unit: "kilogram",
  },
  {
    name: "Ziegenmist",
    description: "Ziegenmist mit Tiefstreu",
    unit: "kilogram",
  },
  {
    name: "Schweinemist",
    description: "Schweinemist ohne Tiefstreu",
    unit: "kilogram",
  },
  {
    name: "Schweinegülle",
    unit: "liter",
  },
  {
    name: "Pferdemist",
    description: "Pferdemist ohne Tiefstreu",
    unit: "kilogram",
  },
  {
    name: "Hühnermist",
    unit: "kilogram",
  },
];
