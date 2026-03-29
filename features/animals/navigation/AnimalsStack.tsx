import { Stack } from "@/navigation/stack";
import { AnimalsHubScreen } from "../AnimalsHubScreen";
import { EarTagsScreen } from "../EarTagsScreen";
import { CreateEarTagRangeScreen } from "../CreateEarTagRangeScreen";
import { AnimalsScreen } from "../AnimalsScreen";
import { AnimalDetailsScreen } from "../AnimalDetailsScreen";
import { CreateAnimalScreen } from "../CreateAnimalScreen";
import { EditAnimalScreen } from "../EditAnimalScreen";
import { SelectChildrenModal } from "../SelectChildrenModal";
import { SelectAnimalsModal } from "../SelectAnimalsModal";
import { DrugsScreen } from "../DrugsScreen";
import { CreateDrugScreen } from "../CreateDrugScreen";
import { EditDrugScreen } from "../EditDrugScreen";
import { TreatmentsScreen } from "../TreatmentsScreen";

import { CreateTreatmentScreen } from "../CreateTreatmentScreen";
import { EditTreatmentScreen } from "../EditTreatmentScreen";
import { AnimalsOnboardingScreen } from "../AnimalsOnboardingScreen";
import { AnimalsSettingsScreen } from "../AnimalsSettingsScreen";
import { TvdImportScreen } from "../TvdImportScreen";
import { TvdImportOnboardingScreen } from "../TvdImportOnboardingScreen";
import { HerdsScreen } from "../HerdsScreen";
import { CreateHerdScreen } from "../CreateHerdScreen";
import { HerdEditScreen } from "../HerdEditScreen";
import { OutdoorJournalScreen } from "../OutdoorJournalScreen";
import { OutdoorJournalExportScreen } from "../OutdoorJournalExportScreen";
import { TreatmentsExportScreen } from "../TreatmentsExportScreen";
import { HerdsOnboardingScreen } from "../HerdsOnboardingScreen";
import { BatchSelectAnimalsScreen } from "../BatchSelectAnimalsScreen";
import { BatchEditActionScreen } from "../BatchEditActionScreen";
import { UncategorizedAnimalsScreen } from "../UncategorizedAnimalsScreen";
import { ManageAnimalCategoriesScreen } from "../ManageAnimalCategoriesScreen";
import { AnimalJournalScreen } from "../AnimalJournalScreen";
import { AnimalJournalEntryScreen } from "../AnimalJournalEntryScreen";
import { AnimalJournalEntryFormScreen } from "../AnimalJournalEntryFormScreen";
import { IonIconButton } from "@/components/buttons/IconButton";
import { DefaultTheme } from "styled-components/native";

