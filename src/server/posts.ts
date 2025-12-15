import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canEditPost, canDeletePost } from "@/lib/rbac";
import { getDomain, isSafeHttpUrl } from "@/lib/utils";
import { postSelect, serializePost, serializePosts } from "@/lib/post";
import { useRequest } from "nitro/context";

// Zod schemas
const httpUrlSchema = z
  .string()
  .url("Invalid URL")
  .refine((value) => isSafeHttpUrl(value), {
    message: "URL must start with http:// or https://",
  });

const createPostSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    content: z.string().max(10000, "Content too long").optional(),
    url: httpUrlSchema.optional(),
    placeId: z.string().min(1, "Place is required"),
  })
  .refine((data) => data.content || data.url, {
    message: "Either content or URL is required",
  })
  .refine((data) => !(data.content && data.url), {
    message: "Cannot have both content and URL",
  });

const updatePostSchema = z
  .object({
    id: z.string(),
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    content: z.string().max(10000, "Content too long").optional(),
    url: httpUrlSchema.optional(),
  })
  .refine((data) => data.content || data.url, {
    message: "Either content or URL is required",
  })
  .refine((data) => !(data.content && data.url), {
    message: "Cannot have both content and URL",
  });

const deletePostSchema = z.object({
  id: z.string(),
});

const getPostSchema = z.object({
  id: z.string(),
});

// Helper to get current session from request headers
async function getSession() {
  const request = useRequest();
  return auth.api.getSession({
    headers: request.headers,
  });
}

// Get all posts
export const getPosts = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession().catch(() => null);
  const userId = session?.user?.id ?? null;

  const posts = await prisma.post.findMany({
    select: {
      ...postSelect,
      ...(userId && {
        votes: {
          where: { userId },
          select: { value: true },
          take: 1,
        },
      }),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return serializePosts(posts);
});

// Get a single post
export const getPost = createServerFn({ method: "GET" })
  .inputValidator(getPostSchema.parse)
  .handler(async ({ data }) => {
    const { id } = data;
    const session = await getSession().catch(() => null);
    const userId = session?.user?.id ?? null;

    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        ...postSelect,
        ...(userId && {
          votes: {
            where: { userId },
            select: { value: true },
            take: 1,
          },
        }),
      },
    });
    return post ? serializePost(post) : null;
  });

// Create a post
export const createPost = createServerFn({ method: "POST" })
  .inputValidator(createPostSchema.parse)
  .handler(async ({ data }) => {
    const { title, content, url, placeId } = data;
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Verify place exists and get slug for domain
    const place = await prisma.place.findUnique({
      where: { id: placeId },
      select: { slug: true },
    });

    if (!place) {
      throw new Error("Place not found");
    }

    const post = await prisma.post.create({
      data: {
        title,
        content: content || null,
        url: url || null,
        domain: url ? getDomain(url) : `self.${place.slug}`,
        authorId: session.user.id,
        placeId,
      },
      select: postSelect,
    });

    return serializePost(post);
  });

// Update a post
export const updatePost = createServerFn({ method: "POST" })
  .inputValidator(updatePostSchema.parse)
  .handler(async ({ data }) => {
    const { id, title, content, url } = data;
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { place: { select: { slug: true } } },
    });

    if (!existingPost) {
      throw new Error("Post not found");
    }

    if (!canEditPost(session.user, existingPost)) {
      throw new Error("Forbidden: You don't have permission to edit this post");
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        content: content || null,
        url: url || null,
        domain: url ? getDomain(url) : `self.${existingPost.place.slug}`,
      },
      select: postSelect,
    });

    return serializePost(post);
  });

// Delete a post
export const deletePost = createServerFn({ method: "POST" })
  .inputValidator(deletePostSchema.parse)
  .handler(async ({ data }) => {
    const { id } = data;
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      throw new Error("Post not found");
    }

    if (!canDeletePost(session.user, existingPost)) {
      throw new Error(
        "Forbidden: You don't have permission to delete this post"
      );
    }

    await prisma.post.delete({
      where: { id },
    });

    return { success: true };
  });

// Get posts by current user
export const getMyPosts = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
      select: {
        ...postSelect,
        votes: {
          where: { userId },
          select: { value: true },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return serializePosts(posts);
  }
);

const getPostsByDomainSchema = z.object({
  domain: z.string(),
});

// Get posts by domain
export const getPostsByDomain = createServerFn({ method: "GET" })
  .inputValidator(getPostsByDomainSchema.parse)
  .handler(async ({ data }) => {
    const { domain } = data;
    const session = await getSession().catch(() => null);
    const userId = session?.user?.id ?? null;

    const posts = await prisma.post.findMany({
      where: {
        domain,
      },
      select: {
        ...postSelect,
        ...(userId && {
          votes: {
            where: { userId },
            select: { value: true },
            take: 1,
          },
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return serializePosts(posts);
  });

// Get posts from user's subscribed places (for home feed)
export const getSubscribedPosts = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSession().catch(() => null);

    if (!session) {
      return [];
    }

    const userId = session.user.id;

    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      select: { placeId: true },
    });

    const placeIds = subscriptions.map((s) => s.placeId);

    if (placeIds.length === 0) {
      return [];
    }

    const posts = await prisma.post.findMany({
      where: {
        placeId: { in: placeIds },
      },
      select: {
        ...postSelect,
        votes: {
          where: { userId },
          select: { value: true },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return serializePosts(posts);
  }
);
