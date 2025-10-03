
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, AlertCircle } from "@/components/ui/icons";

interface CustomMessageCardProps {
  message: string;
  livingMemoryEnabled: boolean;
  onMessageChange: (message: string) => void;
}

const MAX_MESSAGE_LENGTH = 200;
const WARNING_THRESHOLD = 160;

const CustomMessageCard = ({ message, livingMemoryEnabled, onMessageChange }: CustomMessageCardProps) => {
  const _isValidMessage = (text: string) => {
    return text.length <= MAX_MESSAGE_LENGTH;
  };

  return (
    <Card className={`group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
      !livingMemoryEnabled 
        ? 'opacity-50 cursor-not-allowed' 
        : message.length > 0 
          ? 'ring-2 ring-green-200 shadow-xl bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-l-4 border-l-green-400' 
          : 'shadow-lg hover:shadow-green-100/50'
    }`}>
      <CardContent className="p-4 md:p-8">
        <div className="flex items-start gap-3 md:gap-4">
          <div className={`p-2 md:p-3 rounded-xl transition-all duration-300 ${
            message.length > 0 && livingMemoryEnabled
              ? 'bg-green-100 text-green-600 animate-slide-in' 
              : 'bg-gray-100 text-gray-500 group-hover:bg-green-50 group-hover:text-green-400'
          }`}>
            <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="flex-1 space-y-3 md:space-y-4 min-w-0">
            <div>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <h5 className="text-lg md:text-xl font-bold text-gray-900 font-poppins tracking-tight">Add Personal Message</h5>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-100 text-green-700 font-semibold px-2 md:px-3 py-1 text-xs">
                    Free
                  </Badge>
                  {!livingMemoryEnabled && (
                    <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 text-xs">
                      Requires Living Memory
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-2">
                Include a heartfelt message that appears during the AR experience
              </p>
              <p className="text-sm text-green-600 font-medium">
                💌 Perfect for gifts • Appears with elegant typography
              </p>
            </div>

            {livingMemoryEnabled && (
              <div className="space-y-2 md:space-y-3">
                <div className="relative">
                  <Textarea
                    placeholder="Share your thoughts, wishes, or story behind this memory..."
                    value={message}
                    onChange={(e) => onMessageChange(e.target.value)}
                    className="min-h-[80px] md:min-h-[100px] resize-none border-green-200 focus:ring-green-500 focus:border-green-500"
                    maxLength={MAX_MESSAGE_LENGTH}
                  />
                  <div className={`absolute bottom-2 right-2 text-xs ${
                    message.length > WARNING_THRESHOLD 
                      ? 'text-amber-600 font-medium' 
                      : message.length === MAX_MESSAGE_LENGTH 
                        ? 'text-red-600 font-semibold' 
                        : 'text-gray-400'
                  }`}>
                    {message.length}/{MAX_MESSAGE_LENGTH}
                  </div>
                </div>
                
                {message.length > WARNING_THRESHOLD && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                    <AlertCircle className="w-4 h-4" />
                    <span>
                      {message.length === MAX_MESSAGE_LENGTH 
                        ? 'Character limit reached!' 
                        : `${MAX_MESSAGE_LENGTH - message.length} characters remaining`}
                    </span>
                  </div>
                )}

                {message.length > 0 && (
                  <div className="bg-green-50 p-2 md:p-3 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 font-medium mb-1">Preview:</p>
                    <p className="text-green-600 italic text-sm">"{message}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomMessageCard;
