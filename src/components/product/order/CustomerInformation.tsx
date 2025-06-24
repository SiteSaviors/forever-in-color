
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CustomerInformation = () => {
  return (
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
  );
};

export default CustomerInformation;
