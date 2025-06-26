
import { ReactNode } from "react";
import ProductStep from "../ProductStep";

interface ProductStepWrapperProps {
  stepNumber: number;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  canAccess: boolean;
  onStepClick: () => void;
  selectedStyle?: { id: number; name: string } | null;
  children: ReactNode;
}

const ProductStepWrapper = ({
  stepNumber,
  title,
  description,
  isActive,
  isCompleted,
  canAccess,
  onStepClick,
  selectedStyle,
  children
}: ProductStepWrapperProps) => {
  return (
    <ProductStep
      stepNumber={stepNumber}
      title={title}
      description={description}
      isActive={isActive}
      isCompleted={isCompleted}
      canAccess={canAccess}
      onStepClick={onStepClick}
      selectedStyle={selectedStyle}
    >
      {children}
    </ProductStep>
  );
};

export default ProductStepWrapper;
