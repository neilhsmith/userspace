import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PostFeed } from "@/components/post-feed";
import type { PostPreviewPost } from "@/components/post-preview";
import { useSession } from "@/lib/auth-client";
import { getPosts } from "@/server/posts";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data: session } = useSession();
  const user = session?.user;

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => getPosts(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recent Posts</h1>
          <p className="text-muted-foreground">
            Browse the latest posts from the places
          </p>
        </div>
        {session && (
          <Button asChild>
            <Link to="/posts/new">New Post</Link>
          </Button>
        )}
      </div>

      {postsLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      ) : posts?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No posts yet</p>
          </CardContent>
        </Card>
      ) : (
        <PostFeed
          posts={posts as PostPreviewPost[] | undefined}
          currentUser={user}
        />
      )}
    </div>
  );
}
