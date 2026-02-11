import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalsQuery } from "./animals.hooks";
import { useCreateHerdMutation } from "./herds.hooks";
import { CreateHerdScreenProps } from "./navigation/animals-routes";

interface CreateHerdFormValues {
  name: string;
}

export function CreateHerdScreen({
  route,
  navigation,
}: CreateHerdScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const previousScreen = route.params?.previousScreen;
  const { animals } = useAnimalsQuery(true);

  const [selectedAnimalIds, setSelectedAnimalIds] = useState<string[]>([]);

  // Handle returning from SelectAnimals
  const returnedAnimalIds = route.params?.animalIds;
  const [lastProcessedIds, setLastProcessedIds] = useState<string[] | null>(null);
  if (returnedAnimalIds && returnedAnimalIds !== lastProcessedIds) {
    setLastProcessedIds(returnedAnimalIds);
    setSelectedAnimalIds(returnedAnimalIds);
  }

  const selectedAnimals = animals?.filter((a) => selectedAnimalIds.includes(a.id)) ?? [];

  const animalsText = (() => {
    if (selectedAnimals.length === 0) return t("common.no_entries");
    if (selectedAnimals.length === 1) return selectedAnimals[0].name;
    return t("treatments.n_animals_selected", { count: selectedAnimals.length });
  })();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CreateHerdFormValues>({
    defaultValues: { name: "" },
  });

  const createHerdMutation = useCreateHerdMutation(
    (herd) => {
      if (previousScreen) {
        navigation.popTo(
          previousScreen,
          { herdId: herd.id },
          { merge: true },
        );
      } else {
        navigation.goBack();
      }
    },
    (error) => console.error(error),
  );

  function onSubmit(data: CreateHerdFormValues) {
    createHerdMutation.mutate({ name: data.name, animalIds: selectedAnimalIds });
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || createHerdMutation.isPending}
            loading={createHerdMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("animals.new_herd")}
        keyboardAware
      >
        <H2>{t("animals.new_herd")}</H2>
        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.xs }}>
          <RHTextInput
            name="name"
            control={control}
            label={t("animals.herd_name")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.name?.message}
          />
        </View>

        {/* Animals section — hidden when creating from animal form */}
        {!previousScreen && (
          <View style={{ marginTop: theme.spacing.l }}>
            <View
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 10,
                padding: theme.spacing.m,
                borderLeftWidth: 4,
                borderLeftColor: theme.colors.primary,
              }}
            >
              <Subtitle style={{ marginBottom: theme.spacing.xs }}>
                {t("animals.animals_in_herd")}
              </Subtitle>
              <ListItem
                style={{
                  backgroundColor: theme.colors.gray4,
                  borderRadius: 8,
                  paddingVertical: 12,
                }}
                onPress={() =>
                  navigation.navigate("SelectAnimals", {
                    initialSelectedIds: selectedAnimalIds,
                    previousScreen: "CreateHerd",
                  })
                }
              >
                <ListItem.Content>
                  <ListItem.Title
                    style={{
                      color:
                        selectedAnimals.length === 0
                          ? theme.colors.gray2
                          : undefined,
                    }}
                  >
                    {animalsText}
                  </ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            </View>
          </View>
        )}
      </ScrollView>
    </ContentView>
  );
}
