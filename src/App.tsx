import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Inbox from "./pages/Inbox";
import Draft from "./pages/Draft";
import AdminRun from "./pages/AdminRun";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Navigate to="/inbox" replace />} />
            <Route
              path="/onboarding"
              element={
                <AppLayout>
                  <Onboarding />
                </AppLayout>
              }
            />
            <Route
              path="/inbox"
              element={
                <AppLayout>
                  <Inbox />
                </AppLayout>
              }
            />
            <Route
              path="/draft/:matchId"
              element={
                <AppLayout>
                  <Draft />
                </AppLayout>
              }
            />
            <Route
              path="/admin/run"
              element={
                <AppLayout>
                  <AdminRun />
                </AppLayout>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
