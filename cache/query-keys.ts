import { animalsQueryKeys } from "@/features/animals/animals.querykeys";
import { earTagsQueryKeys } from "@/features/animals/earTags.querykeys";
import { drugsQueryKeys } from "@/features/animals/drugs.querykeys";
import { treatmentsQueryKeys } from "@/features/animals/treatments.querykeys";
import { farmParcelsQueryKeys } from "@/features/farm-parcels/farmParcels.querykeys";
import { farmsQueryKeys } from "@/features/farms/farms.querykeys";
import { federalParcelsQueryKeys } from "@/features/federal-plots/federalPlots.querykeys";
import { geoAdminQueryKeys } from "@/features/geoadmin/geoadmin.querykeys";
import { parcelLayerQueryKeys } from "@/features/map/map.query-keys";
import { userQueryKeys } from "@/features/user/users.querykeys";
import { mergeQueryKeys } from "@lukemorales/query-key-factory";
import { harvestsQueryKeys } from "@/features/harvests/harvests.querykeys";
import { fertilizerApplicationsQueryKeys } from "@/features/fertilizer-application/fertilizerApplications.querykeys";
import { fertilizersQueryKeys } from "@/features/fertilizers/fertilizers.querykeys";
import { cropsQueryKeys } from "@/features/crops/crops.querykeys";
import { plotsQueryKeys } from "@/features/plots/plots.querykeys";
import { fertilizerSpreadersQueryKeys } from "@/features/equipment/fertilizerSpreader.querykeys";
import { harvestingMachineryQueryKeys } from "@/features/equipment/harvestingMachinery.querykeys";
import { cropRotationsQueryKeys } from "@/features/crop-rotations/crop-rotations.querykeys";
import { tillagesQueryKeys } from "@/features/tillages/tillages.querykeys";
import { tillageEquipmentQueryKeys } from "@/features/equipment/tillageEquipment.querykeys";
import { cropProtectionProductsQueryKeys } from "@/features/crop-protection-products/cropProtectionProduct.querykeys";
import { cropProtectionApplicationsQueryKeys } from "@/features/crop-protection-applications/cropProtectionApplications.querykeys";
import { cropProtectionEquipmentsQueryKeys } from "@/features/equipment/cropProtectionEquipment.querykeys";

export const queryKeys = mergeQueryKeys(
  animalsQueryKeys,
  earTagsQueryKeys,
  drugsQueryKeys,
  treatmentsQueryKeys,
  parcelLayerQueryKeys,
  federalParcelsQueryKeys,
  farmsQueryKeys,
  userQueryKeys,
  plotsQueryKeys,
  farmParcelsQueryKeys,
  geoAdminQueryKeys,
  cropsQueryKeys,
  harvestingMachineryQueryKeys,
  harvestsQueryKeys,
  fertilizerApplicationsQueryKeys,
  fertilizersQueryKeys,
  fertilizerSpreadersQueryKeys,
  cropRotationsQueryKeys,
  tillagesQueryKeys,
  tillageEquipmentQueryKeys,
  cropProtectionProductsQueryKeys,
  cropProtectionApplicationsQueryKeys,
  cropProtectionEquipmentsQueryKeys
);
