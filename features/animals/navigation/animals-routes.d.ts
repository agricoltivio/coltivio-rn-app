import type {
  OutdoorScheduleFormResult,
  ScheduleEditData,
} from "../OutdoorScheduleFormScreen";
import { StackScreenProps } from "@react-navigation/native-stack";
import { UncategorizedAnimal } from "@/api/outdoor-journal.api";
import { AnimalType, ParsedImportRow } from "@/api/animals.api";

export type EditablePreviewRow = ParsedImportRow & {
  mergeAnimalId: string | null;
};

export type AnimalsStackParamList = {
  AnimalsHub: undefined;
  AnimalsOnboarding: undefined;
  AnimalsSettings: undefined;
  EarTags: undefined;
  CreateEarTagRange: undefined;
  Animals: undefined;
  AnimalDetails: { animalId: string };
  CreateAnimal:
    | {
        motherId?: string;
        fatherId?: string;
        herdId?: string;
      }
    | undefined;
  EditAnimal: { animalId?: string; herdId?: string };
  SelectChildren: { animalId: string; sex: "male" | "female" };
  SelectAnimals: {
    initialSelectedIds: string[];
    previousScreen:
      | "CreateTreatment"
      | "EditTreatment"
      | "HerdEdit"
      | "CreateHerd";
  };
  Drugs: undefined;
  CreateDrug: { previousScreen?: "CreateTreatment" | "EditTreatment" };
  EditDrug: {
    drugId?: string;
    previousScreen?: "CreateTreatment" | "EditTreatment";
  };
  Treatments: undefined;
  TreatmentsExport: undefined;
  CreateTreatment: { animalIds?: string[]; drugId?: string };
  EditTreatment: {
    treatmentId?: string;
    animalIds?: string[];
    drugId?: string;
  };
  TvdImport: undefined;
  TvdImportOnboarding: undefined;
  TvdImportPreview: {
    rows: ParsedImportRow[];
    type: AnimalType;
    rowEdit?: { rowIndex: number; updatedRow: EditablePreviewRow };
  };
  TvdImportRowDetail: {
    rowIndex: number;
    row: EditablePreviewRow;
    type: AnimalType;
  };
  Herds: undefined;
  OutdoorJournal: undefined;
  MeadowDetails: { meadowId: string };
  MeadowOverview: { meadowId: string };
  // returnTo "OutdoorScheduleForm": the map was opened from the schedule form (the only
  // screen that opens the map in a meadow flow), go back there after creating
  MeadowSummary: {
    meadowId?: string;
    returnTo?: "map" | "OutdoorScheduleForm";
  };
  OutdoorJournalExport: undefined;
  HerdsOnboarding: undefined;
  CreateHerd: {
    previousScreen?: "CreateAnimal" | "EditAnimal";
    animalIds?: string[];
    scheduleResult?: OutdoorScheduleFormResult;
  };
  HerdEdit: {
    herdId?: string;
    animalIds?: string[];
    scheduleResult?: OutdoorScheduleFormResult;
  };
  OutdoorScheduleForm: {
    previousScreen: "HerdEdit" | "CreateHerd";
    canDelete: boolean;
    schedule?: ScheduleEditData;
    // Set by MeadowSummary when returning from creating a meadow
    createdMeadowId?: string;
  };
  BatchSelectAnimals: undefined;
  BatchEditAction: { animalIds: string[] };
  UncategorizedAnimals: { animals: UncategorizedAnimal[] };
  ManageAnimalCategories: { animalId: string };
  AnimalJournal: { animalId: string };
  AnimalJournalEntry: { entryId: string; animalId: string };
  AnimalJournalEntryForm: { animalId: string; entryId?: string };
  AnimalCharts: undefined;
  FamilyTree: { animalType?: AnimalType; focusedAnimalId?: string };
  AnimalsExport: undefined;
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
export type AnimalsSettingsScreenProps = StackScreenProps<"AnimalsSettings">;
export type TvdImportScreenProps = StackScreenProps<"TvdImport">;
export type TvdImportOnboardingScreenProps =
  StackScreenProps<"TvdImportOnboarding">;
export type TvdImportPreviewScreenProps = StackScreenProps<"TvdImportPreview">;
export type TvdImportRowDetailScreenProps =
  StackScreenProps<"TvdImportRowDetail">;
export type HerdsScreenProps = StackScreenProps<"Herds">;
export type OutdoorJournalScreenProps = StackScreenProps<"OutdoorJournal">;
export type MeadowDetailsScreenProps = StackScreenProps<"MeadowDetails">;
export type MeadowOverviewScreenProps = StackScreenProps<"MeadowOverview">;
export type MeadowSummaryScreenProps = StackScreenProps<"MeadowSummary">;
export type OutdoorJournalExportScreenProps =
  StackScreenProps<"OutdoorJournalExport">;
export type TreatmentsExportScreenProps = StackScreenProps<"TreatmentsExport">;
export type HerdsOnboardingScreenProps = StackScreenProps<"HerdsOnboarding">;
export type CreateHerdScreenProps = StackScreenProps<"CreateHerd">;
export type HerdEditScreenProps = StackScreenProps<"HerdEdit">;
export type OutdoorScheduleFormScreenProps =
  StackScreenProps<"OutdoorScheduleForm">;
export type BatchSelectAnimalsScreenProps =
  StackScreenProps<"BatchSelectAnimals">;
export type BatchEditActionScreenProps = StackScreenProps<"BatchEditAction">;
export type UncategorizedAnimalsScreenProps =
  StackScreenProps<"UncategorizedAnimals">;
export type ManageAnimalCategoriesScreenProps =
  StackScreenProps<"ManageAnimalCategories">;
export type AnimalJournalScreenProps = StackScreenProps<"AnimalJournal">;
export type AnimalJournalEntryScreenProps =
  StackScreenProps<"AnimalJournalEntry">;
export type AnimalJournalEntryFormScreenProps =
  StackScreenProps<"AnimalJournalEntryForm">;
export type AnimalChartsScreenProps = StackScreenProps<"AnimalCharts">;
export type FamilyTreeScreenProps = StackScreenProps<"FamilyTree">;
export type AnimalsExportScreenProps = StackScreenProps<"AnimalsExport">;
