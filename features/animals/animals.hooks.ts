import { useApi } from "@/api/api";
import {
  AnimalBatchUpdateInput,
  AnimalBatchUpdateResponse,
  AnimalCreateInput,
  AnimalCreateResponse,
  AnimalType,
  AnimalUpdateInput,
  AnimalUpdateResponse,
  CustomOutdoorJournalCategoryInput,
} from "@/api/animals.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAnimalsQuery(
  onlyLiving: boolean = false,
  animalTypes?: AnimalType[],
  enabled: boolean = true,
) {
  const api = useApi();
  const hasFilters = onlyLiving || !!animalTypes;
  const { data, ...rest } = useQuery({
    queryKey: hasFilters
      ? queryKeys.animals.filtered(onlyLiving, animalTypes).queryKey
      : queryKeys.animals.all.queryKey,
    queryFn: () => api.animals.getAnimals(onlyLiving, animalTypes),
    enabled,
  });
  return { animals: data, ...rest };
}

export function useAnimalByIdQuery(animalId: string, enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.animals.byId(animalId).queryKey,
    queryFn: () => api.animals.getAnimalById(animalId),
    enabled,
  });
  return { animal: data, ...rest };
}

export function useCreateAnimalMutation(
  onSuccess?: (animal: AnimalCreateResponse) => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (animal: AnimalCreateInput) => {
      return api.animals.createAnimal(animal);
    },
    onSuccess: (animal) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.animals._def,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.earTags._def,
      });
      onSuccess && onSuccess(animal);
    },
    onError,
  });
}

export function useUpdateAnimalMutation(
  onSuccess?: (animal: AnimalUpdateResponse) => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...animal }: AnimalUpdateInput & { id: string }) => {
      return api.animals.updateAnimal(id, animal);
    },
    onSuccess: (animal) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.animals._def,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.earTags._def,
      });
      onSuccess && onSuccess(animal);
    },
    onError,
  });
}

export function useBatchUpdateAnimalsMutation(
  onSuccess?: (data: AnimalBatchUpdateResponse) => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AnimalBatchUpdateInput) => {
      return api.animals.batchUpdateAnimals(input);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.animals._def,
      });
      onSuccess && onSuccess(data);
    },
    onError,
  });
}

export function useDeleteAnimalsMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (animalIds: string[]) => api.animals.deleteAnimals(animalIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.animals._def });
      queryClient.invalidateQueries({ queryKey: queryKeys.earTags._def });
      onSuccess?.();
    },
    onError,
  });
}

export function useSetCustomOutdoorJournalCategoriesMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      animalId,
      input,
    }: {
      animalId: string;
      input: CustomOutdoorJournalCategoryInput;
    }) => api.animals.setCustomOutdoorJournalCategories(animalId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.animals._def });
      queryClient.invalidateQueries({ queryKey: queryKeys.outdoorJournal._def });
      onSuccess?.();
    },
    onError,
  });
}

export function useDeleteAnimalMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (animalId: string) => {
      await api.animals.deleteAnimal(animalId);
      return animalId;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.animals._def,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.animals.byId(id).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.earTags._def,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
}
