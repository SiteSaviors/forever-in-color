
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import SessionTimeoutWarning from "@/components/auth/SessionTimeoutWarning";

import "./App.css";

function App() {
  return (
    <div className="min-h-screen">
      <SessionTimeoutWarning />
      <Outlet />
      <Toaster />
    </div>
  );
}

export default App;
