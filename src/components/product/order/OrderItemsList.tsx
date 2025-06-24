
import { Button } from "@/components/ui/button";
import { Edit3, Image as ImageIcon, Palette, Frame, Video, Zap } from "lucide-react";

interface OrderItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  price?: number;
  onEdit: () => void;
}

interface OrderItemsListProps {
  uploadedImage: string | null;
  selectedStyle: {id: number, name: string} | null;
  selectedSize: string;
  selectedOrientation: string;
  customizations: {
    floatingFrame: {
      enabled: boolean;
      color: 'white' | 'black' | 'espresso';
    };
    livingMemory: boolean;
    voiceMatch: boolean;
    customMessage: string;
    aiUpscale: boolean;
  };
  basePrice: number;
  onEditStep: (stepNumber: number) => void;
}

const OrderItemsList = ({ 
  uploadedImage, 
  selectedStyle, 
  selectedSize, 
  selectedOrientation, 
  customizations,
  basePrice,
  onEditStep 
}: OrderItemsListProps) => {
  const items: OrderItem[] = [
    {
      id: 'photo',
      icon: (
        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          {uploadedImage ? (
            <img src={uploadedImage} alt="Your photo" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      ),
      title: 'Your Photo',
      description: uploadedImage ? "Uploaded & ready" : "Not uploaded",
      onEdit: () => onEditStep(1)
    },
    {
      id: 'style',
      icon: (
        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
          <Palette className="w-4 h-4 text-purple-600" />
        </div>
      ),
      title: 'Art Style',
      description: selectedStyle?.name || 'Not selected',
      onEdit: () => onEditStep(1)
    },
    {
      id: 'size',
      icon: (
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <ImageIcon className="w-4 h-4 text-blue-600" />
        </div>
      ),
      title: 'Canvas Size',
      description: selectedSize ? `${selectedSize} • ${selectedOrientation}` : 'Not selected',
      price: basePrice,
      onEdit: () => onEditStep(2)
    }
  ];

  // Add optional items
  if (customizations.floatingFrame.enabled) {
    items.push({
      id: 'frame',
      icon: (
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
          <Frame className="w-4 h-4 text-amber-600" />
        </div>
      ),
      title: 'Floating Frame',
      description: `${customizations.floatingFrame.color} finish`,
      price: 29,
      onEdit: () => onEditStep(3)
    });
  }

  if (customizations.livingMemory) {
    items.push({
      id: 'living-memory',
      icon: (
        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
          <Video className="w-4 h-4 text-green-600" />
        </div>
      ),
      title: 'Living Memory',
      description: 'AR video activation',
      price: 19,
      onEdit: () => onEditStep(3)
    });
  }

  if (customizations.aiUpscale) {
    items.push({
      id: 'ai-upscale',
      icon: (
        <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
          <Zap className="w-4 h-4 text-pink-600" />
        </div>
      ),
      title: 'AI Upscale',
      description: 'Enhanced resolution',
      price: 9,
      onEdit: () => onEditStep(3)
    });
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {item.icon}
            <div>
              <p className="font-medium text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-500 capitalize">{item.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {item.price && (
              <span className="font-semibold text-gray-900">
                {item.id === 'size' ? `$${item.price}` : `+$${item.price}`}
              </span>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={item.onEdit}
              className="text-purple-600 hover:text-purple-800"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderItemsList;
