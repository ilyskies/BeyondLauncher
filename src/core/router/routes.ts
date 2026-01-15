import Login from "@/features/auth/views/login";
import Home from "@/features/home/views/home";
import SettingsView from "@/features/settings/views/settings";
import { Route } from "@/shared/types/router";
import AppLayout from "@/shared/components/layout/layout";
import UsernameView from "@/features/onboarding/views/username";
import OnboardingCompleteView from "@/features/onboarding/views/complete";

export const routes: Route[] = [
  {
    path: "/login",
    component: Login,
    layout: AppLayout,
    meta: { title: "Login" },
  },
  {
    path: "/home",
    component: Home,
    layout: AppLayout,
    meta: { title: "Home" },
  },
  {
    path: "/settings",
    component: SettingsView,
    layout: AppLayout,
    meta: { title: "Settings" },
  },
  {
    path: "/onboarding/username",
    component: UsernameView,
    layout: AppLayout,
    meta: { title: "Choose Username" },
  },
  {
    path: "/onboarding/complete",
    component: OnboardingCompleteView,
    layout: AppLayout,
    meta: { title: "Onboarding Complete" },
  },
];
