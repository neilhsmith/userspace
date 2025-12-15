import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronUp, ChevronDown } from "lucide-react";
import { vote } from "@/server/votes";
import { cn } from "@/lib/utils";
import type { Post } from "@/lib/post";

type VoteDirection = "up" | "down";
type VoteVariables = {
  data: {
    postId: string;
    value: VoteDirection;
  };
};

type ListQuerySnapshot = Array<[readonly unknown[], Post[] | undefined]>;

type VoteMutationContext = {
  previousPost?: Post;
  previousPostsQueries: ListQuerySnapshot;
  previousPlacePostsQueries: ListQuerySnapshot;
  previousDomainPostsQueries: ListQuerySnapshot;
};

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

  const voteMutation = useMutation<
    Awaited<ReturnType<typeof vote>>,
    Error,
    VoteVariables,
    VoteMutationContext
  >({
    mutationFn: vote,
    onMutate: async (variables) => {
      const previousPost = queryClient.getQueryData<Post>(["post", post.id]);

      // Cancel outgoing refetches (all feeds that may contain this post)
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["posts"] }),
        queryClient.cancelQueries({ queryKey: ["placePosts"] }),
        queryClient.cancelQueries({ queryKey: ["domainPosts"] }),
        queryClient.cancelQueries({ queryKey: ["post", post.id] }),
      ]);

      // Snapshot previous values (for rollback)
      const previousPostsQueries = queryClient.getQueriesData<Post[]>({
        queryKey: ["posts"],
      });
      const previousPlacePostsQueries = queryClient.getQueriesData<Post[]>({
        queryKey: ["placePosts"],
      });
      const previousDomainPostsQueries = queryClient.getQueriesData<Post[]>({
        queryKey: ["domainPosts"],
      });

      const voteValue = variables.data.value === "up" ? 1 : -1;

      // IMPORTANT: derive "current" vote from cache, not from props.
      // Props can be stale if a previous optimistic update already ran.
      const findVoteInLists = (snapshots: ListQuerySnapshot) =>
        snapshots
          .flatMap(([, data]) => data ?? [])
          .find((p) => p.id === post.id)?.userVote;

      const currentUserVote =
        previousPost?.userVote ??
        findVoteInLists(previousPostsQueries) ??
        findVoteInLists(previousPlacePostsQueries) ??
        findVoteInLists(previousDomainPostsQueries) ??
        post.userVote;

      // Calculate new state from the cached current value
      const newUserVote = currentUserVote === voteValue ? null : voteValue;

      const applyOptimisticVote = (p: Post): Post => {
        const oldVote = p.userVote ?? 0;
        const nextVote = newUserVote ?? 0;
        const scoreDelta = nextVote - oldVote;

        return {
          ...p,
          userVote: newUserVote,
          score: p.score + scoreDelta,
        };
      };

      const updateList = (old: Post[] | undefined) =>
        old?.map((p) => (p.id === post.id ? applyOptimisticVote(p) : p));

      // Optimistically update all list feeds that may show this post
      queryClient.setQueriesData<Post[]>({ queryKey: ["posts"] }, updateList);
      queryClient.setQueriesData<Post[]>(
        { queryKey: ["placePosts"] },
        updateList
      );
      queryClient.setQueriesData<Post[]>(
        { queryKey: ["domainPosts"] },
        updateList
      );

      // Optimistically update single post
      if (previousPost) {
        queryClient.setQueryData<Post>(
          ["post", post.id],
          applyOptimisticVote(previousPost)
        );
      }

      return {
        previousPost,
        previousPostsQueries,
        previousPlacePostsQueries,
        previousDomainPostsQueries,
      };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (!context) return;

      for (const [key, data] of context.previousPostsQueries) {
        queryClient.setQueryData(key, data);
      }
      for (const [key, data] of context.previousPlacePostsQueries) {
        queryClient.setQueryData(key, data);
      }
      for (const [key, data] of context.previousDomainPostsQueries) {
        queryClient.setQueryData(key, data);
      }
      if (context.previousPost) {
        queryClient.setQueryData(["post", post.id], context.previousPost);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["placePosts"] });
      queryClient.invalidateQueries({ queryKey: ["domainPosts"] });
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
    },
  });

  const handleVote = (value: VoteDirection) => {
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
