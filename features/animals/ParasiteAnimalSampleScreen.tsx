import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalByIdQuery } from "./animals.hooks";
import { ParasiteAnimalSampleScreenProps } from "./navigation/animals-routes";
import { animalDisplayName } from "./ParasiteCharts";
import { ParasiteResultsEditor } from "./ParasiteResultsEditor";
import {
  nextResultKey,
  useParasiteSampleDraftStore,
} from "./parasite-sample-draft.store";

export function ParasiteAnimalSampleScreen({
  route,
  navigation,
}: ParasiteAnimalSampleScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { animalId } = route.params;
  const { animal } = useAnimalByIdQuery(animalId);
  const animalResults = useParasiteSampleDraftStore(
    (state) => state.individualResults[animalId],
  );
  const setAnimalResults = useParasiteSampleDraftStore(
    (state) => state.setAnimalResults,
  );

  // Start with one empty strongyles row for a new animal (stable key until first edit)
  const [emptyRowKey] = useState(() => nextResultKey());
  const results = animalResults ?? [
    { key: emptyRowKey, parasiteType: "strongyles", countPerGram: "" },
  ];

  const title = animal
    ? animalDisplayName(animal.name, animal.earTag?.number)
    : "";

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.finish")}
            onPress={() => navigation.goBack()}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={title} keyboardAware>
        <H2>{title}</H2>
        <Subtitle style={{ color: theme.colors.gray2, marginTop: 4 }}>
          {t("parasite_checks.individual_sample")}
        </Subtitle>
        <View style={{ marginTop: theme.spacing.m }}>
          <ParasiteResultsEditor
            results={results}
            onChange={(updatedResults) =>
              setAnimalResults(animalId, updatedResults)
            }
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
