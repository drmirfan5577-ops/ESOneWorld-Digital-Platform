import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import Index from "./pages/Index.tsx";
import Browse from "./pages/browse/page.tsx";
import PlatformDetail from "./pages/platform/page.tsx";
import Favorites from "./pages/favorites/page.tsx";
import Templates from "./pages/templates/page.tsx";
import Android from "./pages/android/page.tsx";
import NotFound from "./pages/NotFound.tsx";
import { useServiceWorker } from "@/hooks/use-service-worker.ts";
import AIAssistant from "./components/AIAssistant.tsx";

export default function App() {
  useServiceWorker();
  return (
    <DefaultProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/platform/:slug" element={<PlatformDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/android" element={<Android />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* AI Appify Partner — all 5 models, visible on every page */}
        <AIAssistant />
      </BrowserRouter>
    </DefaultProviders>
  );
}
