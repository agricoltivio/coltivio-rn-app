import { Stack } from "@/navigation/stack";
import { CreateCropProtectionEquipmentScreen } from "../CreateCropProtectionEquipmentScreen";
import { CreateFarmEquipmentScreen } from "../CreateFarmEquipmentScreen";
import { CreateFertilizerSpreaderScreen } from "../CreateFertilizerSpreaderScreen";
import { CreateHarvestingMachineryScreen } from "../CreateHarvestMachineConfigScreen";
import { CreatetillageEquipmentScreen } from "../CreateTillageEquipmentScreen";
import { EditCropProtectionEquipmentScreen } from "../EditCropProtectionEquipmentScreen";
import { EditFertilizerSpreaderScreen } from "../EditFertilizerSpreaderScreen";
import { EditHarvestingMachineryScreen } from "../EditHarvestingMachineryScreen";
import { EditTillageEquipmentScreen } from "../EditTillageEquipmentScreen";
import { MachineConfigsScreen } from "../FarmEquipmentScreen";

export function renderEquipmentStack() {
  return [
    <Stack.Screen
      key="machine-configs"
      name="MachineConfigs"
      options={{
        title: "",
      }}
      component={MachineConfigsScreen}
    />,
    <Stack.Screen
      key="create-farm-equipment"
      name="CreateFarmEquipment"
      options={{
        title: "",
      }}
      component={CreateFarmEquipmentScreen}
    />,
    <Stack.Screen
      key="create-harvesting-machinery"
      name="CreateHarvestingMachinery"
      options={{
        title: "",
      }}
      component={CreateHarvestingMachineryScreen}
    />,
    <Stack.Screen
      key="edit-harvesting-machinery"
      name="EditHarvestingMachinery"
      options={{
        title: "",
      }}
      component={EditHarvestingMachineryScreen}
    />,
    <Stack.Screen
      key="create-fertilizer-spreader"
      name="CreateFertilizerSpreader"
      options={{
        title: "",
      }}
      component={CreateFertilizerSpreaderScreen}
    />,
    <Stack.Screen
      key="edit-fertilizer-spreader"
      name="EditFertilizerSpreader"
      options={{
        title: "",
      }}
      component={EditFertilizerSpreaderScreen}
    />,
    <Stack.Screen
      key="create-crop-protection-equipment"
      name="CreateCropProtectionEquipment"
      options={{
        title: "",
      }}
      component={CreateCropProtectionEquipmentScreen}
    />,
    <Stack.Screen
      key="edit-crop-protection-equipment"
      name="EditCropProtectionEquipment"
      options={{
        title: "",
      }}
      component={EditCropProtectionEquipmentScreen}
    />,
    <Stack.Screen
      key="create-tillage-equipment"
      name="CreateTillageEquipment"
      options={{
        title: "",
      }}
      component={CreatetillageEquipmentScreen}
    />,
    <Stack.Screen
      key="edit-tillage-equipment"
      name="EditTillageEquipment"
      options={{
        title: "",
      }}
      component={EditTillageEquipmentScreen}
    />,
  ];
}
