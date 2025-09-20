
import { useProductFlow } from "./hooks/useProductFlow";
import { ProductState, ProductStateActions } from "./types/productState";

export const useProductState = (): ProductState & ProductStateActions => {
  return useProductFlow();
};
