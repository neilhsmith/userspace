import type { Prisma } from "@/generated/prisma/client";

export const postSelect = {
  id: true,
  title: true,
  content: true,
  url: true,
  domain: true,
  score: true,
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

// Extended type that includes user's vote (when fetched with votes relation)
type PostSelectWithVote = PostSelect & {
  votes?: { value: number }[];
};

/**
 * UI-facing post preview type.
 *
 * Notes:
 * - Prisma returns `Date` for DateTime fields; serverFns should serialize to ISO strings.
 * - `userVote` is 1 (upvote), -1 (downvote), or null (no vote).
 */
export type Post = Omit<PostSelect, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  userVote: number | null;
};

export function serializePost(post: PostSelectWithVote): Post {
  const userVote = post.votes && post.votes.length > 0 ? post.votes[0].value : null;
  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    userVote,
  };
}

export function serializePosts(posts: readonly PostSelectWithVote[]): Post[] {
  return posts.map(serializePost);
}
