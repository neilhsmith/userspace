import { createFileRoute, Outlet } from "@tanstack/react-router";
import { adminMiddleware } from "@/lib/middleware";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
  beforeLoad: async () => {
    // Auth and role are checked by middleware on the server
  },
  server: {
    middleware: [adminMiddleware],
  },
});

function AdminLayout() {
  return <Outlet />;
}
