import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { useRequest } from "nitro/context";
import {
  normalizePlaceName,
  generateSlug,
  validatePlaceName,
} from "@/lib/place";

// Zod schemas
const getPlaceSchema = z.object({
  slug: z.string(),
});

const createPlaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

// Helper to get current session from request headers
async function getSession() {
  const request = useRequest();
  return auth.api.getSession({
    headers: request.headers,
  });
}

// Get top places (random sample for now)
export const getTopPlaces = createServerFn({ method: "GET" }).handler(
  async () => {
    // SQLite doesn't have RANDOM() in ORDER BY with limit in Prisma,
    // so we fetch all and shuffle in JS (fine for small place counts)
    const allPlaces = await prisma.place.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    // Shuffle and take up to 20
    const shuffled = allPlaces.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 20);
  }
);

// Get all places (for dropdowns, etc.)
export const getAllPlaces = createServerFn({ method: "GET" }).handler(
  async () => {
    const places = await prisma.place.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return places;
  }
);

// Get a single place by slug
export const getPlaceBySlug = createServerFn({ method: "GET" }).handler(
  async (ctx: { data: unknown }) => {
    const { slug } = getPlaceSchema.parse(ctx.data);

    const place = await prisma.place.findUnique({
      where: { slug },
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return place;
  }
);

// Get posts for a place
export const getPlacePosts = createServerFn({ method: "GET" }).handler(
  async (ctx: { data: unknown }) => {
    const { slug } = getPlaceSchema.parse(ctx.data);

    const posts = await prisma.post.findMany({
      where: {
        place: {
          slug,
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        url: true,
        authorId: true,
        placeId: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        place: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return posts;
  }
);

// Create a new place
export const createPlace = createServerFn({ method: "POST" }).handler(
  async (ctx: { data: unknown }) => {
    const { name } = createPlaceSchema.parse(ctx.data);
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const normalizedName = normalizePlaceName(name);
    const slug = generateSlug(name);
    const validationError = validatePlaceName(name);

    if (validationError) {
      throw new Error(validationError);
    }

    // Check if place with same name or slug already exists
    const existingByName = await prisma.place.findUnique({
      where: { name: normalizedName },
    });

    if (existingByName) {
      throw new Error("A place with this name already exists");
    }

    const existingBySlug = await prisma.place.findUnique({
      where: { slug },
    });

    if (existingBySlug) {
      throw new Error("A place with this slug already exists");
    }

    const place = await prisma.place.create({
      data: {
        name: normalizedName,
        slug,
        moderatorId: session.user.id,
      },
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return place;
  }
);
