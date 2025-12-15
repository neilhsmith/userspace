import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { auth } from "./auth";
import { isAdmin } from "./rbac";

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      const url = new URL(request.url);
      throw redirect({ to: "/login", search: { redirect: url.pathname } });
    }

    return next({
      context: {
        user: session.user,
        session: session.session,
      },
    });
  }
);

export const adminMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      const url = new URL(request.url);
      throw redirect({ to: "/login", search: { redirect: url.pathname } });
    }

    if (!isAdmin(session.user)) {
      throw redirect({ to: "/" });
    }

    return next({
      context: {
        user: session.user,
        session: session.session,
      },
    });
  }
);

// Server function middleware (throws errors instead of redirects)
export const requireAuthMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      throw new Error("Unauthorized");
    }

    return next({
      context: {
        user: session.user,
        session: session.session,
      },
    });
  }
);

export const requireAdminMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      throw new Error("Unauthorized");
    }

    if (!isAdmin(session.user)) {
      throw new Error("Forbidden");
    }

    return next({
      context: {
        user: session.user,
        session: session.session,
      },
    });
  }
);
