import { useApi } from "@/api/api";
import {
  TillageEquipment,
  TillageEquipmentCreateInput,
  TillageEquipmentUpdateInput,
} from "@/api/tillageEquipment.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useTillageEquipmentsQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.tillageEquipments.all.queryKey,
    queryFn: () => api.tillageEquipments.getTillageEquipments(),
    enabled,
  });
  return { tillageEquipments: data, ...rest };
}

export function useTillageEquipmentByIdQuery(
  tillageEquipmentId: string,
  enabled: boolean = true
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.tillageEquipments.byId(tillageEquipmentId).queryKey,
    queryFn: () =>
      api.tillageEquipments.getTillageEquipmentById(tillageEquipmentId),
    enabled,
  });
  return { tillageEquipment: data, ...rest };
}

export function useCreateTillageEquipmentMutation(
  onSuccess?: (tillageEquipment: TillageEquipment) => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (tillageEquipment: TillageEquipmentCreateInput) => {
      return api.tillageEquipments.createTillageEquipment(tillageEquipment);
    },
    onSuccess: (tillageEquipment) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tillageEquipments._def,
      });
      onSuccess && onSuccess(tillageEquipment);
    },
    onError,
  });
}

export function useUpdateTillageEquipmentMutation(
  onSuccess?: (tillageEquipment: TillageEquipment) => void,
  onError?: (error: Error) => void
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...tillageEquipment
    }: TillageEquipmentUpdateInput & { id: string }) => {
      return api.tillageEquipments.updateTillageEquipment(id, tillageEquipment);
    },
    onSuccess: (tillageEquipment) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tillageEquipments._def,
      });
      onSuccess && onSuccess(tillageEquipment);
    },
    onError,
  });
}

export function useDeleteTillageEquipmentMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tillageEquipmentId: string) => {
      await api.tillageEquipments.deleteTillageEquipment(tillageEquipmentId);
      return tillageEquipmentId;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tillageEquipments._def,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.tillageEquipments.byId(id).queryKey,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
}
