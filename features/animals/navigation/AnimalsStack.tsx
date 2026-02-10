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
import { TreatmentsOfYearScreen } from "../TreatmentsOfYearScreen";
import { CreateTreatmentScreen } from "../CreateTreatmentScreen";
import { EditTreatmentScreen } from "../EditTreatmentScreen";

export function renderAnimalsStack() {
  return [
    <Stack.Screen
      key="animals-hub"
      name="AnimalsHub"
      options={{ title: "" }}
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
      options={{ title: "" }}
      component={TreatmentsScreen}
    />,
    <Stack.Screen
      key="treatments-of-year"
      name="TreatmentsOfYear"
      options={{ title: "" }}
      component={TreatmentsOfYearScreen}
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
  ];
}
