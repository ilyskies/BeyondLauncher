import { useRouterContext } from "@/core/router/router";

export function useNavigate() {
  const { navigate } = useRouterContext();
  return navigate;
}
