
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { useState } from "react";

interface CustomMessageCardProps {
  message: string;
  livingMemoryEnabled: boolean;
  onMessageChange: (message: string) => void;
}

const CustomMessageCard = ({ message, livingMemoryEnabled, onMessageChange }: CustomMessageCardProps) => {
  const [localMessage, setLocalMessage] = useState(message);

  const handleMessageChange = (value: string) => {
    if (value.length <= 150 && livingMemoryEnabled) {
      setLocalMessage(value);
      onMessageChange(value);
    }
  };

  return (
    <Card className={`group transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
      !livingMemoryEnabled ? 'opacity-50 grayscale' : ''
    } ${
      localMessage && livingMemoryEnabled
        ? 'ring-2 ring-teal-200 shadow-xl bg-gradient-to-r from-teal-50/50 to-cyan-50/50 border-l-4 border-l-teal-400'
        : 'shadow-md'
    }`}>
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4 flex-1">
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              localMessage && livingMemoryEnabled
                ? 'bg-teal-100 text-teal-600 animate-slide-in' 
                : !livingMemoryEnabled 
                ? 'bg-gray-100 text-gray-400'
                : 'bg-gray-100 text-gray-500 group-hover:bg-teal-50 group-hover:text-teal-400'
            }`}>
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h5 className={`text-xl font-bold font-playfair ${
                  !livingMemoryEnabled ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  Personal Message
                </h5>
                <Badge className={`font-semibold px-3 py-1 ${
                  !livingMemoryEnabled 
                    ? 'bg-gray-100 text-gray-400' 
                    : 'bg-teal-100 text-teal-700'
                }`}>
                  Free
                </Badge>
              </div>
              <p className={`text-base leading-relaxed ${
                !livingMemoryEnabled ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Add a heartfelt message that appears with your AR experience
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <Label className={`text-base font-semibold font-playfair ${
            !livingMemoryEnabled ? 'text-gray-400' : 'text-gray-900'
          }`}>
            Your Personal Message:
          </Label>
          <Textarea
            placeholder="Share what makes this memory special..."
            value={localMessage}
            onChange={(e) => handleMessageChange(e.target.value)}
            className={`resize-none text-base ${
              !livingMemoryEnabled ? 'bg-gray-50' : 'focus:ring-teal-200 focus:border-teal-300'
            }`}
            rows={3}
            disabled={!livingMemoryEnabled}
          />
          <div className="flex justify-between items-center">
            <p className={`text-sm ${
              !livingMemoryEnabled ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {localMessage.length}/150 characters
            </p>
            {localMessage.length > 140 && livingMemoryEnabled && (
              <p className="text-sm text-amber-600">Almost at the limit!</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomMessageCard;
