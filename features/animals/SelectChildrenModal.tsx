import { AnimalWithWaitingTimeFlag } from "@/api/animals.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { H2 } from "@/theme/Typography";
import Fuse from "fuse.js";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useAnimalByIdQuery,
  useAnimalsQuery,
  useBatchUpdateAnimalsMutation,
} from "./animals.hooks";
import { SelectChildrenScreenProps } from "./navigation/animals-routes";

export function SelectChildrenModal({
  route,
  navigation,
}: SelectChildrenScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { animalId, sex } = route.params;
  const { animal } = useAnimalByIdQuery(animalId);
  const { animals: livingAnimals } = useAnimalsQuery(
    true,
    animal ? [animal?.type] : undefined,
    !!animal,
  );
  const [searchText, setSearchText] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const batchUpdateMutation = useBatchUpdateAnimalsMutation(() => {
    navigation.goBack();
  });

  // Get existing children IDs so we can exclude them
  const existingChildIds = useMemo(() => {
    if (!animal) return new Set<string>();
    const ids = new Set<string>();
    for (const child of animal.childrenAsMother ?? []) {
      ids.add(child.id);
    }
    for (const child of animal.childrenAsFather ?? []) {
      ids.add(child.id);
    }
    return ids;
  }, [animal]);

  // Filter out the animal itself, dead animals, and already-assigned children
  const availableAnimals = useMemo(() => {
    if (!livingAnimals) return [];
    return livingAnimals
      .filter((a) => a.id !== animalId && !existingChildIds.has(a.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [livingAnimals, animalId, existingChildIds]);

  // Fuse.js search
  const fuse = new Fuse(availableAnimals, {
    minMatchCharLength: 1,
    keys: ["name", "type", "earTag.number"],
  });

  let searchResult = availableAnimals;
  if (searchText.length > 0) {
    searchResult = fuse.search(searchText).map((result) => result.item);
  }

  function toggleSelection(animalItemId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(animalItemId)) {
        next.delete(animalItemId);
      } else {
        next.add(animalItemId);
      }
      return next;
    });
  }

  function handleConfirm() {
    if (selectedIds.size === 0) return;
    const parentField = sex === "female" ? "motherId" : "fatherId";
    batchUpdateMutation.mutate({
      animalIds: Array.from(selectedIds),
      data: {
        [parentField]: animalId,
      },
    });
  }

  const renderItem = useCallback(
    ({ item }: { item: AnimalWithWaitingTimeFlag }) => (
      <ListItem
        style={{ paddingVertical: 5 }}
        onPress={() => toggleSelection(item.id)}
      >
        <ListItem.Checkbox checked={selectedIds.has(item.id)} />
        <ListItem.Content>
          <ListItem.Title>{item.name}</ListItem.Title>
          <ListItem.Body>
            {t(`animals.animal_types.${item.type}` as const)}
            {item.earTag ? ` - ${item.earTag.number}` : ""}
          </ListItem.Body>
        </ListItem.Content>
      </ListItem>
    ),
    [selectedIds, t],
  );

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.confirm")}
            onPress={handleConfirm}
            disabled={selectedIds.size === 0 || batchUpdateMutation.isPending}
            loading={batchUpdateMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <H2>{t("animals.select_children")}</H2>
      <View style={{ marginVertical: theme.spacing.m }}>
        <TextInput
          hideLabel
          placeholder={t("forms.placeholders.search")}
          onChangeText={setSearchText}
          value={searchText}
        />
      </View>
      <FlatList
        contentContainerStyle={{
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
          overflow: "hidden",
          backgroundColor: theme.colors.white,
        }}
        data={searchResult}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </ContentView>
  );
}
