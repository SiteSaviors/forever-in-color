
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Lock, Shield } from "@/components/ui/icons";

const PaymentForm = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stripe Integration Placeholder */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-dashed border-purple-200 rounded-lg p-6 text-center">
          <CreditCard className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Stripe Integration Coming Soon</h3>
          <p className="text-sm text-gray-600 mb-3">
            Secure payment processing will be implemented here
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              💳 Credit Cards
            </Badge>
            <Badge variant="outline" className="text-xs">
              🍎 Apple Pay
            </Badge>
            <Badge variant="outline" className="text-xs">
              📱 Google Pay
            </Badge>
          </div>
        </div>

        {/* Security Badges */}
        <div className="flex items-center justify-center gap-4 pt-2 border-t">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Lock className="w-3 h-3" />
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Shield className="w-3 h-3" />
            <span>PCI Compliant</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
