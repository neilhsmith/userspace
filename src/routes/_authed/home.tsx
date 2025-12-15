import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostFeed } from "@/components/post-feed";
import { FeedLayout } from "@/components/feed-layout";
import { SidebarPlaceholder } from "@/components/sidebar-placeholder";
import { useSession } from "@/lib/auth-client";
import { getSubscribedPosts } from "@/server/posts";
import { getPopularPlaces } from "@/server/places";
import { SubscribeButton } from "@/components/subscribe-button";

export const Route = createFileRoute("/_authed/home")({
  loader: async ({ context }) => {
    const { queryClient } = context;
    await queryClient.ensureQueryData({
      queryKey: ["subscribedPosts"],
      queryFn: () => getSubscribedPosts(),
    });
  },
  component: HomePage,
});

function HomePage() {
  const { data: session } = useSession();
  const user = session?.user;

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["subscribedPosts"],
    queryFn: () => getSubscribedPosts(),
  });

  const { data: popularPlaces } = useQuery({
    queryKey: ["popularPlaces"],
    queryFn: () => getPopularPlaces(),
    enabled: !postsLoading && posts?.length === 0,
  });

  return (
    <FeedLayout sidebar={<SidebarPlaceholder />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Feed</h1>
            <p className="text-muted-foreground">
              Posts from your subscribed places
            </p>
          </div>
          <Button asChild>
            <Link to="/posts/new">New Post</Link>
          </Button>
        </div>

        {postsLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : posts?.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No posts yet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Subscribe to some places to see their posts here.
              </p>
              {popularPlaces && popularPlaces.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Popular places to subscribe:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popularPlaces.map((place) => (
                      <div
                        key={place.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-muted/50"
                      >
                        <Link
                          to="/p/$slug"
                          params={{ slug: place.slug }}
                          className="text-sm hover:underline"
                        >
                          {place.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          ({place._count.posts} posts)
                        </span>
                        <SubscribeButton
                          placeId={place.id}
                          placeName={place.name}
                          variant="icon"
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button asChild variant="outline">
                <Link to="/">Browse all posts</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <PostFeed posts={posts} currentUser={user} />
        )}
      </div>
    </FeedLayout>
  );
}
