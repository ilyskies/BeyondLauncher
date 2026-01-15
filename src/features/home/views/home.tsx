"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/shared/components/layout/navigation";
import { useNavigate } from "@/shared/hooks/useNavigate";
import { useAuth } from "@/features/auth/stores/auth";
import { useSocketErrors } from "@/shared/hooks/useSocketErrors";
import { SocketBanner } from "@/shared/components/common/socket-banner";
import { ContentArea } from "@/shared/components/layout/content-area";
import { useToastStore } from "@/shared/stores/toast";

export default function HomeView() {
  const [activeTab, setActiveTab] = useState<"home" | "library" | "settings">(
    "home"
  );
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { addToast } = useToastStore();
  useSocketErrors();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && !user) {
      addToast({
        type: "error",
        title: "Session Error",
        message: "Your session data is incomplete. Please log in again.",
        duration: 3000,
      });

      const timer = setTimeout(() => {
        logout();
        navigate("/login");
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, addToast, logout, navigate]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    const mainElement = document.querySelector('.flex.flex-1.overflow-hidden');
    if (mainElement) {
      mainElement.classList.add('animate-out', 'fade-out', 'zoom-out-95', 'duration-300');
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 300);
    } else {
      logout();
      navigate("/login");
    }
  };

  return (
    <>
      <SocketBanner />
      <div className="flex flex-1 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={handleLogout} />
        <ContentArea activeTab={activeTab} user={user} onTabChange={setActiveTab} />
      </div>
    </>
  );
}
