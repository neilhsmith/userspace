import { prisma } from "./prisma";

/**
 * Subscribe a user to all default places.
 * Idempotent: skips places the user is already subscribed to.
 */
export async function subscribeUserToDefaultPlaces(userId: string) {
  const defaultPlaces = await prisma.place.findMany({
    where: { isDefault: true },
    select: { id: true },
  });

  if (defaultPlaces.length === 0) {
    return { subscribed: 0 };
  }

  // Get existing subscriptions to avoid duplicates (SQLite doesn't support skipDuplicates)
  const existingSubscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      placeId: { in: defaultPlaces.map((p) => p.id) },
    },
    select: { placeId: true },
  });

  const existingPlaceIds = new Set(existingSubscriptions.map((s) => s.placeId));
  const newPlaces = defaultPlaces.filter((p) => !existingPlaceIds.has(p.id));

  if (newPlaces.length === 0) {
    return { subscribed: 0 };
  }

  await prisma.subscription.createMany({
    data: newPlaces.map((place) => ({
      userId,
      placeId: place.id,
    })),
  });

  return { subscribed: newPlaces.length };
}

