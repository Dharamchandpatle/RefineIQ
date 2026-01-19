import AppBackground from "@/components/ui/AppBackground";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { Outlet } from "react-router-dom";
import Footer from "../Footer";
import Navbar from "../Navbar";
import { AIChatbot } from "../chatbot/AIChatbot";

const AppShell = () => {
  const { isAuthenticated } = useAuth();

  return (
    <AppBackground>
      <div className="min-h-screen flex flex-col text-slate-900 dark:text-slate-100">
        <Navbar />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
        <Footer />
        <Toaster richColors position="top-right" />
        <AIChatbot />
      </div>
    </AppBackground>
  );
};

export default AppShell;
