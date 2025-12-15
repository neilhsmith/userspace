import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Check } from "lucide-react";
import { toggleSubscription, checkSubscription } from "@/server/subscriptions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SubscribeButtonProps = {
  placeId: string;
  placeName?: string;
  variant?: "icon" | "button";
  size?: "sm" | "md";
};

export function SubscribeButton({
  placeId,
  placeName,
  variant = "icon",
  size = "sm",
}: SubscribeButtonProps) {
  const queryClient = useQueryClient();

  const { data: subscriptionStatus } = useQuery({
    queryKey: ["subscription", placeId],
    queryFn: () => checkSubscription({ data: { placeId } }),
  });

  const isSubscribed = subscriptionStatus?.subscribed ?? false;

  const mutation = useMutation({
    mutationFn: () => toggleSubscription({ data: { placeId } }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["subscription", placeId] });
      await queryClient.cancelQueries({ queryKey: ["mySubscriptions"] });

      const previousStatus = queryClient.getQueryData<{ subscribed: boolean }>([
        "subscription",
        placeId,
      ]);

      // IMPORTANT: derive the current value from the cache, not render-time state.
      // During rapid clicks, `isSubscribed` can be stale while the cache is already updated.
      const currentSubscribed =
        previousStatus?.subscribed ?? subscriptionStatus?.subscribed ?? false;

      queryClient.setQueryData(["subscription", placeId], {
        subscribed: !currentSubscribed,
      });

      return { previousStatus };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(
          ["subscription", placeId],
          context.previousStatus
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", placeId] });
      queryClient.invalidateQueries({ queryKey: ["mySubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscribedPosts"] });
    },
  });

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          mutation.mutate();
        }}
        disabled={mutation.isPending}
        className={cn(
          "p-0.5 rounded transition-colors ml-1",
          "hover:bg-accent disabled:opacity-50",
          isSubscribed
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label={isSubscribed ? "Unsubscribe" : "Subscribe"}
        title={
          isSubscribed
            ? `Unsubscribe from ${placeName || "this place"}`
            : `Subscribe to ${placeName || "this place"}`
        }
      >
        {isSubscribed ? (
          <Check className={size === "sm" ? "size-3" : "size-4"} />
        ) : (
          <Plus className={size === "sm" ? "size-3" : "size-4"} />
        )}
      </button>
    );
  }

  return (
    <Button
      variant={isSubscribed ? "outline" : "default"}
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="w-full"
    >
      {isSubscribed ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
}
