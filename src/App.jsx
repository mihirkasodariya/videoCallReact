import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { REJECT_ROUTES, REQUIRED_ROUTES, ROUTES } from "./routes";
import { Toaster } from "react-hot-toast";
import RejectAuth from "./routes/RejectAuth";
import RequireAuth from "./routes/RequireAuth";
// import { SidebarProvider } from "./components/ui/sidebar";
// import { Moon, Sun } from "lucide-react"
// import ScrollToHash from "./lib/ScrollToHash";
// import Freshchat from "./components/FreshchatWidget/FreshchatWidget";
import React from 'react';

function AppContent() {
  return (
      <>
      <Routes>
        {/* Public routes */}
        {REJECT_ROUTES.map(({ path, component }, i) => (
          <Route key={i} path={path} element={component} />
        ))}

        {/* Protected routes */}
        <Route element={<RequireAuth />}>
          {/* <Route element={<AppLayout />}> */}
            {ROUTES.map(({ path, component }, i) => (
              <Route key={i} path={path} element={component} />
            ))}
            {REQUIRED_ROUTES.map(({ path, component }, i) => (
              <Route key={i} path={path} element={component} />
            ))}
          </Route>
        {/* </Route> */}
      </Routes>
      </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

