"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/navigation";
import { useNavigate } from "@/lib/hooks/useNavigate";
import { useAuth } from "@/lib/stores/auth";
import { useSocketErrors } from "@/lib/hooks/useSocketErrors";
import { SocketBanner } from "@/components/shared/banners/socket_banner";
import { ContentArea } from "@/components/layout/content-area";
import { useErrorBanners } from "@/lib/stores/error_banner";

export default function HomeView() {
  const [activeTab, setActiveTab] = useState<"home" | "library" | "settings">(
    "home"
  );
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { add } = useErrorBanners();
  useSocketErrors();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && !user) {
      add({
        type: "error",
        title: "Session Error",
        message: "Your session data is incomplete. Please log in again.",
        autoDismiss: true,
        dismissAfter: 3000,
      });

      const timer = setTimeout(() => {
        logout();
        navigate("/login");
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, add, logout, navigate]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SocketBanner />
      <div className="flex flex-1 overflow-hidden">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <ContentArea activeTab={activeTab} user={user} />
      </div>
    </>
  );
}
