
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

const LoadingState = ({ 
  message = "Loading...", 
  className = "" 
}: LoadingStateProps) => {
  return (
    <Card className={`border-gray-200 bg-gray-50 ${className}`}>
      <CardContent className="p-6 text-center">
        <Loader2 className="w-8 h-8 text-purple-500 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">{message}</p>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
