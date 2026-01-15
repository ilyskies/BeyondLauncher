export interface Route {
  path: string;
  component: React.ComponentType<unknown>;
  layout?: ComponentType<{ children: ReactNode }>;
  protected?: boolean;
  useFrame?: boolean;
  meta?: {
    title?: string;
    description?: string;
  };
}

export interface RouterContextValue {
  currentPath: string;
  navigate: (path: string) => void;
  params: Record<string, string>;
  query: URLSearchParams;
}
