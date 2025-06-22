
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit3, Image as ImageIcon, Palette, Frame, Video, Zap, ShoppingCart, CheckCircle } from "lucide-react";
import CanvasMockup from "./CanvasMockup";

interface ReviewAndOrderProps {
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
  onEditStep: (step: number) => void;
}

const ReviewAndOrder = ({ 
  uploadedImage, 
  selectedStyle, 
  selectedSize, 
  selectedOrientation, 
  customizations,
  onEditStep
}: ReviewAndOrderProps) => {
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!uploadedImage || !selectedStyle || !selectedSize) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-2">Complete the previous steps to review your order</p>
        <p className="text-gray-400 text-sm">Upload a photo, choose your style, and select your size</p>
      </div>
    );
  }

  // Calculate pricing
  const calculatePricing = () => {
    const sizeOptions: Record<string, Record<string, number>> = {
      horizontal: {
        '16" x 12"': 99.99,
        '20" x 16"': 129.99,
        '24" x 18"': 149.99,
        '30" x 24"': 189.99,
        '36" x 24"': 199.99,
        '40" x 30"': 269.99,
        '48" x 32"': 349.99,
        '60" x 40"': 499.99,
      },
      vertical: {
        '12" x 16"': 99.99,
        '16" x 20"': 129.99,
        '18" x 24"': 149.99,
        '24" x 30"': 189.99,
        '24" x 36"': 199.99,
        '30" x 40"': 269.99,
        '32" x 48"': 349.99,
        '40" x 60"': 499.99,
      },
      square: {
        '16" x 16"': 99.99,
        '20" x 20"': 129.99,
        '24" x 24"': 149.99,
        '30" x 30"': 189.99,
        '32" x 32"': 199.99,
        '36" x 36"': 269.99,
      }
    };

    const basePrice = sizeOptions[selectedOrientation]?.[selectedSize] || 0;
    const framePrice = customizations.floatingFrame.enabled ? 29.99 : 0;
    const livingMemoryPrice = customizations.livingMemory ? 59.99 : 0;
    const voiceMatchPrice = customizations.voiceMatch ? 19.99 : 0;
    const aiUpscalePrice = customizations.aiUpscale ? 9.99 : 0;
    
    const subtotal = basePrice + framePrice + livingMemoryPrice + voiceMatchPrice + aiUpscalePrice;
    const shipping = subtotal > 75 ? 0 : 9.99;
    const total = subtotal + shipping;

    return {
      basePrice,
      framePrice,
      livingMemoryPrice,
      voiceMatchPrice,
      aiUpscalePrice,
      subtotal,
      shipping,
      total
    };
  };

  const pricing = calculatePricing();

  const handlePlaceOrder = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setIsProcessing(true);
    
    // Simulate order processing
    setTimeout(() => {
      setIsProcessing(false);
      alert('Order placed successfully! You will receive a confirmation email shortly.');
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          Review Your Canvas
        </h3>
        <p className="text-gray-600">
          Here's how your personalized canvas will look. Ready to make it yours?
        </p>
      </div>

      {/* Desktop Layout: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Canvas Mockup */}
        <div className="order-2 lg:order-1">
          <CanvasMockup
            imageUrl={uploadedImage}
            selectedSize={selectedSize}
            selectedOrientation={selectedOrientation}
            customizations={customizations}
          />
        </div>

        {/* Right: Order Summary */}
        <div className="order-1 lg:order-2 space-y-6">
          {/* Order Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Photo */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                    <img src={uploadedImage} alt="Your photo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Your Photo</p>
                    <p className="text-sm text-gray-500">Uploaded & processed</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEditStep(2)}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>

              {/* Art Style */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Art Style</p>
                    <p className="text-sm text-gray-500">{selectedStyle.name}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEditStep(1)}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>

              {/* Canvas Size */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Canvas Size</p>
                    <p className="text-sm text-gray-500">{selectedSize} • {selectedOrientation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">${pricing.basePrice.toFixed(2)}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditStep(3)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Floating Frame */}
              {customizations.floatingFrame.enabled && (
                <div className="flex items-center justify-between py-2">
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
                    <span className="font-semibold text-gray-900">+${pricing.framePrice.toFixed(2)}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEditStep(3)}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Living Memory */}
              {customizations.livingMemory && (
                <div className="flex items-center justify-between py-2">
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
                    <span className="font-semibold text-gray-900">+${pricing.livingMemoryPrice.toFixed(2)}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEditStep(3)}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Voice Match */}
              {customizations.voiceMatch && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Video className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Voice Match</p>
                      <p className="text-sm text-gray-500">Custom voice recording</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">+${pricing.voiceMatchPrice.toFixed(2)}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEditStep(3)}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* AI Upscale */}
              {customizations.aiUpscale && (
                <div className="flex items-center justify-between py-2">
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
                    <span className="font-semibold text-gray-900">+${pricing.aiUpscalePrice.toFixed(2)}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEditStep(3)}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Custom Message */}
              {customizations.customMessage && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-rose-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Custom Message</p>
                      <p className="text-sm text-gray-500 truncate max-w-40">"{customizations.customMessage}"</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditStep(3)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Pricing Breakdown */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {pricing.shipping === 0 ? (
                      <Badge variant="secondary" className="text-green-700 bg-green-100">Free</Badge>
                    ) : (
                      `$${pricing.shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">${pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Input */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We'll send order updates and shipping notifications
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Place Order Button */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                onClick={handlePlaceOrder}
                disabled={!email || isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg font-semibold"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Order...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Place Order • ${pricing.total.toFixed(2)}
                  </>
                )}
              </Button>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  🔒 Secure checkout • 30-day money-back guarantee
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReviewAndOrder;
