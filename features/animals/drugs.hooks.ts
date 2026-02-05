import { useApi } from "@/api/api";
import { DrugCreateInput, DrugCreateResponse, DrugUpdateInput, DrugUpdateResponse } from "@/api/drugs.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useDrugsQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.drugs.all.queryKey,
    queryFn: () => api.drugs.getDrugs(),
    enabled,
  });
  return { drugs: data, ...rest };
}

export function useDrugByIdQuery(drugId: string, enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.drugs.byId(drugId).queryKey,
    queryFn: () => api.drugs.getDrugById(drugId),
    enabled: enabled && !!drugId,
  });
  return { drug: data, ...rest };
}

export function useCreateDrugMutation(
  onSuccess?: (drug: DrugCreateResponse) => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (drug: DrugCreateInput) => {
      return api.drugs.createDrug(drug);
    },
    onSuccess: (drug) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.drugs._def,
      });
      onSuccess && onSuccess(drug);
    },
    onError,
  });
}

export function useUpdateDrugMutation(
  onSuccess?: (drug: DrugUpdateResponse) => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...drug }: DrugUpdateInput & { id: string }) => {
      return api.drugs.updateDrug(id, drug);
    },
    onSuccess: (drug) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.drugs._def,
      });
      onSuccess && onSuccess(drug);
    },
    onError,
  });
}

export function useDeleteDrugMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (drugId: string) => {
      return api.drugs.deleteDrug(drugId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.drugs._def,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
}

export function useCheckDrugInUseMutation() {
  const api = useApi();
  return useMutation({
    mutationFn: (drugId: string) => {
      return api.drugs.checkDrugInUse(drugId);
    },
  });
}
