
import React from 'react';
import { Check, Zap } from '@/components/ui/icons';

interface ResolutionOption {
  id: string;
  name: string;
  dimensions: string;
  tokens: number;
  description: string;
  popular?: boolean;
}

interface ResolutionSelectorProps {
  selectedResolution: string;
  onResolutionSelect: (resolutionId: string) => void;
  userTokenBalance: number;
}

const resolutionOptions: ResolutionOption[] = [
  {
    id: 'standard',
    name: 'Standard',
    dimensions: '1024×1024',
    tokens: 3,
    description: 'Perfect for social media and web use'
  },
  {
    id: 'hd',
    name: 'HD',
    dimensions: '2048×2048',
    tokens: 4,
    description: 'Great for printing and professional use',
    popular: true
  },
  {
    id: 'ultra-hd',
    name: 'Ultra HD',
    dimensions: '4096×4096',
    tokens: 5,
    description: 'Maximum quality for large prints'
  }
];

const ResolutionSelector: React.FC<ResolutionSelectorProps> = ({
  selectedResolution,
  onResolutionSelect,
  userTokenBalance
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose Your Resolution
        </h3>
        <p className="text-sm text-gray-600">
          Higher resolutions provide better quality for printing and professional use
        </p>
      </div>

      <div className="grid gap-3">
        {resolutionOptions.map((option) => {
          const canAfford = userTokenBalance >= option.tokens;
          const isSelected = selectedResolution === option.id;
          
          return (
            <div
              key={option.id}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : canAfford
                  ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  : 'border-gray-200 opacity-60 cursor-not-allowed'
              } ${option.popular ? 'ring-2 ring-blue-500 ring-opacity-20' : ''}`}
              onClick={() => canAfford && onResolutionSelect(option.id)}
            >
              {option.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{option.name}</h4>
                    <span className="text-sm text-gray-500">({option.dimensions})</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                  
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {option.tokens} tokens
                    </span>
                    {!canAfford && (
                      <span className="text-xs text-red-500 ml-2">
                        (Insufficient tokens)
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  {isSelected ? (
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className={`w-6 h-6 rounded-full border-2 ${
                      canAfford ? 'border-gray-300' : 'border-gray-200'
                    }`} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResolutionSelector;
