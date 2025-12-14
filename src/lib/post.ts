import type { Prisma } from "@/generated/prisma/client";

export const postSelect = {
  id: true,
  title: true,
  content: true,
  url: true,
  domain: true,
  createdAt: true,
  updatedAt: true,
  authorId: true,
  author: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  place: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.PostSelect;

type PostSelect = Prisma.PostGetPayload<{
  select: typeof postSelect;
}>;

/**
 * UI-facing post preview type.
 *
 * Notes:
 * - Prisma returns `Date` for DateTime fields; serverFns should serialize to ISO strings.
 */
export type Post = Omit<PostSelect, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export function serializePost(post: PostSelect): Post {
  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export function serializePosts(posts: readonly PostSelect[]): Post[] {
  return posts.map(serializePost);
}
