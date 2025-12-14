import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { useRequest } from "nitro/context";
import {
  normalizeCommunityName,
  generateSlug,
  validateCommunityName,
} from "@/lib/community";

// Zod schemas
const getCommunitySchema = z.object({
  slug: z.string(),
});

const createCommunitySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

// Helper to get current session from request headers
async function getSession() {
  const request = useRequest();
  return auth.api.getSession({
    headers: request.headers,
  });
}

// Get top communities (random sample for now)
export const getTopCommunities = createServerFn({ method: "GET" }).handler(
  async () => {
    // SQLite doesn't have RANDOM() in ORDER BY with limit in Prisma,
    // so we fetch all and shuffle in JS (fine for small community counts)
    const allCommunities = await prisma.community.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    // Shuffle and take up to 20
    const shuffled = allCommunities.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 20);
  }
);

// Get all communities (for dropdowns, etc.)
export const getAllCommunities = createServerFn({ method: "GET" }).handler(
  async () => {
    const communities = await prisma.community.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return communities;
  }
);

// Get a single community by slug
export const getCommunityBySlug = createServerFn({ method: "GET" }).handler(
  async (ctx: { data: unknown }) => {
    const { slug } = getCommunitySchema.parse(ctx.data);

    const community = await prisma.community.findUnique({
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

    return community;
  }
);

// Get posts for a community
export const getCommunityPosts = createServerFn({ method: "GET" }).handler(
  async (ctx: { data: unknown }) => {
    const { slug } = getCommunitySchema.parse(ctx.data);

    const posts = await prisma.post.findMany({
      where: {
        community: {
          slug,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        community: {
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

// Create a new community
export const createCommunity = createServerFn({ method: "POST" }).handler(
  async (ctx: { data: unknown }) => {
    const { name } = createCommunitySchema.parse(ctx.data);
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const normalizedName = normalizeCommunityName(name);
    const slug = generateSlug(name);
    const validationError = validateCommunityName(name);

    if (validationError) {
      throw new Error(validationError);
    }

    // Check if community with same name or slug already exists
    const existingByName = await prisma.community.findUnique({
      where: { name: normalizedName },
    });

    if (existingByName) {
      throw new Error("A community with this name already exists");
    }

    const existingBySlug = await prisma.community.findUnique({
      where: { slug },
    });

    if (existingBySlug) {
      throw new Error("A community with this slug already exists");
    }

    const community = await prisma.community.create({
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

    return community;
  }
);
