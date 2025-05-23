import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import Documents from "./pages/Documents";
import VerifySig from "./pages/VerifySig";
import DocumentView from "./pages/DocumentView";
import { WalletProvider } from "@suiet/wallet-kit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <Toaster />
        <SonnerToaster />
        <HashRouter>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-1 container mx-auto">
              <Routes>
                <Route path="/" element={<Index />} />
                {/* <Route path="/dashboard" element={<Dashboard />} /> */}
                <Route path="/documents" element={<Documents />} />
                <Route path="/verify" element={<VerifySig />} />
                <Route path="/documents/:id" element={<DocumentView />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <footer className="bg-white border-t border-gray-200 py-4">
              <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} SuiDoc Vault. Powered by Sui
                blockchain.
              </div>
            </footer>
          </div>
        </HashRouter>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
