import { StackScreenProps } from "@/navigation/rootStackTypes";

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
export type MachineConfigsScreenProps = StackScreenProps<"MachineConfigs">;

export type CreateFarmEquipmentScreenProps =
  StackScreenProps<"CreateFarmEquipment">;

export type CreateHarvestingMachineryScreenProps =
  StackScreenProps<"CreateHarvestingMachinery">;

export type EditHarvestingMachineryScreenProps =
  StackScreenProps<"EditHarvestingMachinery">;

export type CreateFertilizerSpreaderScreenProps =
  StackScreenProps<"CreateFertilizerSpreader">;

export type EditFertilizerSpreaderScreenProps =
  StackScreenProps<"EditFertilizerSpreader">;

export type CreateCropProtectionEquipmentScreenProps =
  StackScreenProps<"CreateCropProtectionEquipment">;

export type EditCropProtectionEquipmentScreenProps =
  StackScreenProps<"EditCropProtectionEquipment">;

export type CreateTillageEquipmentScreenProps =
  StackScreenProps<"CreateTillageEquipment">;

export type EditTillageEquipmentScreenProps =
  StackScreenProps<"EditTillageEquipment">;
