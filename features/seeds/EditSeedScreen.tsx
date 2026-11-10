import { Seed } from "@/api/seeds.api";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { usePermissions } from "@/features/user/users.hooks";
import { H2, H3 } from "@/theme/Typography";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useSowingUnitsQuery } from "../sowings/sowings.hooks";
import { EditSeedScreenProps } from "./navigation/seed-routes";
import { SeedForm, SeedFormValues } from "./SeedForm";
import { seedDefaultRateFromForm } from "./seedFormValues";
import {
  useDeleteSeedMutation,
  useIsSeedInUseQuery,
  useSeedByIdQuery,
  useUpdateSeedMutation,
} from "./seeds.hooks";

export function EditSeedScreen({ route, navigation }: EditSeedScreenProps) {
  const seedId = route.params.seedId;
  const { seed } = useSeedByIdQuery(seedId);
  // isLoading, not isFetching: a background refetch must not unmount the form
  const { inUse, isLoading: isLoadingInUse } = useIsSeedInUseQuery(seedId);

  if (!seed || isLoadingInUse) {
    return null;
  }

  return (
    <EditSeedForm
      seed={seed}
      inUse={inUse ?? false}
      onDone={() => navigation.goBack()}
    />
  );
}

// Separate component so the form is initialized with the loaded seed
function EditSeedForm({
  seed,
  inUse,
  onDone,
}: {
  seed: Seed;
  inUse: boolean;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { sowingUnits } = useSowingUnitsQuery();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SeedFormValues>({
    defaultValues: {
      name: seed.name,
      description: seed.description ?? undefined,
      cropId: seed.cropId,
      quantityKind: seed.quantityKind,
      defaultAmount: seed.defaultAmount?.toString(),
      defaultUnit: seed.defaultUnit,
    },
  });

  const [error, setError] = useState<string | null>(null);
  const showError = () => setError(t("errors.unexpected_retry"));
  const updateSeedMutation = useUpdateSeedMutation(onDone, showError);
  const deleteSeedMutation = useDeleteSeedMutation(onDone, showError);

  function onSubmit(values: SeedFormValues) {
    setError(null);
    updateSeedMutation.mutate({
      id: seed.id,
      name: values.name,
      cropId: values.cropId,
      ...seedDefaultRateFromForm(values, sowingUnits ?? []),
      description: values.description || null,
    });
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        canWrite("field_calendar") ? (
          <BottomActionContainer>
            {error && (
              <Card
                style={{
                  backgroundColor: theme.colors.danger,
                  marginBottom: theme.spacing.s,
                }}
              >
                <H3 style={{ color: theme.colors.white }}>{error}</H3>
              </Card>
            )}
            <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
              <Button
                style={{ flexGrow: 1 }}
                type="danger"
                title={t("buttons.delete")}
                onPress={() =>
                  Alert.alert(
                    t("seeds.delete_confirm_title"),
                    t("seeds.delete_confirm_message"),
                    [
                      { text: t("buttons.cancel"), style: "cancel" },
                      {
                        text: t("buttons.delete"),
                        style: "destructive",
                        onPress: () => deleteSeedMutation.mutate(seed.id),
                      },
                    ],
                  )
                }
                disabled={
                  deleteSeedMutation.isPending ||
                  updateSeedMutation.isPending ||
                  inUse
                }
                loading={deleteSeedMutation.isPending}
              />
              <Button
                style={{ flexGrow: 1 }}
                title={t("buttons.save")}
                onPress={handleSubmit(onSubmit)}
                disabled={
                  !isDirty ||
                  updateSeedMutation.isPending ||
                  deleteSeedMutation.isPending
                }
                loading={updateSeedMutation.isPending}
              />
            </View>
          </BottomActionContainer>
        ) : undefined
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={seed.name}
        keyboardAware
      >
        <H2>{seed.name}</H2>
        {inUse ? (
          <Card
            style={{
              backgroundColor: theme.colors.danger,
              marginTop: theme.spacing.m,
            }}
          >
            <H3 style={{ color: theme.colors.white }}>
              {t("seeds.seed_in_use_warning")}
            </H3>
          </Card>
        ) : null}
        <SeedForm
          control={control}
          errors={errors}
          setValue={setValue}
          quantityKindLocked
        />
      </ScrollView>
    </ContentView>
  );
}
