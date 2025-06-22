
import { Gift, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface GiftNotesProps {
  giftMessage: string;
  onGiftMessageChange: (message: string) => void;
}

const GiftNotes = ({ giftMessage, onGiftMessageChange }: GiftNotesProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-600" />
          Gift Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isExpanded ? (
          <Button
            variant="outline"
            onClick={() => setIsExpanded(true)}
            className="w-full text-left justify-start"
          >
            <Heart className="w-4 h-4 mr-2 text-red-500" />
            Add a personal gift message
          </Button>
        ) : (
          <div className="space-y-3">
            <label htmlFor="gift-message" className="block text-sm font-medium text-gray-700">
              Personal Message
            </label>
            <textarea
              id="gift-message"
              value={giftMessage}
              onChange={(e) => onGiftMessageChange(e.target.value)}
              placeholder="Write a heartfelt message that will be included with your canvas..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
              rows={3}
              maxLength={200}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {giftMessage.length}/200 characters
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsExpanded(false);
                  onGiftMessageChange('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Remove
              </Button>
            </div>
          </div>
        )}
        
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <p className="text-sm text-purple-800">
            💝 <strong>Free gift wrapping:</strong> Your canvas will be beautifully packaged and ready to gift
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GiftNotes;
