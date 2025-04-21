import { Button } from "@/components/buttons/Button";
import { ContentView } from "@/components/containers/ContentView";
import { Select } from "@/components/select/Select";
import { CreateFarmEquipmentScreenProps } from "@/navigation/rootStackTypes";
import { H2 } from "@/theme/Typography";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

export function CreateFarmEquipmentScreen({
  route,
  navigation,
}: CreateFarmEquipmentScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [type, setType] = useState(route.params.type ?? "");

  function onSelect(value: string) {
    switch (value) {
      case "harvest": {
        navigation.navigate("CreateHarvestingMachinery");
        break;
      }
      case "tillage": {
        navigation.navigate("CreateTillageEquipment");
        break;
      }
      case "cropProtection": {
        navigation.navigate("CreateCropProtectionEquipment", {});
        break;
      }
      case "fertilization": {
        navigation.navigate("CreateFertilizerSpreader", {});
        break;
      }
    }
  }

  return (
    <ContentView headerVisible>
      <H2>{t("farm_equipment.new_equipment")}</H2>
      <View style={{ marginTop: theme.spacing.m, flex: 1 }}>
        <Select
          label={t("forms.labels.type")}
          value={type}
          onChange={setType}
          data={[
            {
              label: t("farm_equipment.device_types.harvest"),
              value: "harvest",
            },
            {
              label: t("farm_equipment.device_types.tillage"),
              value: "tillage",
            },
            {
              label: t("farm_equipment.device_types.crop_protection"),
              value: "cropProtection",
            },
            {
              label: t("farm_equipment.device_types.fertilization"),
              value: "fertilization",
            },
          ]}
        />
      </View>
      <Button
        style={{ marginTop: theme.spacing.m }}
        title={t("buttons.next")}
        onPress={() => onSelect(type)}
        disabled={!type}
      />
    </ContentView>
  );
}
