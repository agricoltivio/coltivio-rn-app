import { StackScreenProps } from "@react-navigation/native-stack";

export type AnimalsStackParamList = {
  AnimalsHub: undefined;
  AnimalsOnboarding: undefined;
  AnimalsSettings: undefined;
  EarTags: undefined;
  CreateEarTagRange: undefined;
  Animals: undefined;
  AnimalDetails: { animalId: string };
  CreateAnimal: {
    motherId?: string;
    fatherId?: string;
    herdId?: string;
  } | undefined;
  EditAnimal: { animalId?: string; herdId?: string };
  SelectChildren: { animalId: string; sex: "male" | "female" };
  SelectAnimals: {
    initialSelectedIds: string[];
    previousScreen: "CreateTreatment" | "EditTreatment" | "HerdEdit" | "CreateHerd";
  };
  Drugs: undefined;
  CreateDrug: { previousScreen?: "CreateTreatment" | "EditTreatment" };
  EditDrug: {
    drugId?: string;
    previousScreen?: "CreateTreatment" | "EditTreatment";
  };
  Treatments: undefined;
  CreateTreatment: { animalIds?: string[]; drugId?: string };
  EditTreatment: {
    treatmentId?: string;
    animalIds?: string[];
    drugId?: string;
  };
  TvdImport: undefined;
  Herds: undefined;
  OutdoorJournal: undefined;
  CreateHerd: { previousScreen?: "CreateAnimal" | "EditAnimal"; animalIds?: string[]; scheduleResult?: OutdoorScheduleEditResult };
  HerdEdit: { herdId?: string; animalIds?: string[]; scheduleResult?: OutdoorScheduleEditResult };
  OutdoorScheduleEdit: {
    previousScreen: "HerdEdit" | "CreateHerd";
    /** Existing schedule id (for update/delete in HerdEdit) or tempId (in CreateHerd) */
    scheduleId?: string;
    herdId?: string;
    schedule?: {
      startDate: string;
      endDate: string | null;
      recurrence: {
        frequency: "weekly" | "monthly" | "yearly";
        interval: number;
        until: string | null;
      } | null;
    };
  };
};

/** Result passed back from OutdoorScheduleEdit via popTo merge */
export type OutdoorScheduleEditResult = {
  action: "save" | "delete";
  scheduleId?: string;
  input?: {
    startDate: string;
    endDate: string | null;
    notes: string | null;
    recurrence: {
      frequency: "weekly" | "monthly" | "yearly";
      interval: number;
      until: string | null;
    } | null;
  };
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
export type SelectAnimalsScreenProps = StackScreenProps<"SelectAnimals">;
export type DrugsScreenProps = StackScreenProps<"Drugs">;
export type CreateDrugScreenProps = StackScreenProps<"CreateDrug">;
export type EditDrugScreenProps = StackScreenProps<"EditDrug">;
export type TreatmentsScreenProps = StackScreenProps<"Treatments">;
export type CreateTreatmentScreenProps = StackScreenProps<"CreateTreatment">;
export type EditTreatmentScreenProps = StackScreenProps<"EditTreatment">;
export type AnimalsOnboardingScreenProps =
  StackScreenProps<"AnimalsOnboarding">;
export type AnimalsSettingsScreenProps =
  StackScreenProps<"AnimalsSettings">;
export type TvdImportScreenProps = StackScreenProps<"TvdImport">;
export type HerdsScreenProps = StackScreenProps<"Herds">;
export type OutdoorJournalScreenProps = StackScreenProps<"OutdoorJournal">;
export type CreateHerdScreenProps = StackScreenProps<"CreateHerd">;
export type HerdEditScreenProps = StackScreenProps<"HerdEdit">;
export type OutdoorScheduleEditScreenProps = StackScreenProps<"OutdoorScheduleEdit">;
