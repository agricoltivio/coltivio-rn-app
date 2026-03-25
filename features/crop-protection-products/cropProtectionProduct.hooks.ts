import { useApi } from "@/api/api";
import {
  CropProtectionProduct,
  CropProtectionProductCreateInput,
  CropProtectionProductUpdateInput,
} from "@/api/cropProtectionProducts.api";
import { queryKeys } from "@/cache/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCropProtectionProductsQuery(enabled: boolean = true) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropProtectionProducts.all.queryKey,
    queryFn: () => api.cropProtectionProducts.getCropProtectionProducts(),
    enabled,
  });
  return { cropProtectionProducts: data, ...rest };
}

export function useCropProtectionProductByIdQuery(
  cropProtectionProductId: string,
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropProtectionProducts.byId(cropProtectionProductId)
      .queryKey,
    queryFn: () =>
      api.cropProtectionProducts.getCropProtectionProductById(
        cropProtectionProductId,
      ),
    enabled,
  });
  return { cropProtectionProduct: data, ...rest };
}

export function useCreateCropProtectionProductMutation(
  onSuccess?: (cropProtectionProduct: CropProtectionProduct) => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  const api = useApi();
  return useMutation({
    mutationFn: (cropProtectionProduct: CropProtectionProductCreateInput) => {
      return api.cropProtectionProducts.createCropProtectionProduct(
        cropProtectionProduct,
      );
    },
    onSuccess: (cropProtectionProduct) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropProtectionProducts._def,
      });
      onSuccess && onSuccess(cropProtectionProduct);
    },
    onError,
  });
}

export function useUpdateCropProtectionProductMutation(
  onSuccess?: (cropProtectionProduct: CropProtectionProduct) => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...cropProtectionProduct
    }: CropProtectionProductUpdateInput & { id: string }) => {
      return api.cropProtectionProducts.updateCropProtectionProduct(
        id,
        cropProtectionProduct,
      );
    },
    onSuccess: (cropProtectionProduct) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropProtectionProducts._def,
      });
      onSuccess && onSuccess(cropProtectionProduct);
    },
    onError,
  });
}

export function useDeleteCropProtectionProductMutation(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cropProtectionProductId: string) => {
      await api.cropProtectionProducts.deleteCropProtectionProduct(
        cropProtectionProductId,
      );
      return cropProtectionProductId;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cropProtectionProducts._def,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.cropProtectionProducts.byId(id).queryKey,
      });
      onSuccess && onSuccess();
    },
    onError,
  });
}

export function useIsCropProtectionProductInUseQuery(
  cropProtectionProductId: string,
  enabled: boolean = true,
) {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.cropProtectionProducts.inUse(cropProtectionProductId)
      .queryKey,
    queryFn: () =>
      api.cropProtectionProducts.isCropProtectionProductInUse(
        cropProtectionProductId,
      ),
    enabled,
  });
  return { inUse: data, ...rest };
}
