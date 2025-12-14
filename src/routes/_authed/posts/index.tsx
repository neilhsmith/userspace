import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/server/posts";
import { useSession } from "@/lib/auth-client";
import { canEditPost, canDeletePost } from "@/lib/rbac";
import { safeHref } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authed/posts/")({
  component: PostsPage,
});

function PostsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: () => getPosts(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">Failed to load posts</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">Browse and manage posts</p>
        </div>
        <Button asChild>
          <Link to="/posts/new">New Post</Link>
        </Button>
      </div>

      {posts?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No posts yet</p>
            <Button asChild>
              <Link to="/posts/new">Create your first post</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts?.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="hover:underline">
                      {post.url ? (
                        <>
                          <a
                            href={safeHref(post.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {post.title}
                          </a>
                          <Link
                            to="/domain/$domain"
                            params={{ domain: post.domain }}
                            className="text-sm font-normal text-muted-foreground ml-2 hover:underline"
                          >
                            ({post.domain})
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/posts/$postId"
                            params={{ postId: post.id }}
                          >
                            {post.title}
                          </Link>
                          <Link
                            to="/p/$slug"
                            params={{ slug: post.place.slug }}
                            className="text-sm font-normal text-muted-foreground ml-2 hover:underline"
                          >
                            ({post.domain})
                          </Link>
                        </>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <Link
                        to="/p/$slug"
                        params={{ slug: post.place.slug }}
                        className="text-xs px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 transition-colors"
                      >
                        {post.place.name}
                      </Link>
                      <span>·</span>
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
                    (canEditPost(user, post) || canDeletePost(user, post)) && (
                      <Button asChild variant="outline" size="sm">
                        <Link to="/posts/$postId" params={{ postId: post.id }}>
                          Edit
                        </Link>
                      </Button>
                    )}
                </div>
              </CardHeader>
              {post.content && (
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">
                    {post.content}
                  </p>
                </CardContent>
              )}
              <CardFooter>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/posts/$postId" params={{ postId: post.id }}>
                    Read more →
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
