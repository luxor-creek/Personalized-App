import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import PersonalizedLanding from "./pages/PersonalizedLanding";
import B2BDemo from "./pages/B2BDemo";
import TemplateEditor from "./pages/TemplateEditor";
import WineVideoTemplate from "./pages/WineVideoTemplate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WineVideoTemplate />} />
          <Route path="/police-recruitment" element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/edit/:slug" element={<TemplateEditor />} />
          <Route path="/b2b-demo" element={<B2BDemo />} />
          <Route path="/wine-video" element={<WineVideoTemplate />} />
          <Route path="/view/:token" element={<PersonalizedLanding />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
