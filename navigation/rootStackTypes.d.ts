import { CropProtectionUnit } from "@/api/cropProtectionProducts.api";
import { FertilizerUnit } from "@/api/fertilizers.api";
import { AgriColtivioStackParamList } from "@/features/agri-coltivio/navigation/agri-coltivio-routes";
import { AnimalsStackParamList } from "@/features/animals/navigation/animals-routes";
import { WikiStackParamList } from "@/features/wiki/navigation/wiki-routes";
import { TasksStackParamList } from "@/features/tasks/navigation/tasks-routes";
import { AuthStackParamList } from "@/features/auth/navigation/auth-routes";
import { CropProtectionApplicationStackParamList } from "@/features/crop-protection-applications/navigation/crop-protection-application-routes";
import { CropProtectionProductsStackParamList } from "@/features/crop-protection-products/navigation/crop-protection-product-routes";
import { CropRotationsStackParamList } from "@/features/crop-rotations/navigation/crop-rotations-routes";
import { CropFamiliesStackParamList } from "@/features/crop-families/navigation/crop-families-routes";
import { CropsStackParamList } from "@/features/crops/navigation/crops-routes";
import { ErrorStackParamList } from "@/features/errors/navigation/error-routes";
import { FarmStackParamList } from "@/features/farms/navigation/farm-routes";
import { FertilizerApplicationsStackParamList } from "@/features/fertilizer-application/navigation/fertilizer-application-routes";
import { FertilizerStackParamList } from "@/features/fertilizers/navigation/fertilizer-routes";
import { FieldCalendarStackParamList } from "@/features/field-calendar/navigation/field-calendar.routes";
import { HarvestStackParamList } from "@/features/harvests/navigation/harvest-routes";
import { HomeStackParamList } from "@/features/home/navigation/home-routes";
import { OnboardingStackParamList } from "@/features/onboarding/navigation/onboarding-routes";
import { PlotsStackParamList } from "@/features/plots/navigation/plots-routes";
import { TillagesStackParamList } from "@/features/tillages/navigation/tillages-routes";
import { UserStackParamList } from "@/features/user/navigation/user-routes";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = AuthStackParamList &
  ErrorStackParamList &
  OnboardingStackParamList &
  UserStackParamList &
  HomeStackParamList &
  FarmStackParamList &
  PlotsStackParamList &
  CropsStackParamList &
  CropFamiliesStackParamList &
  CropRotationsStackParamList &
  TillagesStackParamList &
  HarvestStackParamList &
  FertilizerApplicationsStackParamList &
  FertilizerStackParamList &
  CropProtectionProductsStackParamList &
  CropProtectionApplicationStackParamList &
  FieldCalendarStackParamList &
  AgriColtivioStackParamList &
  AnimalsStackParamList &
  WikiStackParamList &
  TasksStackParamList & {
    MapDrawOnboarding: { variant?: "draw" | "create" | "parcel" | "edit" | "cropRotation" | "plotsMap" } | undefined;
    SelectPlotsOnboarding: undefined;
  };

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type StackScreenProps<T> = NativeStackScreenProps<
  ReactNavigation.RootParamList,
  T
>;
