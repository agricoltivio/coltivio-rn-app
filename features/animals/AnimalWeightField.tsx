import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { RootStackParamList } from "@/navigation/rootStackTypes";
import { H3 } from "@/theme/Typography";
import { formatLocalizedDate, parseDateOnly } from "@/utils/date";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RefObject, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, useWindowDimensions, View } from "react-native";
import { useTheme } from "styled-components/native";
import { AnimalWeightChart } from "./AnimalWeightChart";
import { AnimalWeightDrawer, DrawerWeight } from "./AnimalWeightDrawer";
import { useAnimalWeightsQuery } from "./breeding.hooks";

// "420 kg · 1.6.2025"
export function formatDrawerWeight(weight: DrawerWeight, locale: string) {
  return `${weight.weightKg} kg · ${formatLocalizedDate(weight.date, locale)}`;
}

// Weight input of the animal form: opens the weight drawer, the chart icon opens the weight timeline
export function AnimalWeightField({
  animalId,
  currentWeight,
  onPendingWeightChange,
  disabled,
}: {
  animalId?: string;
  currentWeight: DrawerWeight | null;
  onPendingWeightChange?: (weight: DrawerWeight) => void;
  disabled?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const weightSheetRef = useRef<BottomSheetModal>(null);
  const chartSheetRef = useRef<BottomSheetModal>(null);
  const { weights } = useAnimalWeightsQuery(animalId ?? "", !!animalId);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.xs,
      }}
    >
      <View style={{ flex: 1 }}>
        <Pressable
          disabled={disabled}
          onPress={() => weightSheetRef.current?.present()}
        >
          <View pointerEvents="none">
            <TextInput
              label={t("breeding.weight")}
              value={
                currentWeight
                  ? formatDrawerWeight(currentWeight, i18n.language)
                  : ""
              }
              placeholder={t("breeding.no_weight")}
              disabled={disabled}
            />
          </View>
        </Pressable>
      </View>
      {(weights?.length ?? 0) >= 2 && (
        <MaterialCommunityIconButton
          type="accent"
          icon="chart-line"
          iconSize={22}
          color={theme.colors.primary}
          onPress={() => chartSheetRef.current?.present()}
        />
      )}
      <AnimalWeightDrawer
        sheetRef={weightSheetRef}
        animalId={animalId}
        currentWeight={currentWeight}
        onPendingWeightChange={onPendingWeightChange}
      />
      {animalId && (
        <AnimalWeightChartDrawer
          sheetRef={chartSheetRef}
          animalId={animalId}
          canEdit={!disabled}
        />
      )}
    </View>
  );
}

// Weight timeline with all entries, tapping an entry opens it for editing or deleting
export function AnimalWeightChartDrawer({
  sheetRef,
  animalId,
  canEdit,
}: {
  sheetRef: RefObject<BottomSheetModal | null>;
  animalId: string;
  canEdit: boolean;
}) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const portalKey = useId();
  const { weights } = useAnimalWeightsQuery(animalId);
  const { height: windowHeight } = useWindowDimensions();

  return (
    <Portal>
      <BottomSheetModalProvider key={portalKey}>
        <BottomDrawerModal
          ref={sheetRef}
          // As high as the chart and entries need, long histories scroll
          maxContentHeight={windowHeight * 0.85}
        >
          <View style={{ gap: theme.spacing.m }}>
            <H3>{t("breeding.weight_history")}</H3>
            {weights && weights.length >= 2 && (
              <AnimalWeightChart weights={weights} />
            )}
            <View>
              {[...(weights ?? [])].reverse().map((weight) => (
                <ListItem
                  key={weight.id}
                  style={{ paddingVertical: 5 }}
                  onPress={
                    canEdit
                      ? () => {
                          sheetRef.current?.dismiss();
                          navigation.navigate("AnimalWeightForm", {
                            animalId,
                            weightId: weight.id,
                          });
                        }
                      : undefined
                  }
                >
                  <ListItem.Content>
                    <ListItem.Title>{weight.weightKg} kg</ListItem.Title>
                    <ListItem.Body>
                      {formatLocalizedDate(
                        parseDateOnly(weight.date),
                        i18n.language,
                      )}
                      {weight.notes ? ` · ${weight.notes}` : ""}
                    </ListItem.Body>
                  </ListItem.Content>
                  {canEdit && <ListItem.Chevron />}
                </ListItem>
              ))}
            </View>
          </View>
        </BottomDrawerModal>
      </BottomSheetModalProvider>
    </Portal>
  );
}
