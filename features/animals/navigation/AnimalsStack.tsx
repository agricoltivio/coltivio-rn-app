import { Stack } from "@/navigation/stack";
import { AnimalsHubScreen } from "../AnimalsHubScreen";
import { EarTagsScreen } from "../EarTagsScreen";
import { CreateEarTagRangeScreen } from "../CreateEarTagRangeScreen";
import { AnimalsScreen } from "../AnimalsScreen";
import { AnimalDetailsScreen } from "../AnimalDetailsScreen";
import { CreateAnimalScreen } from "../CreateAnimalScreen";
import { EditAnimalScreen } from "../EditAnimalScreen";
import { SelectChildrenModal } from "../SelectChildrenModal";

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
  ];
}
