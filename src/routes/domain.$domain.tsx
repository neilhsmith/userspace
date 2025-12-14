import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPostsByDomain } from "@/server/posts";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { PostFeed } from "@/components/post-feed";
import type { PostPreviewPost } from "@/components/post-preview";

export const Route = createFileRoute("/domain/$domain")({
  component: DomainPage,
});

function DomainPage() {
  const { domain } = Route.useParams();
  const { data: session } = useSession();
  const user = session?.user;

  const { data: posts, isLoading } = useQuery({
    queryKey: ["domainPosts", domain],
    queryFn: () => getPostsByDomain({ data: { domain } }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{domain}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {posts?.length || 0} {posts?.length === 1 ? "post" : "posts"} from
              this domain
            </p>
          </div>
        </div>
      </div>

      {posts?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No posts from this domain yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <PostFeed
          posts={posts as PostPreviewPost[] | undefined}
          currentUser={user}
          showDomainLink={false}
        />
      )}
    </div>
  );
}
