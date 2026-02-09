import { Treatment } from "@/api/treatments.api";
import { StackScreenProps } from "@/navigation/rootStackTypes";

export type AnimalsStackParamList = {
  AnimalsHub: undefined;
  EarTags: undefined;
  CreateEarTagRange: undefined;
  Animals: undefined;
  AnimalDetails: { animalId: string };
  CreateAnimal: { motherId?: string; fatherId?: string } | undefined;
  EditAnimal: { animalId: string };
  SelectChildren: { animalId: string; sex: "male" | "female" };
  Drugs: undefined;
  CreateDrug: undefined;
  EditDrug: { drugId: string };
  Treatments: undefined;
  TreatmentsOfYear: { year: number; treatments: Treatment[] };
  CreateTreatment: { animalId?: string };
  EditTreatment: { treatmentId: string };
};

export type AnimalsHubScreenProps = StackScreenProps<"AnimalsHub">;
export type EarTagsScreenProps = StackScreenProps<"EarTags">;
export type CreateEarTagRangeScreenProps =
  StackScreenProps<"CreateEarTagRange">;
export type AnimalsScreenProps = StackScreenProps<"Animals">;
export type AnimalDetailsScreenProps = StackScreenProps<"AnimalDetails">;
export type CreateAnimalScreenProps = StackScreenProps<"CreateAnimal">;
export type EditAnimalScreenProps = StackScreenProps<"EditAnimal">;
export type SelectChildrenScreenProps = StackScreenProps<"SelectChildren">;
export type DrugsScreenProps = StackScreenProps<"Drugs">;
export type CreateDrugScreenProps = StackScreenProps<"CreateDrug">;
export type EditDrugScreenProps = StackScreenProps<"EditDrug">;
export type TreatmentsScreenProps = StackScreenProps<"Treatments">;
export type TreatmentsOfYearScreenProps = StackScreenProps<"TreatmentsOfYear">;
export type CreateTreatmentScreenProps = StackScreenProps<"CreateTreatment">;
export type EditTreatmentScreenProps = StackScreenProps<"EditTreatment">;
