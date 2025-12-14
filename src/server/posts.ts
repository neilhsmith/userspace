import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canEditPost, canDeletePost } from "@/lib/rbac";
import { useRequest } from "nitro/context";

// Zod schemas
const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(10000, "Content too long"),
  placeId: z.string().min(1, "Place is required"),
});

const updatePostSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(10000, "Content too long"),
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
  const posts = await prisma.post.findMany({
    include: {
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
});

// Get a single post
export const getPost = createServerFn({ method: "GET" }).handler(
  async (ctx: { data: unknown }) => {
    const { id } = getPostSchema.parse(ctx.data);
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
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
    });
    return post;
  }
);

// Create a post
export const createPost = createServerFn({ method: "POST" }).handler(
  async (ctx: { data: unknown }) => {
    const { title, content, placeId } = createPostSchema.parse(ctx.data);
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Verify place exists
    const place = await prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new Error("Place not found");
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        placeId,
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
        place: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return post;
  }
);

// Update a post
export const updatePost = createServerFn({ method: "POST" }).handler(
  async (ctx: { data: unknown }) => {
    const { id, title, content } = updatePostSchema.parse(ctx.data);
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

    if (!canEditPost(session.user, existingPost)) {
      throw new Error("Forbidden: You don't have permission to edit this post");
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
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
        place: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return post;
  }
);

// Delete a post
export const deletePost = createServerFn({ method: "POST" }).handler(
  async (ctx: { data: unknown }) => {
    const { id } = deletePostSchema.parse(ctx.data);
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
  }
);

// Get posts by current user
export const getMyPosts = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const posts = await prisma.post.findMany({
      where: {
        authorId: session.user.id,
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
