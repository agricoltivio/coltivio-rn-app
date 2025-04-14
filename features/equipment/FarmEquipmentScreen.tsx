import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { MachineConfigsScreenProps } from "@/navigation/rootStackTypes";
import { H2, H3, Subtitle } from "@/theme/Typography";
import React from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropProtectionEquipmentsQuery } from "./cropProtectionEquipment.hooks";
import { useHarvestingMachineryQuery } from "./harvestingMachinery.hooks";
import { useTillageEquipmentsQuery } from "./tillageEquipment.hooks";
import { useTranslation } from "react-i18next";
import { useFertilizerSpreadersQuery } from "./fertilizerSpreader.hooks";

export function MachineConfigsScreen({
  route,
  navigation,
}: MachineConfigsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { harvestingMachinery } = useHarvestingMachineryQuery();
  const { tillageEquipments } = useTillageEquipmentsQuery();
  const { cropProtectionEquipments } = useCropProtectionEquipmentsQuery();
  const { fertilizerSpreaders } = useFertilizerSpreadersQuery();

  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("farm_equipment.farm_equipment")}
      >
        <H2>{t("farm_equipment.farm_equipment")}</H2>
        <View style={{ marginTop: theme.spacing.m }}>
          <View style={{ marginBottom: theme.spacing.m }}>
            <H3>{t("harvests.harvest")}</H3>
          </View>
          {harvestingMachinery?.length === 0 && (
            <Subtitle>{t("common.no_entries")}</Subtitle>
          )}
          <View
            style={{
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: theme.colors.white,
            }}
          >
            {harvestingMachinery?.map((config) => (
              <ListItem
                key={config.id}
                style={{ paddingVertical: 5 }}
                onPress={() =>
                  navigation.navigate("EditHarvestingMachinery", {
                    harvestingMachineryId: config.id,
                  })
                }
              >
                <ListItem.Content>
                  <ListItem.Title>{config.name}</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            ))}
          </View>
        </View>
        <View style={{ marginTop: theme.spacing.m }}>
          <View style={{ marginBottom: theme.spacing.m }}>
            <H3>Düngung</H3>
          </View>
          {fertilizerSpreaders?.length === 0 && (
            <Subtitle>Keine Maschine vorhanden</Subtitle>
          )}
          <View
            style={{
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: theme.colors.white,
            }}
          >
            {fertilizerSpreaders?.map((fertilizerSpreader) => (
              <ListItem
                key={fertilizerSpreader.id}
                style={{ paddingVertical: 5 }}
                onPress={() =>
                  navigation.navigate("EditFertilizerSpreader", {
                    fertilizerSpreaderId: fertilizerSpreader.id,
                  })
                }
              >
                <ListItem.Content>
                  <ListItem.Title>{fertilizerSpreader.name}</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            ))}
          </View>
        </View>
        <View style={{ marginTop: theme.spacing.m }}>
          <View style={{ marginBottom: theme.spacing.m }}>
            <H3>{t("tillages.tillage")}</H3>
          </View>
          {tillageEquipments?.length === 0 && (
            <Subtitle>{t("common.no_entries")}</Subtitle>
          )}
          <View
            style={{
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: theme.colors.white,
            }}
          >
            {tillageEquipments?.map((equipment) => (
              <ListItem
                key={equipment.id}
                style={{ paddingVertical: 5 }}
                onPress={() =>
                  navigation.navigate("EditTillageEquipment", {
                    tillageEquipmentId: equipment.id,
                  })
                }
              >
                <ListItem.Content>
                  <ListItem.Title>{equipment.name}</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            ))}
          </View>
        </View>
        <View style={{ marginTop: theme.spacing.m }}>
          <View style={{ marginBottom: theme.spacing.m }}>
            <H3>{t("crop_protection_applications.crop_protection")}</H3>
          </View>
          {cropProtectionEquipments?.length === 0 && (
            <Subtitle>{t("common.no_entries")}</Subtitle>
          )}
          <View
            style={{
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: theme.colors.white,
            }}
          >
            {cropProtectionEquipments?.map((equipment) => (
              <ListItem
                key={equipment.id}
                style={{ paddingVertical: 5 }}
                onPress={() =>
                  navigation.navigate("EditCropProtectionEquipment", {
                    cropProtectionEquipmentId: equipment.id,
                  })
                }
              >
                <ListItem.Content>
                  <ListItem.Title>{equipment.name}</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            ))}
          </View>
        </View>
      </ScrollView>
      <FAB
        icon={{ name: "add", color: "white" }}
        onPress={() =>
          navigation.navigate("CreateFarmEquipment", { type: undefined })
        }
      />
    </ContentView>
  );
}
