
import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

interface CustomMessageCardProps {
  message: string;
  onMessageChange: (message: string) => void;
  maxLength?: number;
}

const CustomMessageCard = memo(({
  message,
  onMessageChange,
  maxLength = 200
}: CustomMessageCardProps) => {
  const remainingChars = maxLength - message.length;
  const isOverLimit = remainingChars < 0;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Personal Message
          </CardTitle>
          <Badge variant="secondary">Optional</Badge>
        </div>
        <p className="text-sm text-gray-600">
          Add a heartfelt message to make your artwork even more special
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Write your personal message here... (e.g., 'Forever in our hearts' or 'Best friends since 2010')"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={maxLength + 10} // Allow slight overflow for better UX
          />
          
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">
              Perfect for commemorating special moments or relationships
            </span>
            <span className={`font-medium ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
              {remainingChars} characters remaining
            </span>
          </div>
        </div>

        {isOverLimit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              Your message is too long. Please shorten it by {Math.abs(remainingChars)} characters.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

CustomMessageCard.displayName = 'CustomMessageCard';

export default CustomMessageCard;
