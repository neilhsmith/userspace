import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
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

// Schema for search places
const searchPlacesSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(50).default(10),
});

// Schema for toggle default
const toggleDefaultSchema = z.object({
  placeId: z.string(),
});

// Search places by name/slug (for admin search)
export const searchPlaces = createServerFn({ method: "GET" })
  .inputValidator(searchPlacesSchema.parse)
  .handler(async ({ data }) => {
    const { query, limit } = data;

    const places = await prisma.place.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { slug: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isDefault: true,
        _count: {
          select: { subscribers: true },
        },
      },
      take: limit,
      orderBy: { name: "asc" },
    });

    return places;
  });

// Get all default places
export const getDefaultPlaces = createServerFn({ method: "GET" }).handler(
  async () => {
    const places = await prisma.place.findMany({
      where: { isDefault: true },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { subscribers: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return places;
  }
);

// Set a place as default
export const setPlaceDefault = createServerFn({ method: "POST" })
  .inputValidator(toggleDefaultSchema.parse)
  .handler(async ({ data }) => {
    const { placeId } = data;

    const place = await prisma.place.update({
      where: { id: placeId },
      data: { isDefault: true },
      select: {
        id: true,
        name: true,
        slug: true,
        isDefault: true,
      },
    });

    return place;
  });

// Remove a place from defaults
export const removePlaceDefault = createServerFn({ method: "POST" })
  .inputValidator(toggleDefaultSchema.parse)
  .handler(async ({ data }) => {
    const { placeId } = data;

    const place = await prisma.place.update({
      where: { id: placeId },
      data: { isDefault: false },
      select: {
        id: true,
        name: true,
        slug: true,
        isDefault: true,
      },
    });

    return place;
  });
