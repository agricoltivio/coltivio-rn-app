import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type EquipmentStackParamList = {
  MachineConfigs: undefined;
  CreateFarmEquipment: {
    type?: "forage" | "fertilization" | "tillage" | "cropProtection";
  };
  CreateHarvestingMachinery: undefined;
  CreateFertilizerSpreader: { unit?: FertilizerUnit };
  EditHarvestingMachinery: { harvestingMachineryId: string };
  EditFertilizerSpreader: { fertilizerSpreaderId: string };
  CreateCropProtectionEquipment: { unit?: CropProtectionUnit };
  EditCropProtectionEquipment: { cropProtectionEquipmentId: string };
  CreateTillageEquipment: undefined;
  EditTillageEquipment: { tillageEquipmentId: string };
};
export type MachineConfigsScreenProps = NativeStackScreenProps<
  EquipmentStackParamList,
  "MachineConfigs"
>;

export type CreateFarmEquipmentScreenProps = NativeStackScreenProps<
  EquipmentStackParamList,
  "CreateFarmEquipment"
>;

export type CreateHarvestingMachineryScreenProps = NativeStackScreenProps<
  EquipmentStackParamList,
  "CreateHarvestingMachinery"
>;

export type EditHarvestingMachineryScreenProps = NativeStackScreenProps<
  EquipmentStackParamList,
  "EditHarvestingMachinery"
>;

export type CreateFertilizerSpreaderScreenProps = NativeStackScreenProps<
  EquipmentStackParamList,
  "CreateFertilizerSpreader"
>;

export type EditFertilizerSpreaderScreenProps = NativeStackScreenProps<
  EquipmentStackParamList,
  "EditFertilizerSpreader"
>;

export type CreateCropProtectionEquipmentScreenProps = NativeStackScreenProps<
  EquipmentStackParamList,
  "CreateCropProtectionEquipment"
>;

export type EditCropProtectionEquipmentScreenProps = NativeStackScreenProps<
  EquipmentStackParamList,
  "EditCropProtectionEquipment"
>;

export type CreateTillageEquipmentScreenProps = NativeStackScreenProps<
  EquipmentStackParamList,
  "CreateTillageEquipment"
>;

export type EditTillageEquipmentScreenProps = NativeStackScreenProps<
  EquipmentStackParamList,
  "EditTillageEquipment"
>;