export function renderAnimalsStack(theme: DefaultTheme, navigation: any) {
  return [
    <Stack.Screen
      key="animals-hub"
      name="AnimalsHub"
      options={{
        title: "",
        headerRight() {
          return (
            <IonIconButton
              icon="settings-outline"
              type="ghost"
              iconSize={30}
              color={theme.colors.primary}
              onPress={() => navigation.navigate("AnimalsSettings")}
            />
          );
        },
      }}
      component={AnimalsHubScreen}
    />,
    <Stack.Screen
      key="ear-tags"
      name="EarTags"
      options={{ title: "" }}
      component={EarTagsScreen}
    />,
    <Stack.Screen
      key="create-ear-tag-range"
      name="CreateEarTagRange"
      options={{ title: "" }}
      component={CreateEarTagRangeScreen}
    />,
    <Stack.Screen
      key="animals"
      name="Animals"
      options={{ title: "" }}
      component={AnimalsScreen}
    />,
    <Stack.Screen
      key="animal-details"
      name="AnimalDetails"
      options={{ title: "" }}
      component={AnimalDetailsScreen}
    />,
    <Stack.Screen
      key="create-animal"
      name="CreateAnimal"
      options={{ title: "" }}
      component={CreateAnimalScreen}
    />,
    <Stack.Screen
      key="edit-animal"
      name="EditAnimal"
      options={{ title: "" }}
      component={EditAnimalScreen}
    />,
    <Stack.Screen
      key="select-children"
      name="SelectChildren"
      options={{ title: "", presentation: "modal" }}
      component={SelectChildrenModal}
    />,
    <Stack.Screen
      key="select-animals"
      name="SelectAnimals"
      options={{ title: "", presentation: "modal" }}
      component={SelectAnimalsModal}
    />,
    <Stack.Screen
      key="drugs"
      name="Drugs"
      options={{ title: "" }}
      component={DrugsScreen}
    />,
    <Stack.Screen
      key="create-drug"
      name="CreateDrug"
      options={{ title: "" }}
      component={CreateDrugScreen}
    />,
    <Stack.Screen
      key="edit-drug"
      name="EditDrug"
      options={{ title: "" }}
      component={EditDrugScreen}
    />,
    <Stack.Screen
      key="treatments"
      name="Treatments"
      options={{
        title: "",
        headerRight() {
          return (
            <IonIconButton
              icon="share-outline"
              type="ghost"
              iconSize={30}
              color={theme.colors.primary}
              onPress={() => navigation.navigate("TreatmentsExport")}
            />
          );
        },
      }}
      component={TreatmentsScreen}
    />,
    <Stack.Screen
      key="treatments-export"
      name="TreatmentsExport"
      options={{ title: "" }}
      component={TreatmentsExportScreen}
    />,
    <Stack.Screen
      key="create-treatment"
      name="CreateTreatment"
      options={{ title: "" }}
      component={CreateTreatmentScreen}
    />,
    <Stack.Screen
      key="edit-treatment"
      name="EditTreatment"
      options={{ title: "" }}
      component={EditTreatmentScreen}
    />,
    <Stack.Screen
      key="animals-onboarding"
      name="AnimalsOnboarding"
      options={{ headerShown: false }}
      component={AnimalsOnboardingScreen}
    />,
    <Stack.Screen
      key="animals-settings"
      name="AnimalsSettings"
      options={{ title: "" }}
      component={AnimalsSettingsScreen}
    />,
    <Stack.Screen
      key="tvd-import-onboarding"
      name="TvdImportOnboarding"
      options={{ title: "", headerShown: false }}
      component={TvdImportOnboardingScreen}
    />,
    <Stack.Screen
      key="tvd-import"
      name="TvdImport"
      options={{ title: "" }}
      component={TvdImportScreen}
    />,
    <Stack.Screen
      key="herds"
      name="Herds"
      options={{ title: "" }}
      component={HerdsScreen}
    />,
    <Stack.Screen
      key="create-herd"
      name="CreateHerd"
      options={{ title: "" }}
      component={CreateHerdScreen}
    />,
    <Stack.Screen
      key="herd-edit"
      name="HerdEdit"
      options={{ title: "" }}
      component={HerdEditScreen}
    />,
    <Stack.Screen
      key="outdoor-journal"
      name="OutdoorJournal"
      options={{
        title: "",
        headerRight() {
          return (
            <IonIconButton
              icon="share-outline"
              type="ghost"
              iconSize={30}
              color={theme.colors.primary}
              onPress={() => navigation.navigate("OutdoorJournalExport")}
            />
          );
        },
      }}
      component={OutdoorJournalScreen}
    />,
    <Stack.Screen
      key="outdoor-journal-export"
      name="OutdoorJournalExport"
      options={{ title: "" }}
      component={OutdoorJournalExportScreen}
    />,
    <Stack.Screen
      key="herds-onboarding"
      name="HerdsOnboarding"
      options={{ headerShown: false }}
      component={HerdsOnboardingScreen}
    />,
    <Stack.Screen
      key="batch-select-animals"
      name="BatchSelectAnimals"
      options={{ title: "" }}
      component={BatchSelectAnimalsScreen}
    />,
    <Stack.Screen
      key="batch-edit-action"
      name="BatchEditAction"
      options={{ title: "" }}
      component={BatchEditActionScreen}
    />,
    <Stack.Screen
      key="uncategorized-animals"
      name="UncategorizedAnimals"
      options={{ title: "" }}
      component={UncategorizedAnimalsScreen}
    />,
    <Stack.Screen
      key="manage-animal-categories"
      name="ManageAnimalCategories"
      options={{ title: "" }}
      component={ManageAnimalCategoriesScreen}
    />,
    <Stack.Screen
      key="animal-journal"
      name="AnimalJournal"
      options={{ title: "" }}
      component={AnimalJournalScreen}
    />,
    <Stack.Screen
      key="animal-journal-entry"
      name="AnimalJournalEntry"
      options={{ title: "" }}
      component={AnimalJournalEntryScreen}
    />,
    <Stack.Screen
      key="animal-journal-entry-form"
      name="AnimalJournalEntryForm"
      options={{ title: "" }}
      component={AnimalJournalEntryFormScreen}
    />,
  ];
}
