
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import SessionTimeoutWarning from "@/components/auth/SessionTimeoutWarning";
import RouteSuspenseFallback from "@/components/layout/RouteSuspenseFallback";

import "./App.css";

function App() {
  return (
    <div className="min-h-screen">
      <SessionTimeoutWarning />
      <Suspense fallback={<RouteSuspenseFallback />}>
        <Outlet />
      </Suspense>
      <Toaster />
    </div>
  );
}

export default App;
