import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronUp, ChevronDown } from "lucide-react";
import { vote } from "@/server/votes";
import { cn } from "@/lib/utils";
import type { Post } from "@/lib/post";

type VoteButtonsProps = {
  post: Post;
  isAuthenticated: boolean;
  orientation?: "vertical" | "horizontal";
  size?: "sm" | "md";
};

export function VoteButtons({
  post,
  isAuthenticated,
  orientation = "vertical",
  size = "sm",
}: VoteButtonsProps) {
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: vote,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["post", post.id] });

      // Snapshot previous values
      const previousPosts = queryClient.getQueryData<Post[]>(["posts"]);
      const previousPost = queryClient.getQueryData<Post>(["post", post.id]);

      const voteValue = variables.data.value === "up" ? 1 : -1;

      // Calculate new state
      let newUserVote: number | null;
      let scoreDelta: number;

      if (post.userVote === voteValue) {
        // Toggling off
        newUserVote = null;
        scoreDelta = -voteValue;
      } else if (post.userVote === null) {
        // New vote
        newUserVote = voteValue;
        scoreDelta = voteValue;
      } else {
        // Changing vote
        newUserVote = voteValue;
        scoreDelta = voteValue * 2;
      }

      // Optimistically update posts list
      if (previousPosts) {
        queryClient.setQueryData<Post[]>(["posts"], (old) =>
          old?.map((p) =>
            p.id === post.id
              ? { ...p, score: p.score + scoreDelta, userVote: newUserVote }
              : p
          )
        );
      }

      // Optimistically update single post
      if (previousPost) {
        queryClient.setQueryData<Post>(["post", post.id], {
          ...previousPost,
          score: previousPost.score + scoreDelta,
          userVote: newUserVote,
        });
      }

      return { previousPosts, previousPost };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(["post", post.id], context.previousPost);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
    },
  });

  const handleVote = (value: "up" | "down") => {
    if (!isAuthenticated) {
      return;
    }
    voteMutation.mutate({ data: { postId: post.id, value } });
  };

  const iconSize = size === "sm" ? "size-4" : "size-5";
  const buttonPadding = size === "sm" ? "p-0.5" : "p-1";

  return (
    <div
      className={cn(
        "flex items-center gap-0.5",
        orientation === "vertical" ? "flex-col" : "flex-row"
      )}
    >
      <button
        type="button"
        onClick={() => handleVote("up")}
        disabled={!isAuthenticated || voteMutation.isPending}
        className={cn(
          buttonPadding,
          "rounded transition-colors",
          "hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed",
          post.userVote === 1
            ? "text-orange-500"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Upvote"
      >
        <ChevronUp className={iconSize} />
      </button>

      <span
        className={cn(
          "font-medium tabular-nums text-center min-w-[2ch]",
          size === "sm" ? "text-xs" : "text-sm",
          post.userVote === 1 && "text-orange-500",
          post.userVote === -1 && "text-purple-500",
          post.userVote === null && "text-muted-foreground"
        )}
      >
        {post.score}
      </span>

      <button
        type="button"
        onClick={() => handleVote("down")}
        disabled={!isAuthenticated || voteMutation.isPending}
        className={cn(
          buttonPadding,
          "rounded transition-colors",
          "hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed",
          post.userVote === -1
            ? "text-purple-500"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Downvote"
      >
        <ChevronDown className={iconSize} />
      </button>
    </div>
  );
}
