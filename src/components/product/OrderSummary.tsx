import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit3, Image as ImageIcon, Palette, Frame, Video, Zap, ShoppingCart } from "lucide-react";
import PaymentForm from "./PaymentForm";
import TrustBadges from "./TrustBadges";

interface OrderSummaryProps {
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
  onEditStep?: (stepNumber: number) => void;
}

const OrderSummary = ({ 
  uploadedImage, 
  selectedStyle, 
  selectedSize, 
  selectedOrientation, 
  customizations,
  onEditStep 
}: OrderSummaryProps) => {
  // Calculate pricing
  const getSizePrice = (size: string) => {
    switch (size) {
      case "8x10": return 49;
      case "12x16": return 89;
      case "16x20": return 129;
      case "20x24": return 169;
      default: return 49;
    }
  };

  const basePrice = getSizePrice(selectedSize);
  const framePrice = customizations.floatingFrame.enabled ? 29 : 0;
  const livingMemoryPrice = customizations.livingMemory ? 19 : 0;
  const aiUpscalePrice = customizations.aiUpscale ? 9 : 0;
  const subtotal = basePrice + framePrice + livingMemoryPrice + aiUpscalePrice;
  const shipping = subtotal > 75 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleEditClick = (stepNumber: number) => {
    if (onEditStep) {
      onEditStep(stepNumber);
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Photo */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Your photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">Your Photo</p>
                <p className="text-sm text-gray-500">
                  {uploadedImage ? "Uploaded & ready" : "Not uploaded"}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleEditClick(1)}
              className="text-purple-600 hover:text-purple-800"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Art Style */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Palette className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Art Style</p>
                <p className="text-sm text-gray-500">{selectedStyle?.name || 'Not selected'}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleEditClick(1)}
              className="text-purple-600 hover:text-purple-800"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Canvas Size */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Canvas Size</p>
                <p className="text-sm text-gray-500">
                  {selectedSize ? `${selectedSize} • ${selectedOrientation}` : 'Not selected'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">${basePrice}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleEditClick(2)}
                className="text-purple-600 hover:text-purple-800"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Floating Frame */}
          {customizations.floatingFrame.enabled && (
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Frame className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Floating Frame</p>
                  <p className="text-sm text-gray-500 capitalize">{customizations.floatingFrame.color} finish</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">+${framePrice}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEditClick(3)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Living Memory */}
          {customizations.livingMemory && (
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <Video className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Living Memory</p>
                  <p className="text-sm text-gray-500">AR video activation</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">+${livingMemoryPrice}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEditClick(3)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* AI Upscale */}
          {customizations.aiUpscale && (
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">AI Upscale</p>
                  <p className="text-sm text-gray-500">Enhanced resolution</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">+${aiUpscalePrice}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEditClick(3)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Pricing Breakdown */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900 font-medium">
                {shipping === 0 ? (
                  <Badge variant="secondary" className="text-green-700 bg-green-100 text-xs">
                    Free
                  </Badge>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
              </span>
            </div>
            {subtotal > 75 && (
              <div className="text-xs text-green-600 text-right">
                🎉 You qualify for free shipping!
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              required
            />
            <p className="text-xs text-gray-500">
              We'll send order updates and shipping notifications to this email
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <PaymentForm />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Order Actions */}
      <div className="space-y-3">
        <Button 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
          size="lg"
        >
          Complete Order • ${total.toFixed(2)}
        </Button>
        <p className="text-xs text-center text-gray-500">
          Secure checkout powered by Stripe • 30-day money-back guarantee
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
