"use client";

import {
  createContext,
  useContext,
  useState,
  ComponentType,
  ReactNode,
} from "react";
import { usePathname, useRouter as useNextRouter } from "next/navigation";
import { routes } from "./routes";
import { RouterContextValue } from "@/shared/types/router";

const RouterContext = createContext<RouterContextValue | null>(null);

export function Router({ children }: { children?: ReactNode }) {
  const pathname = usePathname();
  const nextRouter = useNextRouter();
  const [mounted] = useState(true);

  const navigate = (path: string) => {
    nextRouter.push(path);
  };

  const currentRoute = routes.find((route) => {
    if (route.path === pathname) return true;

    const routeSegments = route.path.split("/").filter(Boolean);
    const pathSegments = pathname.split("/").filter(Boolean);

    if (routeSegments.length !== pathSegments.length) return false;

    return routeSegments.every((segment, i) => {
      return segment.startsWith(":") || segment === pathSegments[i];
    });
  });

  const params: Record<string, string> = {};
  if (currentRoute) {
    const routeSegments = currentRoute.path.split("/").filter(Boolean);
    const pathSegments = pathname.split("/").filter(Boolean);

    routeSegments.forEach((segment, i) => {
      if (segment.startsWith(":")) {
        params[segment.slice(1)] = pathSegments[i];
      }
    });
  }

  const query = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );

  const contextValue: RouterContextValue = {
    currentPath: pathname,
    navigate,
    params,
    query,
  };

  if (!mounted) {
    return null;
  }

  if (!currentRoute) {
    return <div>404 - Page not found</div>;
  }

  const Component = currentRoute.component;
  const Layout = currentRoute.layout as
    | ComponentType<{ children: ReactNode }>
    | undefined;

  const content = <Component />;

  return (
    <RouterContext.Provider value={contextValue}>
      {Layout ? <Layout>{content}</Layout> : content}
      {children}
    </RouterContext.Provider>
  );
}

export function useRouterContext() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouterContext must be used within Router");
  }
  return context;
}
