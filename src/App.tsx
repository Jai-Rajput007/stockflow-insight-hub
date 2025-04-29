
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";

// Pages
import Dashboard from "@/pages/Dashboard";
import AddStock from "@/pages/AddStock";
import Sales from "@/pages/Sales";
import CashflowPage from "@/pages/CashFlow";
import Notifications from "@/pages/Notifications";
import Report from "@/pages/Report";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-stock" element={<AddStock />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/cashflow" element={<CashflowPage />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/report" element={<Report />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
