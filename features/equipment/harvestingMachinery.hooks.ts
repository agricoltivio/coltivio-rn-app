import { useApi } from "@/api/api";
import {
  HarvestingMachinery,
  HarvestingMachineryCreateInput,
  HarvestingMachineryUpdateInput,
} from "@/api/harvestingMachinery.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useHarvestingMachineryByIdQuery(
  harvestingMachineryId: string,
  enabled = true
) {
  const api = useApi();

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.harvestingMachinery.byId(harvestingMachineryId)
      .queryKey,
    queryFn: () =>
      api.harvestingMachinery.getHarvestingMachineryById(harvestingMachineryId),
    enabled,
  });
  return { harvestingMachinery: data, ...rest };
}

export function useHarvestingMachineryQuery(
  enabled = true,
  initialData?: HarvestingMachinery[]
) {
  const api = useApi();

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.harvestingMachinery.all.queryKey,
    queryFn: () => api.harvestingMachinery.getHarvestingMachinery(),
    enabled,
    initialData,
  });
  return { harvestingMachinery: data, ...rest };
}

export function useCreateHarvestingMachineryMutation(
  onSuccess: (harvestingMachinery: HarvestingMachinery) => void
) {
  const queryClient = useQueryClient();
  const api = useApi();
  const createHarvestingMachineryMutation = useMutation({
    mutationKey: ["createTraktor"],
    mutationFn: (tractor: HarvestingMachineryCreateInput) => {
      return api.harvestingMachinery.createHarvestingMachinery(tractor);
    },
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (harvestingMachinery) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.harvestingMachinery.all.queryKey,
        refetchType: "active",
      });
      queryClient.setQueryData(
        queryKeys.harvestingMachinery.byId(harvestingMachinery.id).queryKey,
        () => harvestingMachinery
      );
      onSuccess(harvestingMachinery);
    },
  });
  return createHarvestingMachineryMutation;
}

export function useUpdateHarvestingMachineryMutation(
  onSuccess: (harvestingMachinery: HarvestingMachinery) => void
) {
  const api = useApi();
  const queryClient = useQueryClient();
  const updateHarvestingMachineryMutation = useMutation({
    mutationFn: ({
      id,
      ...tractor
    }: HarvestingMachineryUpdateInput & { id: string }) => {
      return api.harvestingMachinery.updateHarvestingMachinery(id, tractor);
    },
    onSuccess: (harvestingMachinery) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.harvestingMachinery.all.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.harvests._def,
      });
      queryClient.setQueryData(
        queryKeys.harvestingMachinery.byId(harvestingMachinery.id).queryKey,
        () => harvestingMachinery
      );
      onSuccess(harvestingMachinery);
    },
  });
  return updateHarvestingMachineryMutation;
}

export function useDeleteHarvestingMachineryMutation(onSuccess?: () => void) {
  const api = useApi();
  const queryClient = useQueryClient();
  const deleteHarvestingMachineryMutation = useMutation({
    mutationFn: async (harvestingMachineryId: string) => {
      await api.harvestingMachinery.deleteHarvestingMachinery(
        harvestingMachineryId
      );
      return harvestingMachineryId;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.harvestingMachinery.all.queryKey,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.harvestingMachinery.byId(id).queryKey,
      });
      onSuccess && onSuccess();
    },
  });
  return deleteHarvestingMachineryMutation;
}
