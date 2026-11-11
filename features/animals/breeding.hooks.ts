import { useApi } from "@/api/api";
import {
  AnimalHeatCreateInput,
  AnimalHeatUpdateInput,
  AnimalWeightCreateInput,
  AnimalWeightUpdateInput,
  GestationSettingsUpdateInput,
} from "@/api/breeding.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAnimalWeightsQuery(animalId: string, enabled = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.breeding.weights(animalId).queryKey,
    queryFn: () => api.breeding.getWeights(animalId),
    enabled,
  });
  return { weights: data, ...rest };
}

// Weight changes affect the latest weight shown on animals and the treatment dose prefill
function useInvalidateWeights() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.breeding._def });
    queryClient.invalidateQueries({ queryKey: queryKeys.animals._def });
  };
}

export function useCreateAnimalWeightMutation(onSuccess?: () => void) {
  const api = useApi();
  const invalidate = useInvalidateWeights();
  return useMutation({
    mutationFn: ({
      animalId,
      input,
    }: {
      animalId: string;
      input: AnimalWeightCreateInput;
    }) => api.breeding.createWeight(animalId, input),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
  });
}

export function useUpdateAnimalWeightMutation(onSuccess?: () => void) {
  const api = useApi();
  const invalidate = useInvalidateWeights();
  return useMutation({
    mutationFn: ({
      weightId,
      input,
    }: {
      weightId: string;
      input: AnimalWeightUpdateInput;
    }) => api.breeding.updateWeight(weightId, input),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
  });
}

export function useDeleteAnimalWeightMutation(onSuccess?: () => void) {
  const api = useApi();
  const invalidate = useInvalidateWeights();
  return useMutation({
    mutationFn: (weightId: string) => api.breeding.deleteWeight(weightId),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
  });
}

export function useAnimalHeatsQuery(animalId: string, enabled = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.breeding.heats(animalId).queryKey,
    queryFn: () => api.breeding.getHeats(animalId),
    enabled,
  });
  return { heats: data, ...rest };
}

export function useCreateAnimalHeatMutation(onSuccess?: () => void) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      animalId,
      input,
    }: {
      animalId: string;
      input: AnimalHeatCreateInput;
    }) => api.breeding.createHeat(animalId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.breeding._def });
      onSuccess?.();
    },
  });
}

export function useUpdateAnimalHeatMutation(onSuccess?: () => void) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      heatId,
      input,
    }: {
      heatId: string;
      input: AnimalHeatUpdateInput;
    }) => api.breeding.updateHeat(heatId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.breeding._def });
      onSuccess?.();
    },
  });
}

export function useDeleteAnimalHeatMutation(onSuccess?: () => void) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (heatId: string) => api.breeding.deleteHeat(heatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.breeding._def });
      onSuccess?.();
    },
  });
}

export function useBreedingCalendarQuery(from: string, to: string) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.breeding.calendar(from, to).queryKey,
    queryFn: () => api.breeding.getBreedingCalendar(from, to),
  });
  return { entries: data, ...rest };
}

export function useGestationSettingsQuery() {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.breeding.gestationSettings.queryKey,
    queryFn: () => api.breeding.getGestationSettings(),
  });
  return { gestationSettings: data, ...rest };
}

export function useUpdateGestationSettingsMutation(onSuccess?: () => void) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GestationSettingsUpdateInput) =>
      api.breeding.updateGestationSettings(input),
    onSuccess: () => {
      // Expected birth dates in the calendar depend on the gestation days
      queryClient.invalidateQueries({ queryKey: queryKeys.breeding._def });
      onSuccess?.();
    },
  });
}
