
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import SessionTimeoutWarning from "@/components/auth/SessionTimeoutWarning";
import AppErrorBoundary from "@/components/ErrorBoundary";

import "./App.css";

function App() {
  return (
    <AppErrorBoundary>
      <div className="min-h-screen">
        <SessionTimeoutWarning />
        <Outlet />
        <Toaster />
      </div>
    </AppErrorBoundary>
  );
}

export default App;
