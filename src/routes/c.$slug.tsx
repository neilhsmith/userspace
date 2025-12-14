import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCommunityBySlug, getCommunityPosts } from "@/server/communities";
import { useSession } from "@/lib/auth-client";
import { canEditPost, canDeletePost } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/c/$slug")({
  component: CommunityPage,
});

function CommunityPage() {
  const { slug } = Route.useParams();
  const { data: session } = useSession();
  const user = session?.user;

  const { data: community, isLoading: communityLoading } = useQuery({
    queryKey: ["community", slug],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: () => (getCommunityBySlug as any)({ data: { slug } }),
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["communityPosts", slug],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: () => (getCommunityPosts as any)({ data: { slug } }),
    enabled: !!community,
  });

  if (communityLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading community...</p>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-destructive">Community not found</p>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Community Header */}
      <div className="border-b pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{community.name}</h1>
            <p className="text-sm text-muted-foreground">c/{community.slug}</p>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <span>Moderated by</span>
              <Avatar className="h-5 w-5">
                <AvatarImage src={community.moderator.image || undefined} />
                <AvatarFallback className="text-xs">
                  {community.moderator.name?.charAt(0) ||
                    community.moderator.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>
                {community.moderator.name || community.moderator.email}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {community._count.posts}{" "}
              {community._count.posts === 1 ? "post" : "posts"}
            </p>
          </div>
          {user && (
            <Button asChild>
              <Link to="/posts/new" search={{ community: community.slug }}>
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
            <p className="text-muted-foreground">
              No posts in this community yet
            </p>
            {user && (
              <Button asChild className="mt-4">
                <Link to="/posts/new" search={{ community: community.slug }}>
                  Create the first post
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts?.map(
            (post: {
              id: string;
              title: string;
              content: string;
              createdAt: string;
              author: {
                id: string;
                name: string | null;
                email: string;
                image: string | null;
              };
              authorId: string;
            }) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="hover:underline">
                        <Link to="/posts/$postId" params={{ postId: post.id }}>
                          {post.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={post.author.image || undefined} />
                          <AvatarFallback className="text-xs">
                            {post.author.name?.charAt(0) ||
                              post.author.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{post.author.name || post.author.email}</span>
                        <span>·</span>
                        <span>
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </CardDescription>
                    </div>
                    {user &&
                      (canEditPost(user, post) ||
                        canDeletePost(user, post)) && (
                        <Button asChild variant="outline" size="sm">
                          <Link
                            to="/posts/$postId"
                            params={{ postId: post.id }}
                          >
                            Edit
                          </Link>
                        </Button>
                      )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">
                    {post.content}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/posts/$postId" params={{ postId: post.id }}>
                      Read more →
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
