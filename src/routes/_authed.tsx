import { createFileRoute, Outlet } from "@tanstack/react-router";
import { authMiddleware } from "@/lib/middleware";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
  beforeLoad: async () => {
    // Auth is checked by middleware on the server
  },
  server: {
    middleware: [authMiddleware],
  },
});

function AuthedLayout() {
  return <Outlet />;
}
