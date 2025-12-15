import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { useRequest } from "nitro/context";

const voteSchema = z.object({
  postId: z.string(),
  value: z.enum(["up", "down"]),
});

async function getSession() {
  const request = useRequest();
  return auth.api.getSession({
    headers: request.headers,
  });
}

export const vote = createServerFn({ method: "POST" })
  .inputValidator(voteSchema.parse)
  .handler(async ({ data }) => {
    const { postId, value } = data;
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized: Must be logged in to vote");
    }

    const userId = session.user.id;
    const voteValue = value === "up" ? 1 : -1;

    // Check if user already has a vote on this post
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    // Use transaction to ensure atomic score updates
    return await prisma.$transaction(async (tx) => {
      if (existingVote) {
        if (existingVote.value === voteValue) {
          // Same vote clicked - remove the vote (toggle off)
          await tx.vote.delete({
            where: { id: existingVote.id },
          });

          // Update post score
          await tx.post.update({
            where: { id: postId },
            data: { score: { decrement: voteValue } },
          });

          return { userVote: null, scoreDelta: -voteValue };
        } else {
          // Different vote - update the vote
          await tx.vote.update({
            where: { id: existingVote.id },
            data: { value: voteValue },
          });

          // Update post score (remove old vote, add new vote)
          await tx.post.update({
            where: { id: postId },
            data: { score: { increment: voteValue * 2 } },
          });

          return { userVote: voteValue, scoreDelta: voteValue * 2 };
        }
      } else {
        // No existing vote - create new vote
        await tx.vote.create({
          data: {
            userId,
            postId,
            value: voteValue,
          },
        });

        // Update post score
        await tx.post.update({
          where: { id: postId },
          data: { score: { increment: voteValue } },
        });

        return { userVote: voteValue, scoreDelta: voteValue };
      }
    });
  });
