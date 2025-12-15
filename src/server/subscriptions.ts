import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { useRequest } from "nitro/context";

const subscribeSchema = z.object({
  placeId: z.string(),
});

const checkSubscriptionSchema = z.object({
  placeId: z.string(),
});

async function getSession() {
  const request = useRequest();
  return auth.api.getSession({
    headers: request.headers,
  });
}

// Toggle subscription (subscribe if not subscribed, unsubscribe if subscribed)
export const toggleSubscription = createServerFn({ method: "POST" })
  .inputValidator(subscribeSchema.parse)
  .handler(async ({ data }) => {
    const { placeId } = data;
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized: Must be logged in to subscribe");
    }

    const userId = session.user.id;

    const existing = await prisma.subscription.findUnique({
      where: {
        userId_placeId: { userId, placeId },
      },
    });

    if (existing) {
      await prisma.subscription.delete({
        where: { userId_placeId: { userId, placeId } },
      });
      return { subscribed: false };
    } else {
      await prisma.subscription.create({
        data: { userId, placeId },
      });
      return { subscribed: true };
    }
  });

// Get user's subscriptions
export const getMySubscriptions = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSession().catch(() => null);

    if (!session) {
      return [];
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: session.user.id },
      include: {
        place: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        place: { name: "asc" },
      },
    });

    return subscriptions.map((s) => s.place);
  }
);

// Check if user is subscribed to a specific place
export const checkSubscription = createServerFn({ method: "GET" })
  .inputValidator(checkSubscriptionSchema.parse)
  .handler(async ({ data }) => {
    const { placeId } = data;
    const session = await getSession().catch(() => null);

    if (!session) {
      return { subscribed: false };
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        userId_placeId: { userId: session.user.id, placeId },
      },
    });

    return { subscribed: !!subscription };
  });

// Subscribe current user to all default places
export const subscribeToDefaultPlaces = createServerFn({
  method: "POST",
}).handler(async () => {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized: Must be logged in");
  }

  const userId = session.user.id;

  // Get all default places
  const defaultPlaces = await prisma.place.findMany({
    where: { isDefault: true },
    select: { id: true },
  });

  if (defaultPlaces.length === 0) {
    return { subscribed: 0 };
  }

  // Create subscriptions for each default place (skip if already exists)
  let subscribed = 0;
  for (const place of defaultPlaces) {
    const existing = await prisma.subscription.findUnique({
      where: { userId_placeId: { userId, placeId: place.id } },
    });

    if (!existing) {
      await prisma.subscription.create({
        data: { userId, placeId: place.id },
      });
      subscribed++;
    }
  }

  return { subscribed };
});
