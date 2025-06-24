
import { useProductStateLogic } from "./hooks/useProductStateLogic";
import { ProductState, ProductStateActions } from "./types/productState";

export const useProductState = (): ProductState & ProductStateActions => {
  return useProductStateLogic();
};
