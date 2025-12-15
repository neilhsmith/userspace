import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";

export const getAppStats = createServerFn({ method: "GET" }).handler(
  async () => {
    const [userCount, placeCount, postCount, voteCount, subscriptionCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.place.count(),
        prisma.post.count(),
        prisma.vote.count(),
        prisma.subscription.count(),
      ]);

    return {
      userCount,
      placeCount,
      postCount,
      voteCount,
      subscriptionCount,
    };
  }
);
