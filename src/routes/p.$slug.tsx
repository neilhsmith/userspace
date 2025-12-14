import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPlaceBySlug, getPlacePosts } from "@/server/places";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PostFeed } from "@/components/post-feed";

export const Route = createFileRoute("/p/$slug")({
  component: PlacePage,
});

function PlacePage() {
  const { slug } = Route.useParams();
  const { data: session } = useSession();
  const user = session?.user;

  const { data: place, isLoading: placeLoading } = useQuery({
    queryKey: ["place", slug],
    queryFn: () => getPlaceBySlug({ data: { slug } }),
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["placePosts", slug],
    queryFn: () => getPlacePosts({ data: { slug } }),
    enabled: !!place,
  });

  if (placeLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading place...</p>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-destructive">Place not found</p>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Place Header */}
      <div className="border-b pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{place.name}</h1>
            <p className="text-sm text-muted-foreground">p/{place.slug}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Moderated by {place.moderator.name || place.moderator.email}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {place._count.posts} {place._count.posts === 1 ? "post" : "posts"}
            </p>
          </div>
          {user && (
            <Button asChild>
              <Link to="/posts/new" search={{ place: place.slug }}>
                New Post
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Posts */}
      {postsLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      ) : posts?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No posts in this place yet</p>
            {user && (
              <Button asChild className="mt-4">
                <Link to="/posts/new" search={{ place: place.slug }}>
                  Create the first post
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <PostFeed posts={posts} currentUser={user} showPlace={false} />
      )}
    </div>
  );
}
