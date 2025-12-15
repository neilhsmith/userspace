import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronUp, ChevronDown } from "lucide-react";
import { vote, getPostVote } from "@/server/votes";
import { cn } from "@/lib/utils";
import type { Post } from "@/lib/post";

type PostVoteData = {
  userVote: number | null;
  score: number;
};

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
  previousPostVote?: PostVoteData;
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

  // Subscribe directly to vote state for this post
  const { data: voteData } = useQuery({
    queryKey: ["postVote", post.id],
    queryFn: () => getPostVote({ data: { postId: post.id } }),
    initialData: { userVote: post.userVote, score: post.score },
  });

  // Use query data for display (falls back to prop if query hasn't loaded)
  // Note: Use ternary instead of ?? because userVote can be null (vote removed)
  // and we don't want to fall back to the stale prop value in that case
  const displayScore = voteData !== undefined ? voteData.score : post.score;
  const displayUserVote =
    voteData !== undefined ? voteData.userVote : post.userVote;

  const voteMutation = useMutation<
    Awaited<ReturnType<typeof vote>>,
    Error,
    VoteVariables,
    VoteMutationContext
  >({
    mutationFn: vote,
    onMutate: async (variables) => {
      const previousPost = queryClient.getQueryData<Post>(["post", post.id]);
      const previousPostVote = queryClient.getQueryData<PostVoteData>([
        "postVote",
        post.id,
      ]);

      // Cancel outgoing refetches (all feeds that may contain this post)
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["posts"] }),
        queryClient.cancelQueries({ queryKey: ["placePosts"] }),
        queryClient.cancelQueries({ queryKey: ["domainPosts"] }),
        queryClient.cancelQueries({ queryKey: ["post", post.id] }),
        queryClient.cancelQueries({ queryKey: ["postVote", post.id] }),
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
      // Prefer the dedicated postVote cache, then fall back to other sources.
      const findVoteInLists = (snapshots: ListQuerySnapshot) =>
        snapshots
          .flatMap(([, data]) => data ?? [])
          .find((p) => p.id === post.id)?.userVote;

      // IMPORTANT: treat `null` as a valid value ("no vote").
      // Only fall back when the source is truly missing (`undefined`), otherwise
      // rapid toggles can incorrectly revive stale prop state via `??` chains.
      let currentUserVote = previousPostVote?.userVote;
      if (currentUserVote === undefined)
        currentUserVote = previousPost?.userVote;
      if (currentUserVote === undefined)
        currentUserVote = findVoteInLists(previousPostsQueries);
      if (currentUserVote === undefined)
        currentUserVote = findVoteInLists(previousPlacePostsQueries);
      if (currentUserVote === undefined)
        currentUserVote = findVoteInLists(previousDomainPostsQueries);
      if (currentUserVote === undefined) currentUserVote = post.userVote;

      const currentScore =
        previousPostVote?.score ?? previousPost?.score ?? post.score;

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

      // Optimistically update the dedicated postVote query (this triggers re-render)
      const oldVoteValue = (currentUserVote ?? 0) as number;
      const newVoteValue = (newUserVote ?? 0) as number;
      const scoreDelta = newVoteValue - oldVoteValue;
      queryClient.setQueryData<PostVoteData>(["postVote", post.id], {
        userVote: newUserVote,
        score: currentScore + scoreDelta,
      });

      return {
        previousPost,
        previousPostVote,
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
      if (context.previousPostVote) {
        queryClient.setQueryData(
          ["postVote", post.id],
          context.previousPostVote
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["placePosts"] });
      queryClient.invalidateQueries({ queryKey: ["domainPosts"] });
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
      queryClient.invalidateQueries({ queryKey: ["postVote", post.id] });
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
        disabled={!isAuthenticated}
        className={cn(
          buttonPadding,
          "rounded transition-colors",
          "hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed",
          displayUserVote === 1
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
          displayUserVote === 1 && "text-orange-500",
          displayUserVote === -1 && "text-purple-500",
          displayUserVote === null && "text-muted-foreground"
        )}
      >
        {displayScore}
      </span>

      <button
        type="button"
        onClick={() => handleVote("down")}
        disabled={!isAuthenticated}
        className={cn(
          buttonPadding,
          "rounded transition-colors",
          "hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed",
          displayUserVote === -1
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
