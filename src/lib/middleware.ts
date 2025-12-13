import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { auth } from "./auth";

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      throw redirect({ to: "/login" });
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
      throw redirect({ to: "/login" });
    }

    if (session.user.role !== "admin" && session.user.role !== "global_admin") {
      throw redirect({ to: "/dashboard" });
    }

    return next({
      context: {
        user: session.user,
        session: session.session,
      },
    });
  }
);
