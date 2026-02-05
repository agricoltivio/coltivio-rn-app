import { useApi } from "@/api/api";
import { TreatmentCreateInput, TreatmentCreateResponse, TreatmentUpdateInput, TreatmentUpdateResponse } from "@/api/treatments.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useTreatmentsQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.treatments.all.queryKey,
    queryFn: () => api.treatments.getTreatments(),
    enabled,
  });
  return { treatments: data, ...rest };
}

export function useAnimalTreatmentsQuery(animalId: string, enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.treatments.byAnimal(animalId).queryKey,
    queryFn: () => api.treatments.getAnimalTreatments(animalId),
    enabled: enabled && !!animalId,
  });
  return { treatments: data || [], ...rest };
}

export function useTreatmentByIdQuery(treatmentId: string, enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.treatments.byId(treatmentId).queryKey,
    queryFn: () => api.treatments.getTreatmentById(treatmentId),
    enabled: enabled && !!treatmentId,
  });
  return { treatment: data, ...rest };
}

export function useCreateTreatmentMutation(
  onSuccess?: (treatment: TreatmentCreateResponse) => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (treatment: TreatmentCreateInput) => {
      return api.treatments.createTreatment(treatment);
    },
    onSuccess: (treatment) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.treatments._def,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.animals._def,
      });
      onSuccess && onSuccess(treatment);
    },
    onError,
  });
}

export function useUpdateTreatmentMutation(
  onSuccess?: (treatment: TreatmentUpdateResponse) => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...treatment }: TreatmentUpdateInput & { id: string }) => {
      return api.treatments.updateTreatment(id, treatment);
    },
    onSuccess: (treatment) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.treatments._def,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.animals._def,
      });
      onSuccess && onSuccess(treatment);
    },
    onError,
  });
}

export function useDeleteTreatmentMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (treatmentId: string) => {
      return api.treatments.deleteTreatment(treatmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.treatments._def,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.animals._def,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
}
