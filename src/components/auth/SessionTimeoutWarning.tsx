
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";

const SessionTimeoutWarning = () => {
  const { sessionTimeoutWarning, refreshSession, signOut } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when warning changes
  useEffect(() => {
    if (!sessionTimeoutWarning) {
      setDismissed(false);
    }
  }, [sessionTimeoutWarning]);

  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    const success = await refreshSession();
    setIsRefreshing(false);
    
    if (success) {
      setDismissed(true);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!sessionTimeoutWarning || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96">
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="space-y-3">
            <p className="font-medium">Your session will expire soon</p>
            <p className="text-sm">
              Your session will expire in a few minutes. Would you like to extend it?
            </p>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleRefreshSession}
                disabled={isRefreshing}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  'Extend Session'
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSignOut}
                className="border-orange-200 text-orange-800 hover:bg-orange-100"
              >
                Sign Out
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDismissed(true)}
                className="text-orange-600 hover:bg-orange-100"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SessionTimeoutWarning;
