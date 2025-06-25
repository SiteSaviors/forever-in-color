
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import SessionTimeoutWarning from "@/components/auth/SessionTimeoutWarning";

import "./App.css";

function App() {
  return (
    <div className="min-h-screen w-full">
      <SessionTimeoutWarning />
      <main className="w-full">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}

export default App;
